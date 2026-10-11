'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  { icon: '💻', text: 'Show me hackathons' },
  { icon: '📅', text: 'Upcoming events this week' },
  { icon: '🎓', text: 'Any scholarships available?' },
  { icon: '🌆', text: 'Events in Lahore' },
]

export default function AIChatbot() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasPulse, setHasPulse] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setHasPulse(false)
    }
  }, [open])

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "Hey! 👋 I'm your Campus Assistant. Ask me anything about events, hackathons, workshops, or opportunities happening at your university!\n\nTry: \"Show me upcoming hackathons\" or \"Events in Lahore this week\"",
          timestamp: new Date(),
        },
      ])
    }
  }, [messages.length])

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || loading) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      // Prepare history (exclude welcome)
      const history = updatedMessages
        .filter((m) => m.id !== 'welcome')
        .slice(0, -1) // exclude the message we just added
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history,
        }),
      })

      const result = await res.json()

      if (result.success) {
        // Extract post IDs from response to make clickable
        const reply = result.reply

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: reply,
            timestamp: new Date(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content:
              "Sorry, I'm having trouble right now. Please try again in a moment. 😔",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Network error. Please check your connection. 🌐",
          timestamp: new Date(),
        },
      ])
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Chat cleared! 🧹 What would you like to know? Ask me about events, hackathons, or opportunities.",
        timestamp: new Date(),
      },
    ])
  }

  // Render message with markdown-like formatting
  const renderMessage = (content: string) => {
    // Split by lines
    const lines = content.split('\n')

    return lines.map((line, idx) => {
      // Bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g
      const parts: (string | JSX.Element)[] = []
      let lastIndex = 0
      let match

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index))
        }
        parts.push(
          <strong key={`bold-${idx}-${match.index}`} className="font-bold">
            {match[1]}
          </strong>
        )
        lastIndex = match.index + match[0].length
      }

      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex))
      }

      return (
        <span key={idx}>
          {parts.length > 0 ? parts : line}
          {idx < lines.length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 hover:scale-110 transition-all flex items-center justify-center ${
          hasPulse ? 'animate-bounce' : ''
        }`}
        aria-label="Open AI assistant"
      >
        {open ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <>
            <span className="text-2xl">🤖</span>
            {hasPulse && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-pulse ring-2 ring-white"></span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[32rem] max-h-[calc(100vh-8rem)] rounded-3xl theme-card shadow-2xl ring-1 ring-black/5 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  Campus Assistant
                </h3>
                <p className="text-[10px] text-white/80 leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  AI-powered · Online
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm shrink-0">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                      : 'theme-input rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {renderMessage(msg.content)}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm shrink-0">
                  🤖
                </div>
                <div className="theme-input px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts (show only at start) */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2 shrink-0">
              <p className="text-[10px] uppercase tracking-wider theme-text-muted font-bold mb-2">
                Try asking
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSend(prompt.text)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-medium theme-input hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-1"
                  >
                    <span>{prompt.icon}</span>
                    <span className="theme-text-primary">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div
            className="p-3 border-t shrink-0"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={loading}
                maxLength={500}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl theme-input outline-none transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                aria-label="Send message"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] theme-text-muted mt-2 text-center">
              Powered by AI · May not be 100% accurate
            </p>
          </div>
        </div>
      )}
    </>
  )
}