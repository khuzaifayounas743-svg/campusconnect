import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key missing' },
        { status: 500 }
      )
    }

    let prompt = ''
    let systemPrompt = ''

    if (action === 'generate_all') {
      systemPrompt = `You are a helpful assistant for a university event platform called CampusConnect.
User will give you a short idea. Generate a complete post in JSON.
Respond ONLY with valid JSON, no markdown, no backticks:
{
  "title": "Catchy short title (max 80 chars)",
  "description": "Detailed description (2-3 paragraphs, engaging, mix of English and Urdu if natural)",
  "category": "one of: general, event, hackathon, workshop, seminar, sports, cultural, opportunity, announcement",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}`
      prompt = `User's idea: "${data.idea}"`
    } else if (action === 'improve_description') {
      systemPrompt = `You are a writing assistant. Improve the given text to make it more engaging, clear, and professional. Keep the same language (Urdu/English mix). Return ONLY the improved text, no explanations, no quotes, no markdown.`
      prompt = `Improve this: "${data.description}"`
    } else if (action === 'suggest_title') {
      systemPrompt = `Generate 1 catchy title (max 80 chars) based on the description. Return ONLY the title text, no quotes, no explanation, no markdown.`
      prompt = `Description: "${data.description}"`
    } else if (action === 'suggest_tags') {
      systemPrompt = `Generate 4 relevant tags (lowercase, no #) based on the post. Return ONLY a JSON array of strings. Example: ["coding", "ai", "networking", "free"]`
      prompt = `Title: "${data.title}"
Description: "${data.description}"`
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 1024,
    })

    const response = completion.choices[0]?.message?.content || ''

    if (action === 'generate_all') {
      try {
        const clean = response.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(clean)
        return NextResponse.json({ success: true, data: parsed })
      } catch {
        return NextResponse.json(
          { error: 'AI response parse nahi hua', raw: response },
          { status: 500 }
        )
      }
    }

    if (action === 'suggest_tags') {
      try {
        const clean = response.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(clean)
        return NextResponse.json({ success: true, data: parsed })
      } catch {
        const tags = response
          .replace(/[[\]"']/g, '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
        return NextResponse.json({ success: true, data: tags })
      }
    }

    return NextResponse.json({ success: true, data: response.trim() })
  } catch (error: any) {
    console.error('Groq API error:', error)
    return NextResponse.json(
      { error: error.message || 'AI request failed' },
      { status: 500 }
    )
  }
}