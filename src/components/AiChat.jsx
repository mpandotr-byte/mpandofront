import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { api } from '../api/client';

export default function AiChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Merhaba! Ben MGAMA AI, MPANDO platformu asistanınızım. Proje yönetimi, malzeme hesaplama, reçete sistemi, DWG analizi ve daha fazlası hakkında sorularınızı yanıtlayabilirim. Nasıl yardımcı olabilirim?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiStatus, setAiStatus] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // AI durumunu kontrol et
    useEffect(() => {
        if (isOpen && aiStatus === null) {
            api.get('/mgama/status').then(data => setAiStatus(data)).catch(() => setAiStatus({ online: false }));
        }
    }, [isOpen]);

    // Login olmamış kullanıcılara gösterme
    const token = localStorage.getItem('token');
    if (!token) return null;

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // Son 10 mesajı gönder (system mesajı hariç)
            const chatHistory = newMessages
                .filter(m => m.role !== 'system')
                .slice(-10)
                .map(m => ({ role: m.role, content: m.content }));

            const data = await api.post('/mgama/chat', { messages: chatHistory });
            setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'AI servisi şu anda erişilemiyor. Lütfen daha sonra tekrar deneyin.',
                error: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickActions = [
        'Satın alma hesaplama nasıl çalışır?',
        'Reçete sistemi nedir?',
        'DWG analizi nasıl yapılır?',
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#D36A47] to-[#B5533A] rounded-full shadow-2xl shadow-[#D36A47]/30 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-50 group"
            >
                <Bot size={26} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
            </button>
        );
    }

    const chatWidth = isExpanded ? 'w-[700px]' : 'w-[400px]';
    const chatHeight = isExpanded ? 'h-[700px]' : 'h-[550px]';

    return (
        <div className={`fixed bottom-6 right-6 ${chatWidth} ${chatHeight} bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden transition-all duration-300`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A1128] to-[#1a2744] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#D36A47] rounded-xl flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-sm">MGAMA AI</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${aiStatus?.online ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <span className="text-[10px] text-slate-400 font-bold">
                                {aiStatus?.online ? 'Çevrimiçi' : 'Bağlanıyor...'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 hover:text-white transition-colors p-1">
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                                ? 'bg-[#D36A47] text-white rounded-br-md'
                                : msg.error
                                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                                    : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md'
                        }`}>
                            <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                                __html: msg.content
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/### (.*?)(\n|$)/g, '<h4 class="font-bold text-base mt-2 mb-1">$1</h4>')
                                    .replace(/## (.*?)(\n|$)/g, '<h3 class="font-bold text-lg mt-2 mb-1">$1</h3>')
                                    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1 rounded text-xs">$1</code>')
                                    .replace(/\n- /g, '\n• ')
                                    .replace(/\n(\d+)\. /g, '\n$1. ')
                            }} />
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <Loader2 size={18} className="animate-spin text-[#D36A47]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (sadece mesaj yokken) */}
            {messages.length <= 1 && (
                <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-slate-100">
                    {quickActions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => { setInput(q); }}
                            className="text-[11px] px-3 py-1.5 bg-slate-100 hover:bg-[#D36A47]/10 text-slate-600 hover:text-[#D36A47] rounded-full font-semibold transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200 focus-within:border-[#D36A47]/40 focus-within:ring-2 focus-within:ring-[#D36A47]/10 transition-all">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Mesajınızı yazın..."
                        rows={1}
                        className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none max-h-24"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="w-9 h-9 bg-[#D36A47] rounded-xl flex items-center justify-center text-white hover:bg-[#B5533A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-[9px] text-center text-slate-400 mt-1.5 font-medium">MGAMA AI - MPANDO A.Ş.</p>
            </div>
        </div>
    );
}
