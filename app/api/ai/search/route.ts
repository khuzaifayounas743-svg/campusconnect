import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key missing' },
        { status: 500 }
      )
    }

    // 🔑 STEP 1: Use AI to parse the query into structured filters
    const systemPrompt = `You are a search query parser for CampusConnect — a Pakistani university events platform.

User will provide a search query in English/Urdu/Roman Urdu. Extract structured filters in JSON format.

Return ONLY valid JSON, no markdown, no extra text:

{
  "search_type": "posts" | "users" | "both",
  "keywords": ["keyword1", "keyword2"],
  "category": "event" | "hackathon" | "workshop" | "seminar" | "sports" | "cultural" | "opportunity" | "announcement" | null,
  "city": "Lahore" | "Karachi" | "Islamabad" | null,
  "university": "COMSATS" | "NUST" | "FAST" | "LUMS" | "UET" | null,
  "program": "BS Computer Science" | "BS Electrical Engineering" | null,
  "date_filter": "today" | "tomorrow" | "this_week" | "this_month" | null,
  "min_semester": null
}

Examples:

Query: "Show me hackathons in Lahore"
→ {"search_type":"posts","keywords":["hackathon"],"category":"hackathon","city":"Lahore","university":null,"program":null,"date_filter":null}

Query: "Upcoming events at COMSATS"
→ {"search_type":"posts","keywords":["events"],"category":"event","city":null,"university":"COMSATS","program":null,"date_filter":null}

Query: "Khuzaifa"
→ {"search_type":"users","keywords":["Khuzaifa"],"category":null,"city":null,"university":null,"program":null,"date_filter":null}

Query: "BS CS students"
→ {"search_type":"users","keywords":[],"category":null,"city":null,"university":null,"program":"BS Computer Science","date_filter":null}

Query: "workshops this week"
→ {"search_type":"posts","keywords":["workshop"],"category":"workshop","city":null,"university":null,"program":null,"date_filter":"this_week"}

Query: "internships"
→ {"search_type":"posts","keywords":["internship"],"category":"opportunity","city":null,"university":null,"program":null,"date_filter":null}

Query: "sports events at NUST"
→ {"search_type":"posts","keywords":["sports"],"category":"sports","city":null,"university":"NUST","program":null,"date_filter":null}

Now parse this query and return ONLY the JSON:
Query: "${query}"`

    let filters: any = {
      search_type: 'both',
      keywords: [query.trim()],
      category: null,
      city: null,
      university: null,
      program: null,
      date_filter: null,
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: systemPrompt }],
        model: 'openai/gpt-oss-120b',
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      })

      const rawResponse = completion.choices[0]?.message?.content || '{}'
      const cleanResponse = rawResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

      const parsed = JSON.parse(cleanResponse)
      filters = { ...filters, ...parsed }
    } catch (aiError) {
      console.error('AI parse error (using fallback):', aiError)
      // Fallback: use raw keywords
    }

    // 🔑 STEP 2: Build database queries based on filters
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    const results: {
      users: any[]
      posts: any[]
      ai_interpretation: string
    } = {
      users: [],
      posts: [],
      ai_interpretation: '',
    }

    // Build AI interpretation text
    const interpretationParts = []
    if (filters.category) interpretationParts.push(`Category: ${filters.category}`)
    if (filters.city) interpretationParts.push(`City: ${filters.city}`)
    if (filters.university) interpretationParts.push(`University: ${filters.university}`)
    if (filters.program) interpretationParts.push(`Program: ${filters.program}`)
    if (filters.date_filter) interpretationParts.push(`Time: ${filters.date_filter}`)
    if (filters.keywords?.length > 0)
      interpretationParts.push(`Keywords: ${filters.keywords.join(', ')}`)

    results.ai_interpretation = interpretationParts.join(' · ')

    // 🔑 STEP 3: Search POSTS (if applicable)
    if (filters.search_type === 'posts' || filters.search_type === 'both') {
      let postsQuery = supabase
        .from('posts')
        .select(`*, likes(count), comments(count)`)
        .order('created_at', { ascending: false })
        .limit(20)

      // Category filter
      if (filters.category) {
        postsQuery = postsQuery.eq('category', filters.category)
      }

      // City filter
      if (filters.city) {
        postsQuery = postsQuery.ilike('city', `%${filters.city}%`)
      }

      // University filter — match post.university OR author university
      if (filters.university) {
        postsQuery = postsQuery.or(
          `university.ilike.%${filters.university}%,author_university.ilike.%${filters.university}%`
        )
      }

      // Date filter
      if (filters.date_filter) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        let startDate = today
        let endDate = new Date(today)

        if (filters.date_filter === 'today') {
          endDate.setDate(endDate.getDate() + 1)
        } else if (filters.date_filter === 'tomorrow') {
          startDate.setDate(startDate.getDate() + 1)
          endDate.setDate(endDate.getDate() + 2)
        } else if (filters.date_filter === 'this_week') {
          endDate.setDate(endDate.getDate() + 7)
        } else if (filters.date_filter === 'this_month') {
          endDate.setDate(endDate.getDate() + 30)
        }

        postsQuery = postsQuery
          .gte('event_date', startDate.toISOString())
          .lt('event_date', endDate.toISOString())
      }

      const { data: postsData } = await postsQuery

      // Keyword filter (client-side since Supabase doesn't support full-text easily)
      let filteredPosts = postsData || []
      if (filters.keywords && filters.keywords.length > 0) {
        const keywordsLower = filters.keywords.map((k: string) =>
          k.toLowerCase()
        )
        filteredPosts = filteredPosts.filter((post) => {
          const searchText = `${post.title} ${post.description} ${(post.tags || []).join(' ')} ${post.category}`.toLowerCase()
          return keywordsLower.some((kw: string) => searchText.includes(kw))
        })
      }

      results.posts = filteredPosts
    }

    // 🔑 STEP 4: Search USERS (if applicable)
    if (filters.search_type === 'users' || filters.search_type === 'both') {
      let usersQuery = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, university, program, semester')
        .limit(20)

      // Exclude current user
      if (currentUser) {
        usersQuery = usersQuery.neq('id', currentUser.id)
      }

      // University filter
      if (filters.university) {
        usersQuery = usersQuery.ilike('university', `%${filters.university}%`)
      }

      // Program filter
      if (filters.program) {
        usersQuery = usersQuery.ilike('program', `%${filters.program}%`)
      }

      // Keywords — search in name
      if (filters.keywords && filters.keywords.length > 0) {
        const keywordFilter = filters.keywords
          .map((k: string) => `full_name.ilike.%${k}%`)
          .join(',')
        usersQuery = usersQuery.or(keywordFilter)
      }

      const { data: usersData } = await usersQuery
      results.users = usersData || []
    }

    return NextResponse.json({
      success: true,
      ...results,
      filters,
    })
  } catch (error: any) {
    console.error('AI Search error:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}