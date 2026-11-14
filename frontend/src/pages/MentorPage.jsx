import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Code2, 
  HelpCircle, 
  Lightbulb, 
  ArrowRight, 
  User, 
  RefreshCw,
  Terminal,
  Zap
} from 'lucide-react';

export default function MentorPage({ setActivePage }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const starterQuestions = [
    "What skills do I have?",
    "What am I missing for my career?",
    "What should I learn next?",
    "How does my college syllabus match industry requirements?",
    "Help me improve my weak skills."
  ];

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const hist = await api.mentor.getHistory();
      if (hist && hist.length > 0) {
        setMessages(hist);
      } else {
        // Initial welcome message
        setMessages([
          {
            id: 'welcome',
            sender: 'mentor',
            message: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I am your dedicated **ORBIT AI Career Mentor**. I have full context of your verified technical skills, college syllabus coursework, and active adaptive roadmap. Ask me technical explanations, code reviews, architectural advice, or what to learn next!`,
            metadata: {
              action_items: [
                "Review your active roadmap milestone",
                "Verify missing skills via diagnostic assessments",
                "Bridge college curriculum gaps"
              ],
              suggested_questions: starterQuestions
            }
          }
        ]);
      }
    } catch (err) {
      console.error("Mentor history error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      const res = await api.mentor.chat(text);
      const mentorMsg = {
        id: Date.now() + 1,
        sender: 'mentor',
        message: res.reply,
        metadata: {
          action_items: res.action_items || [],
          recommended_skills: res.recommended_skills || [],
          suggested_questions: res.suggested_questions?.length ? res.suggested_questions : starterQuestions.slice(0, 3)
        },
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, mentorMsg]);
    } catch (err) {
      alert("Mentor error: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to format markdown text with code snippets
  const renderMessageContent = (text, msgIdx) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = (lang.length < 15 && !lines[0].includes(' ')) ? lines.slice(1).join('\n') : lines.join('\n');
        const copyKey = `${msgIdx}-${pIdx}`;

        return (
          <div key={pIdx} className="my-3 rounded-xl bg-[#080808] border border-[#222222] overflow-hidden text-white font-mono text-xs">
            <div className="px-4 py-2 bg-[#141414] border-b border-[#222222] flex items-center justify-between text-[11px] text-[#888888]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-white" /> {lang || 'code'}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(code, copyKey)}
                className="flex items-center gap-1 text-[10px] text-[#AAAAAA] hover:text-white"
              >
                {copiedIndex === copyKey ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-xs text-[#EAEAEA] leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <span key={pIdx} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn flex flex-col h-[calc(100vh-5rem)] text-[#F5F5F5]">
      
      {/* 1. Header Banner */}
      <div className="p-4 rounded-2xl border border-[#292929] bg-[#101010] shadow-subtle flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-sm">
            <Bot className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white font-display">ORBIT AI Mentor Studio</h1>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-mono font-bold">ONLINE</span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Context-Aware Engineering Coach with Real-time Syllabus & Roadmap Memory
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 rounded-xl border border-[#292929] text-[#A1A1AA] hover:text-white hover:border-white transition-colors bg-[#151515]"
          title="Reload chat context"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';

          return (
            <div 
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isUser ? 'bg-white text-black' : 'bg-[#181818] text-white border border-[#333333]'
              }`}>
                {isUser ? (user?.full_name?.charAt(0) || 'U') : <Zap className="w-4 h-4 text-white" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs ${
                isUser 
                  ? 'bg-white text-black font-medium' 
                  : 'bg-[#121212] border border-[#292929] text-[#E0E0E0] shadow-subtle'
              }`}>
                {renderMessageContent(msg.message, idx)}

                {/* Mentor Action Items */}
                {!isUser && msg.metadata?.action_items?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#222222] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-[#A1A1AA] font-bold block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-white" /> Action Items:
                    </span>
                    <ul className="space-y-1 text-[11px] text-[#A1A1AA]">
                      {msg.metadata.action_items.map((act, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-1.5">
                          <span className="text-white font-bold">›</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Starter Questions Chips */}
                {!isUser && msg.metadata?.suggested_questions?.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#222222] flex flex-wrap gap-1.5">
                    {msg.metadata.suggested_questions.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSendMessage(q)}
                        disabled={sending}
                        className="text-[10px] text-[#D4D4D8] hover:text-white hover:border-white bg-[#1A1A1A] px-2.5 py-1 rounded-full border border-[#2A2A2A] transition-all text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center border border-[#333333]">
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-[#121212] border border-[#292929] text-xs text-[#A1A1AA] flex items-center gap-2 shadow-subtle">
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-200" />
              <span className="text-[11px] font-mono">ORBIT AI Mentor synthesizing guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input & Send Bar */}
      <div className="p-2 rounded-2xl border border-[#292929] bg-[#121212] shadow-premium flex items-center gap-2 shrink-0">
        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask ORBIT AI Mentor anything about your roadmap, college syllabus, or assessments..."
          className="flex-1 px-3 py-2 text-xs bg-transparent text-white placeholder-[#71717A] focus:outline-none resize-none max-h-28"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || sending}
          className="p-2.5 rounded-xl bg-white text-black hover:bg-[#E0E0E0] transition-colors disabled:opacity-40 shadow-sm shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
