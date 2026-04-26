'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { UIMessage } from 'ai'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AskGeorgeFAB() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const pathname = usePathname()
    const { messages, sendMessage } = useChat()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Listen for custom "I'm stuck" event
    useEffect(() => {
        const handleOpen = (e: Event) => {
            setIsOpen(true)
            const customEvent = e as CustomEvent
            if (customEvent.detail?.context) {
                sendMessage({ text: customEvent.detail.context })
            }
        }
        window.addEventListener('open-ask-george', handleOpen)
        return () => window.removeEventListener('open-ask-george', handleOpen)
    }, [sendMessage])

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Hide FAB on dedicated /ask page
    if (pathname === '/ask') return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        sendMessage({ text: input })
        setInput('')
    }

    return (
        <>
            {/* FAB — terminal command style */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-40 flex items-center gap-1.5 border border-primary/40 bg-dark-100 px-4 py-2.5 font-mono text-sm text-primary-300 shadow-glow transition-all hover:border-primary/70 hover:bg-dark-200 active:scale-95 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                aria-label="Ask George"
            >
                <span className="text-gray-600 select-none">{'>'}</span>
                <span>ask george</span>
                <span className="inline-block w-[7px] h-[14px] bg-primary-300 animate-cursor-blink" aria-hidden="true" />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-dark/80 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out Panel */}
            <div className={`fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-dark-400 bg-dark-100 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-dark-400 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                            <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-display text-xl text-white tracking-wide">Ask George</h2>
                            <p className="font-mono text-[10px] text-gray-500 uppercase">AI Assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/ask"
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Expand to full screen"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            </svg>
                        </Link>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-dark-50">
                    {messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center px-4">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10">
                                <svg className="h-8 w-8 text-primary/70" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 font-display text-2xl text-white">How can I help?</h3>
                            <p className="font-mono text-[11px] text-gray-500 uppercase tracking-widest leading-relaxed">
                                I&apos;m George, your vibe coding assistant. Ask me about your stack, workflows, or this lesson.
                            </p>
                            <div className="mt-8 flex flex-col gap-2 w-full">
                                {['Explain this concept clearly', 'I hit a bug, what do I do?', 'How does this architecture work?'].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage({ text: q })}
                                        className="rounded-none border border-dark-400 bg-dark-100 py-2.5 px-4 text-left text-sm text-gray-300 transition-colors hover:border-primary/50 hover:text-white"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((m: UIMessage) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${m.role === 'user' ? 'bg-primary text-white font-medium' : 'bg-dark-200 border border-dark-400 text-gray-200'} whitespace-pre-wrap`}>
                                    {m.parts?.map((part, i) =>
                                        part.type === 'text' ? <span key={i}>{part.text}</span> : null
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-dark-400 bg-dark-100 p-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask George anything..."
                            className="flex-1 rounded-none border border-dark-400 bg-dark focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary px-4 py-3 text-sm text-white placeholder:text-gray-600 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="flex items-center justify-center bg-primary px-4 text-white disabled:opacity-50 transition-colors hover:bg-primary-600"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
