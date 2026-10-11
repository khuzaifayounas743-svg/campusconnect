export default function Loading() {
  return (
    <div className="min-h-screen theme-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-float">
          <span className="text-3xl">🎓</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
        <p className="text-xs theme-text-muted mt-3">Loading...</p>
      </div>
    </div>
  )
}