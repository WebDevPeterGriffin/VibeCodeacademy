'use client'

import { useChat } from '@ai-sdk/react'
import { UIMessage } from 'ai'
import { useState, useRef, useEffect } from 'react'
import Navbar from '@/components/Navbar'

export default function AskGeorgePage() {
    const { messages, sendMessage } = useChat()
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        sendMessage({ text: input })
        setInput('')
    }

    const handleAppend = (text: string) => {
        sendMessage({ text })
    }

    return (
        <div className="flex h-screen flex-col bg-dark pt-16">
            <Navbar />

            <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden px-4 md:px-0">
                <div className="flex items-center gap-3 py-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                        <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-display text-3xl text-white tracking-wide">Ask George</h1>
                        <p className="font-mono text-xs text-gray-500 uppercase">Dedicated Workspace Session</p>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto rounded-t-none border border-b-0 border-dark-400 bg-dark-50 p-6 shadow-inner">
                    {messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10">
                                <svg className="h-10 w-10 text-primary/70" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                                </svg>
                            </div>
                            <h2 className="mb-3 font-display text-4xl text-white">Let&apos;s solve it together.</h2>
                            <p className="max-w-md font-sans text-sm text-gray-400 leading-relaxed">
                                I&apos;m George. Paste your error logs, describe your goals, or ask for architectural advice. Let&apos;s get building.
                            </p>

                            <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-2xl w-full">
                                {[
                                    'Review my Supabase schema',
                                    'Help me setup A/B testing',
                                    'I am stuck on this module',
                                    'Write a component for a dashboard'
                                ].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => handleAppend(q)}
                                        className="rounded-none border border-dark-400 bg-dark-100 p-4 text-left text-sm text-gray-300 transition-colors hover:border-primary/50 hover:text-white shadow-sm"
                                    >
                                        <div className="font-mono text-[10px] text-primary-300 uppercase tracking-widest mb-2 border-b border-dark-400 pb-1 w-full flex justify-between">
                                            Quick Prompt
                                            <svg className="w-3 h-3 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-8">
                            {messages.map((m: UIMessage) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-none ${m.role === 'user' ? 'border-b-2 border-primary bg-primary/10 p-5 pt-4' : 'border border-dark-400 bg-dark-100 p-6 shadow-sm'} ${m.role === 'user' ? 'text-primary-200' : 'text-gray-200'}`}>
                                        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                            {m.role === 'user' ? 'You' : 'George'}
                                            <div className={`w-1 h-1 rounded-full ${m.role === 'user' ? 'bg-primary' : 'bg-primary-400'}`} />
                                        </div>
                                        <div className="prose-dark prose-sm whitespace-pre-wrap font-sans">
                                            {m.parts?.map((part, i) =>
                                                part.type === 'text' ? <span key={i}>{part.text}</span> : null
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="mb-8 border border-t-0 border-dark-400 bg-dark p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Paste your code or ask a precise question..."
                            className="w-full resize-none rounded-none border border-dark-300 bg-dark-100 p-4 text-sm text-white placeholder:text-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const form = e.currentTarget.form;
                                    if (form) form.requestSubmit();
                                }
                            }}
                        />
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest hidden sm:inline-block">
                                Press ENTER to send, SHIFT+ENTER for newline
                            </span>
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="btn-primary disabled:opacity-50 inline-flex items-center gap-2 px-6 py-2"
                            >
                                Submit Query
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
