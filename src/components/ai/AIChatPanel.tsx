import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuthStore, useAIStore } from '@/lib/store'
import {
  Send, Sparkles, X, Bot, User, Loader2, ChevronDown,
  Paperclip, ArrowRight, Minimize2, Maximize2, Check, Smile
} from 'lucide-react'
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent } from '@/components/ui/emoji-picker'

function useAutoResizeTextarea(minHeight: number, maxHeight?: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const adjustHeight = useCallback((reset?: boolean) => {
    const textarea = textareaRef.current
    if (!textarea) return
    if (reset) { textarea.style.height = `${minHeight}px`; return }
    textarea.style.height = `${minHeight}px`
    const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY))
    textarea.style.height = `${newHeight}px`
  }, [minHeight, maxHeight])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) textarea.style.height = `${minHeight}px`
  }, [minHeight])

  return { textareaRef, adjustHeight }
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-orange-400 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

interface AIChatPanelProps {
  isOpen?: boolean
  onClose?: () => void
  context?: string
}

const OPENAI_ICON = (
  <>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 260" className="w-4 h-4 dark:hidden block"><path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" /></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 260" className="w-4 h-4 hidden dark:block"><path fill="#fff" d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" /></svg>
  </>
)

const GEMINI_ICON = (
  <svg height="1em" className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gem-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%"><stop offset="0%" stopColor="#1C7DFF" /><stop offset="52.021%" stopColor="#1C69FF" /><stop offset="100%" stopColor="#F0DCD6" /></linearGradient></defs>
    <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" fill="url(#gem-fill)" fillRule="nonzero" />
  </svg>
)

const CLAUDE_ICON = (
  <>
    <svg fill="#000" fillRule="evenodd" className="w-4 h-4 dark:hidden block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" /></svg>
    <svg fill="#fff" fillRule="evenodd" className="w-4 h-4 hidden dark:block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" /></svg>
  </>
)

const AI_MODELS = [
  'Gemini 2.0 Flash',
  'GPT-OSS 120B (Cerebras)',
  'Llama 3.1 8B (Cerebras)',
  'Qwen 3 235B (Cerebras)',
  'ZAI GLM 4.7 (Cerebras)',
  'Llama 3.3 70B (Groq)',
  'Llama 4 Scout (Groq)',
  'Groq Compound',
]
const MODEL_IDS: Record<string, string> = {
  'Gemini 2.0 Flash': 'gemini',
  'GPT-OSS 120B (Cerebras)': 'gpt-oss-120b',
  'Llama 3.1 8B (Cerebras)': 'llama3.1-8b',
  'Qwen 3 235B (Cerebras)': 'qwen-3-235b',
  'ZAI GLM 4.7 (Cerebras)': 'zai-glm-4.7',
  'Llama 3.3 70B (Groq)': 'llama-3.3-70b',
  'Llama 4 Scout (Groq)': 'llama-4-scout',
  'Groq Compound': 'compound',
}
const MODEL_ICONS: Record<string, React.ReactNode> = {
  'Gemini 2.0 Flash': GEMINI_ICON,
  'GPT-OSS 120B (Cerebras)': OPENAI_ICON,
  'Llama 3.1 8B (Cerebras)': OPENAI_ICON,
  'Qwen 3 235B (Cerebras)': OPENAI_ICON,
  'ZAI GLM 4.7 (Cerebras)': OPENAI_ICON,
  'Llama 3.3 70B (Groq)': OPENAI_ICON,
  'Llama 4 Scout (Groq)': OPENAI_ICON,
  'Groq Compound': OPENAI_ICON,
}

export default function AIChatPanel({ isOpen = true, onClose, context }: AIChatPanelProps) {
  const { user } = useAuthStore()
  const { chatHistory, addMessage, isThinking, setThinking } = useAIStore()
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedModel, setSelectedModel] = useState('Gemini 2.0 Flash')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(72, 300)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isEmbedded = onClose === undefined

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [chatHistory, isThinking])

  const handleSend = async () => {
    if (!input.trim() || isThinking) return
    const message = input.trim()
    setInput('')
    adjustHeight(true)
    addMessage('user', message)
    setThinking(true)

    try {
      const modelId = MODEL_IDS[selectedModel] || 'gemini'
      const systemPrompt = `You are Cornerstone AI, a helpful school assistant for a ${user?.role || 'student'}. Be concise, friendly, and educational. Context: ${context || 'general school help'}`
      const messages = chatHistory.map(m => ({ role: m.role, content: m.content }))
      messages.push({ role: 'user', content: message })
      const data = await api.chatAI(messages, modelId, systemPrompt)
      const responseText =
        data?.response ||
        data?.message ||
        data?.result ||
        'I could not generate a response. Please try again.'
      addMessage('assistant', responseText)
    } catch (err: any) {
      addMessage('assistant', 'Sorry, I encountered an error. Is the backend running? ' + (err.message || ''))
    } finally {
      setThinking(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-orange-600/5 to-amber-600/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Cornerstone AI</h3>
            <p className="text-[10px] text-muted-foreground">Powered by Gemini & Cerebras</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isEmbedded && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600/20 to-amber-600/20 flex items-center justify-center"
                >
                  <Bot className="w-8 h-8 text-orange-500" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-lg gradient-text">Namaste! 🙏</h3>
                  <p className="text-sm text-muted-foreground mt-1">Ask me anything about your studies, schedule, or school</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Study tips 📚', 'Check grades 📊', 'Schedule info 📅', 'AI Study Plan ✨'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setInput(suggestion.split(' ')[0] + ' ' + suggestion.split(' ')[1]) }}
                      className="px-3 py-1.5 rounded-lg bg-secondary/50 text-xs hover:bg-secondary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary rounded-bl-md"
                )}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            ))}

            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-center"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                  <TypingDots />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Navaneeth Notes AI Prompt Bar Style */}
          <div className="border-t border-border/50 p-2">
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5">
              <div className="relative">
                <div className="relative flex flex-col">
                  <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => { setInput(e.target.value); adjustHeight() }}
                      onKeyDown={handleKeyDown}
                      placeholder="What can I do for you?"
                      className={cn(
                        "w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                        "min-h-[72px]"
                      )}
                      rows={1}
                    />
                  </div>

                  <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center">
                    <div className="absolute left-3 right-3 bottom-2.5 flex items-center justify-between w-[calc(100%-24px)]">
                      <div className="flex items-center gap-2">
                        {/* Model Selector Dropdown - from Navaneeth Notes */}
                        <div className="relative">
                          <button
                            onClick={() => setShowModelDropdown(!showModelDropdown)}
                            className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={selectedModel}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-1"
                              >
                                {MODEL_ICONS[selectedModel] || <Bot className="w-4 h-4 opacity-50" />}
                                {selectedModel}
                                <ChevronDown className="w-3 h-3 opacity-50" />
                              </motion.div>
                            </AnimatePresence>
                          </button>

                          <AnimatePresence>
                            {showModelDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute bottom-full mb-2 left-0 min-w-[10rem] border border-black/10 dark:border-white/10 bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 rounded-lg shadow-lg overflow-hidden z-50"
                              >
                                {AI_MODELS.map((model) => (
                                  <button
                                    key={model}
                                    onClick={() => { setSelectedModel(model); setShowModelDropdown(false) }}
                                    className="flex items-center justify-between gap-2 w-full px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      {MODEL_ICONS[model] || <Bot className="w-4 h-4 opacity-50" />}
                                      <span className="dark:text-white">{model}</span>
                                    </div>
                                    {selectedModel === model && <Check className="w-4 h-4 text-orange-500" />}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />

                        {/* Emoji picker */}
                        <div className="relative">
                          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={cn("rounded-lg p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white")} aria-label="Emoji">
                            <Smile className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {showEmojiPicker && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-12 left-0 z-50">
                                <div className="relative">
                                  <button onClick={() => setShowEmojiPicker(false)} className="absolute top-1 right-1 z-20"><X className="w-4 h-4" /></button>
                                  <EmojiPicker className="h-[300px] w-[280px] rounded-lg border shadow-lg" onEmojiSelect={({ emoji }) => { setInput(prev => prev + emoji); setShowEmojiPicker(false) }}>
                                    <EmojiPickerSearch />
                                    <EmojiPickerContent />
                                  </EmojiPicker>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Attach file */}
                        <label className={cn(
                          "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                          "hover:bg-black/10 dark:hover:bg-white/10",
                          "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                        )} aria-label="Attach file">
                          <input type="file" className="hidden" />
                          <Paperclip className="w-4 h-4" />
                        </label>
                      </div>

                      {/* Send button */}
                      <button
                        type="button"
                        className={cn(
                          "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                          "hover:bg-black/10 dark:hover:bg-white/10 transition-colors",
                          input.trim() && "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg hover:shadow-orange-500/25"
                        )}
                        aria-label="Send message"
                        disabled={!input.trim() || isThinking}
                        onClick={handleSend}
                      >
                        {isThinking
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <ArrowRight className={cn(
                              "w-4 h-4 dark:text-white transition-opacity duration-200",
                              input.trim() ? "opacity-100" : "opacity-30"
                            )} />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              AI can make mistakes. Verify important information.
            </p>
          </div>
    </>
  )

  // Embedded mode: full page component (used in AI page)
  if (isEmbedded) {
    return (
      <div className="flex flex-col h-full rounded-2xl border border-border/50 shadow-xl bg-background/95 backdrop-blur-2xl overflow-hidden">
        {panelContent}
      </div>
    )
  }

  // Floating panel mode (used in dashboards)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border/50 shadow-2xl",
            "bg-background/95 backdrop-blur-2xl",
            isExpanded ? "inset-4" : "bottom-4 right-4 w-[400px] h-[600px]"
          )}
        >
          {panelContent}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
