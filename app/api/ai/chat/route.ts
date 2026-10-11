import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// 🔑 Fallback responses (agar AI call fail ho)
const CREATOR_KEYWORDS = [
  'who made',
  'who made this',
  'who created',
  'who built',
  'who developed',
  'who is the developer',
  'who is the creator',
  'kisne banaya',
  'kisne banai',
  'kis ne banaya',
  'kis ne banai',
  'banane wala',
  'developer kaun',
  'creator kaun',
  'made this app',
  'made this website',
  'made campusconnect',
  'built this',
]

const CREATOR_RESPONSE = `CampusConnect ko **Software Engineer Khuzaifa Younas** ne banayi hai. 🎓

Ye ek talented software engineer hain jinhone ye platform Pakistani students ke liye banaya hai — taake har university ka event, hackathon, workshop, aur opportunity ek hi jagah mil sake.

Unka vision tha ke students ko WhatsApp groups aur random Facebook pages me events dhundhne ki zaroorat na pade. Ek centralized, beautiful, aur AI-powered platform ho — aur wohi CampusConnect hai! ✨`

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // 🔑 Creator question → direct response (AI bypass)
    const lowerMessage = message.toLowerCase().trim()
    const isCreatorQuestion = CREATOR_KEYWORDS.some((keyword) =>
      lowerMessage.includes(keyword)
    )

    if (isCreatorQuestion) {
      return NextResponse.json({
        success: true,
        reply: CREATOR_RESPONSE,
      })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        success: true,
        reply:
          "Sorry, I'm not configured properly right now. Please contact support. 😔",
      })
    }

    const supabase = await createClient()

    // Get recent posts for context
    const { data: recentPosts } = await supabase
      .from('posts')
      .select(
        'id, title, description, category, city, university, event_date, tags'
      )
      .order('created_at', { ascending: false })
      .limit(30)

    // Build context (Post ID internal only — AI ko dikhata hai for matching, but prompt me strictly forbidden to output)
    const postsContext = (recentPosts || [])
      .map((p, i) => {
        const parts = [`${i + 1}. ${p.title}`]
        if (p.category) parts.push(`Category: ${p.category}`)
        if (p.city) parts.push(`City: ${p.city}`)
        if (p.university) parts.push(`University: ${p.university}`)
        if (p.event_date)
          parts.push(`Date: ${new Date(p.event_date).toLocaleDateString()}`)
        if (p.description)
          parts.push(`Description: ${p.description.slice(0, 150)}`)
        if (p.tags && p.tags.length > 0)
          parts.push(`Tags: ${p.tags.join(', ')}`)
        return parts.join(' | ')
      })
      .join('\n\n')

    const systemPrompt = `You are "Campus Assistant", a friendly, helpful, and versatile AI assistant for CampusConnect — a Pakistani university events platform.

## YOUR CAPABILITIES:

### 1. CampusConnect Help (Primary)
- Help students find events, hackathons, workshops, scholarships, sports, cultural programs
- Filter by city (Lahore, Karachi, Islamabad, etc.), university (UET, LUMS, NUST, FAST, etc.), category, or date
- Explain how to use the app (post creation, following, notifications)
- Suggest events based on interests

### 2. General Knowledge (Secondary)
Answer ANY general question:
- Tech, coding, AI, science, math
- Study tips, career advice
- Programming help
- Urdu/English translations
- Jokes, motivation, friendly conversation

### 3. About the Creator
If asked "Who made this app?" / "Kisne banaya?" → Reply:
"CampusConnect ko Software Engineer Khuzaifa Younas ne banayi hai. Ye ek talented developer hain jinhone ye platform students ke liye banaya hai. 🎓✨"

## RECENT POSTS ON CAMPUSCONNECT:
${postsContext || 'No posts yet in the platform.'}

## 🚨 CRITICAL RULES (MUST FOLLOW):

### Rule 1: NEVER SHOW POST IDs
- NEVER output technical IDs like "3018f501-4ec9-4c96-850f-c90cc59373ae" or any UUID
- NEVER say "Post ID" in your response
- These are internal identifiers. Users don't need them!

### Rule 2: Event Response Format
When listing events, use this EXACT format:

Ye rahe kuch [category] CampusConnect pe:

• **[Event Title]**
  📍 [City] | 🎓 [University] | 📅 [Date]
  [1-line description]

• **[Event Title 2]**
  📍 [City] | 🎓 [University] | 📅 [Date]
  [1-line description]

Feed me scroll karo ya search bar me "[category]" likho — sab milega! ✨

### Rule 3: If No Events Match
Say honestly: "Filhal koi [category] event nahi hai. Kya aap [alternative] dekhna chahenge?"

### Rule 4: General Questions
Answer helpfully and concisely. Keep it friendly and short.

## LANGUAGE MATCH:
- English → Reply in English
- Urdu → Reply in Urdu
- Roman Urdu → Reply in Roman Urdu
- Mixed → Reply in mixed

## TONE:
- Friendly, warm, encouraging
- Use emojis naturally (don't overdo)
- Be conversational, not robotic

## LENGTH:
- Simple: 1-3 sentences
- Events: List with format above
- Complex: Bullet points
- General: 2-4 sentences

## EXAMPLES:

User: "Show me hackathons"
You: "Ye rahe kuch hackathons CampusConnect pe:

• **National Hackathon 2025**
  📍 Lahore | 🎓 UET | 📅 Dec 15
  Big coding competition with cash prizes

• **AI Challenge**
  📍 Karachi | 🎓 NUST | 📅 Dec 20
  AI/ML focused hackathon

Feed me scroll karke ye events dhundh sakte ho! 💻"

User: "Python kaise seekhun?"
You: "Python seekhne ke liye best approach:
1. Basics (variables, loops, functions)
2. Daily 30 min practice
3. Projects banao (calculator, to-do app)
4. Free resources: freeCodeCamp, CS50, YouTube

Kya aap koi specific area explore karna chahte hain? 🐍"

User: "Ye app kisne banai?"
You: "CampusConnect ko **Software Engineer Khuzaifa Younas** ne banayi hai. Ye ek talented developer hain jinhone ye platform Pakistani students ke liye banaya hai. 🎓✨"

User: "Events in Lahore"
You: "Lahore ke events:

• **[Event Title]**
  📍 Lahore | 🎓 [University] | 📅 [Date]
  [Description]

Feed me filter karke dekh sakte ho! 🌆"

Now respond to the user's message.`

    // Build messages array with history
    const messages: any[] = [{ role: 'system', content: systemPrompt }]

    // Add conversation history (last 6 messages)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6)
      recentHistory.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          })
        }
      })
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // 🔑 AI Call with try-catch
    try {
      const completion = await groq.chat.completions.create({
        messages,
        model: 'openai/gpt-oss-120b',
        temperature: 0.7,
        max_tokens: 600,
      })

      let response =
        completion.choices[0]?.message?.content ||
        "Sorry, I couldn't generate a response. Please try again."

      // 🔑 Safety net: strip any Post IDs or UUIDs that slip through
      // Remove UUID patterns
      response = response.replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        ''
      )
      // Remove "Post ID: xxx" patterns
      response = response.replace(/Post ID[:\s]*[^\s]*/gi, '')
      // Clean up any leftover double spaces or punctuation artifacts
      response = response.replace(/\s+/g, ' ').trim()

      return NextResponse.json({
        success: true,
        reply: response,
      })
    } catch (aiError: any) {
      console.error('Groq API error:', aiError)

      let fallbackMessage =
        "Sorry, I'm having trouble connecting to my brain right now. 🧠😅 Please try again in a moment."

      if (aiError?.status === 429) {
        fallbackMessage =
          "I'm getting too many requests right now! 🚦 Please wait a few seconds and try again."
      } else if (aiError?.status === 401) {
        fallbackMessage =
          "Authentication issue. Please contact the developer. 🔧"
      } else if (aiError?.status === 404) {
        fallbackMessage =
          "My AI model is temporarily unavailable. Please try again later. 🤖"
      }

      return NextResponse.json({
        success: true,
        reply: fallbackMessage,
      })
    }
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      success: true,
      reply:
        "Oops! Something went wrong. 😔 Please refresh the page and try again.",
    })
  }
}