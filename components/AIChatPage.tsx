
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, Part } from "@google/genai";
import { Icons } from './Icons';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  translation?: string;
  isTranslating?: boolean;
  isAudio?: boolean; // Track if the user sent audio
}

const STORAGE_KEY = 'ai_chat_history';

// Helper to safely access API Key without crashing if process is undefined
const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    console.warn("API Key access failed or process not defined");
    return undefined;
  }
};

const AIChatPage: React.FC = () => {
  // Initialize messages from localStorage if available
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Sanitize: ensure no transient loading states persist and it is an array
          if (Array.isArray(parsed)) {
            return parsed.map((m: Message) => ({
                ...m,
                isTranslating: false,
                text: m.text || '' // Ensure text is string
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
    // Default welcome message if no history
    return [{
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your English AI tutor. You can type or speak to me. I'll help you with your grammar and pronunciation.",
    }];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  
  // Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const initChat = (currentMessages: Message[]) => {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    if (!aiRef.current) {
      aiRef.current = new GoogleGenAI({ apiKey });
    }
    
    // Convert current messages to history format expected by SDK
    // Filter out welcome message and ensure valid text
    const history = currentMessages
      .filter(m => m.id !== 'welcome') 
      .map(m => ({
          role: m.role,
          parts: [{ text: m.text || " " }] as Part[]
      }));

    try {
      chatRef.current = aiRef.current.chats.create({
        model: 'gemini-2.5-flash',
        history: history, 
        config: {
          systemInstruction: 
            "You are a friendly and helpful English language tutor for a Chinese student. " +
            "1. Engage in natural conversation in English. " +
            "2. IMPORTANT: At the end of EVERY response, specifically check the user's input for errors. " +
            "   - If there are grammar mistakes, list them in a section labeled '📝 Grammar Check:'. " +
            "   - If the user sent audio (you will receive an audio file), analyze their pronunciation and provide feedback in a section labeled '🎤 Pronunciation:'. " +
            "3. If the user speaks Chinese, translate it to English first, then respond in English. " +
            "4. Keep your conversational part concise (under 50 words) to keep the chat flowing."
        }
      });
      return chatRef.current;
    } catch (error) {
      console.error("Failed to initialize chat", error);
      return null;
    }
  };

  useEffect(() => {
    initChat(messages);
    
    // Cleanup speech synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
      // Ensure stream is stopped on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Run once on mount

  // Auto-save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    if (window.confirm("确定要清空聊天记录吗？")) {
        const initialMsg: Message = {
            id: 'welcome',
            role: 'model',
            text: "Hello! I'm your English AI tutor. You can type or speak to me. I'll help you with your grammar and pronunciation.",
        };
        setMessages([initialMsg]);
        localStorage.removeItem(STORAGE_KEY);
        
        // Reset chat session with empty history (only initial message is purely UI)
        initChat([]);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    // Ensure chat is initialized
    if (!chatRef.current) {
        const chat = initChat(messages);
        if (!chat) {
            alert("Chat initialization failed. Please check your API Key.");
            return;
        }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (!chatRef.current) throw new Error("Chat not initialized");
      const result = await chatRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text;
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error, attempting retry...", error);
      
      // Retry logic: Re-initialize chat with history EXCLUDING the message we just failed to send
      // then try sending the message again.
      try {
        const chat = initChat(messages); // This uses 'messages' which DOES NOT include userMsg yet in this scope? 
        // Wait, setMessages is async. 'messages' variable here is from the render scope.
        // It does NOT contain userMsg yet. This is perfect for re-initializing history up to that point.
        
        if (chat) {
             const result = await chat.sendMessage({ message: userMsg.text });
             const responseText = result.text;
             const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
             };
             setMessages(prev => [...prev, aiMsg]);
        } else {
            throw new Error("Re-init failed");
        }
      } catch (retryError) {
        console.error("Retry failed", retryError);
        // Remove the failed user message from UI to avoid confusion, or mark as failed (simple removal for now)
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
        alert("发送失败，请检查网络或重试");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Voice Features ---

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Store stream reference

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("无法访问麦克风，请检查权限设置");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    
    // Ensure chat is initialized before sending audio
    if (!chatRef.current) {
        initChat(messages);
    }

    mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Use webm for browser recording
        setIsRecording(false);
        setIsLoading(true);

        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            
            // Add visual placeholder for audio message
            const userMsg: Message = {
                id: Date.now().toString(),
                role: 'user',
                text: "🎤 [Audio Message]",
                isAudio: true
            };
            setMessages(prev => [...prev, userMsg]);

            try {
                // Send audio to Gemini
                // We construct a specific part for the audio
                if (!chatRef.current) {
                    // Try to init if missing
                    const newChat = initChat(messages);
                    if (!newChat) throw new Error("Chat unavailable");
                }

                const response = await chatRef.current?.sendMessage({ 
                    message: {
                         parts: [
                             { inlineData: { mimeType: 'audio/webm', data: base64String } },
                             { text: "Please analyze my pronunciation and grammar in this audio." }
                         ]
                    }
                });

                const responseText = response?.text;
                if (responseText) {
                    const aiMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'model',
                        text: responseText,
                    };
                    setMessages(prev => [...prev, aiMsg]);
                }
            } catch (error) {
                console.error("Audio Send Error", error);
                // Simple retry for audio is harder because we need the blob again. 
                // For now, just alert.
                setMessages(prev => prev.filter(m => m.id !== userMsg.id));
                alert("语音发送失败，请重试");
            } finally {
                setIsLoading(false);
            }
        };
    };

    mediaRecorderRef.current.stop();
    // Stop all tracks to release microphone using the stored stream ref
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };


  // --- Helper Features ---

  const handleTranslate = async (msgId: string, text: string) => {
    // Optimistic UI update
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, isTranslating: true } : m
    ));

    try {
        // Use a separate simple generation call for translation to avoid messing up chat context
        if (!aiRef.current) {
             const apiKey = getApiKey();
             if (apiKey) aiRef.current = new GoogleGenAI({ apiKey });
        }
        
        if (aiRef.current) {
            const model = aiRef.current.models.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent({
                contents: `Translate the following English text to Chinese accurately:\n\n"${text}"`
            });
            const translation = result.text;

            setMessages(prev => prev.map(m => 
                m.id === msgId ? { ...m, translation: translation, isTranslating: false } : m
            ));
        }
    } catch (e) {
        setMessages(prev => prev.map(m => 
            m.id === msgId ? { ...m, isTranslating: false } : m
        ));
        alert("翻译失败");
    }
  };

  const handleSpeech = (msgId: string, text: string) => {
      if (speakingMessageId === msgId) {
          window.speechSynthesis.cancel();
          setSpeakingMessageId(null);
          return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => setSpeakingMessageId(null);
      
      setSpeakingMessageId(msgId);
      window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg text-white">
                 <Icons.Bot size={20} />
            </div>
            <div>
                <h1 className="font-bold text-gray-800 leading-tight">AI 助教</h1>
                <p className="text-[10px] text-gray-500">Gemini 2.5 Flash • 实时纠错</p>
            </div>
        </div>
        <button 
          onClick={handleClearHistory}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="清空记录"
        >
            <Icons.Trash size={18} />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0 text-indigo-600 mt-1">
                      <Icons.Bot size={16} />
                  </div>
              )}
              
              <div className="flex flex-col max-w-[80%]">
                  <div 
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
                      isUser 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                  >
                    {isUser && msg.isAudio ? (
                        <div className="flex items-center space-x-2">
                            <Icons.Volume2 className="animate-pulse" size={16} />
                            <span>Voice Message</span>
                        </div>
                    ) : (
                        // Render text with specific styling for markdown-like headers
                        <div className="whitespace-pre-wrap">
                            {(msg.text || '').split(/(\n[🎤📝].+)/g).map((part, i) => {
                                if (part.startsWith('\n🎤') || part.startsWith('\n📝')) {
                                    return <span key={i} className="block font-bold text-indigo-600 mt-2 bg-indigo-50 p-1 rounded">{part.trim()}</span>;
                                }
                                return part;
                            })}
                        </div>
                    )}
                    
                    {/* Translation Result */}
                    {msg.translation && (
                        <div className="mt-2 pt-2 border-t border-gray-200/50 text-xs text-gray-500 italic">
                            {msg.translation}
                        </div>
                    )}
                  </div>

                  {/* Message Actions (Only for AI responses) */}
                  {!isUser && (
                      <div className="flex items-center space-x-3 mt-1 ml-1">
                          <button 
                            onClick={() => handleSpeech(msg.id, msg.text)}
                            className={`p-1 rounded-full transition-colors ${speakingMessageId === msg.id ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                              {speakingMessageId === msg.id ? <Icons.Square size={14} fill="currentColor" /> : <Icons.Volume2 size={14} />}
                          </button>
                          
                          <button 
                            onClick={() => handleTranslate(msg.id, msg.text)}
                            className="text-gray-400 hover:text-gray-600 flex items-center space-x-0.5"
                          >
                              {msg.isTranslating ? <Icons.Loader size={12} className="animate-spin" /> : <Icons.Languages size={12} />}
                              <span className="text-[10px]">翻译</span>
                          </button>
                      </div>
                  )}
              </div>

              {isUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0 text-gray-500 mt-1">
                      <Icons.User size={16} />
                  </div>
              )}
            </div>
          );
        })}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0 text-indigo-600">
                      <Icons.Bot size={16} />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                  </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-100 flex items-center space-x-2 pb-safe">
        <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`p-3 rounded-full transition-all duration-200 shadow-sm ${
                isRecording 
                ? 'bg-red-500 text-white scale-110 ring-4 ring-red-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
        >
            <Icons.Mic size={20} />
        </button>

        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRecording ? "Listening..." : "输入消息..."}
                className="bg-transparent w-full outline-none text-sm text-gray-800 placeholder-gray-400"
                disabled={isRecording}
            />
        </div>
        
        
        <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-full transition-all duration-200 shadow-sm ${
                inputText.trim() && !isLoading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
            <Icons.Send size={20} />
        </button>
      </div>

      {/* Recording Overlay Indicator */}
      {isRecording && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-6 py-4 rounded-xl backdrop-blur-sm flex flex-col items-center z-50">
              <div className="animate-pulse mb-2">
                  <Icons.Mic size={32} className="text-red-400" />
              </div>
              <span className="font-bold text-sm">正在说话...</span>
              <span className="text-xs text-gray-300 mt-1">松开结束</span>
          </div>
      )}
    </div>
  );
};

export default AIChatPage;
