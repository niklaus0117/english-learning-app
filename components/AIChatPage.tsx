
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, Part } from "@google/genai";
import { Icons } from './Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  translation?: string;
  isTranslating?: boolean;
  isAudio?: boolean; // Track if the user sent audio
  showAnalysis?: boolean; // Track if analysis should be shown
  audioUrl?: string; // For playing back user's audio
  aiAudioBase64?: string; // For caching AI's TTS audio
}

const STORAGE_KEY = 'ai_chat_history';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

// Helper to safely access API Key without crashing if process is undefined
const getApiKey = () => {
  try {
    return process.env.GEMINI_API_KEY;
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
  const [isTTSLoading, setIsTTSLoading] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
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
        model: 'gemini-3-flash-preview',
        history: history, 
        config: {
          systemInstruction: 
            "You are a friendly and helpful English language tutor for a Chinese student. " +
            "1. Engage in natural conversation in English. " +
            "2. If the user speaks Chinese, translate it to English first, then respond in English. " +
            "3. Keep your conversational part concise (under 50 words) to keep the chat flowing. " +
            "4. IMPORTANT: After your conversational reply, you MUST add the exact text '---ANALYSIS---' on a new line, followed by your analysis of the user's input. " +
            "   - In the analysis section, if there are grammar mistakes, list them under '📝 Grammar Check:'. " +
            "   - If the user sent audio, analyze their pronunciation and provide feedback under '🎤 Pronunciation:'."
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
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
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
      id: generateId(),
      role: 'user',
      text: inputText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    let aiMsgId = generateId();
    try {
      if (!chatRef.current) throw new Error("Chat not initialized");
      
      const aiMsg: Message = {
        id: aiMsgId,
        role: 'model',
        text: '',
      };
      setMessages(prev => [...prev, aiMsg]);

      const responseStream = await chatRef.current.sendMessageStream({ message: userMsg.text });
      
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { ...m, text: m.text + chunkText } : m
          ));
        }
      }
    } catch (error) {
      console.error("Chat Error, attempting retry...", error);
      
      // Remove the failed AI message from UI
      setMessages(prev => prev.filter(m => m.id !== aiMsgId));
      
      // Retry logic: Re-initialize chat with history EXCLUDING the message we just failed to send
      // then try sending the message again.
      try {
        const chat = initChat(messages);
        
        if (chat) {
             aiMsgId = generateId();
             const aiMsg: Message = {
                id: aiMsgId,
                role: 'model',
                text: '',
             };
             setMessages(prev => [...prev, aiMsg]);

             const responseStream = await chat.sendMessageStream({ message: userMsg.text });
             for await (const chunk of responseStream) {
                 const chunkText = chunk.text;
                 if (chunkText) {
                     setMessages(prev => prev.map(m => 
                         m.id === aiMsgId ? { ...m, text: m.text + chunkText } : m
                     ));
                 }
             }
        } else {
            throw new Error("Re-init failed");
        }
      } catch (retryError) {
        console.error("Retry failed", retryError);
        // Remove the failed user message and AI message from UI to avoid confusion
        setMessages(prev => prev.filter(m => m.id !== userMsg.id && m.id !== aiMsgId));
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
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    
    // Ensure chat is initialized before sending audio
    if (!chatRef.current) {
        initChat(messages);
    }

    mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
            setIsRecording(false);
            return;
        }
        
        const actualMimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const baseMimeType = actualMimeType.split(';')[0] || 'audio/webm';
        
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        setIsRecording(false);
        setIsLoading(true);

        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            const base64String = dataUrl.split(',')[1];
            
            const userMsgId = generateId();
            const userMsg: Message = {
                id: userMsgId,
                role: 'user',
                text: "正在识别语音...",
                isAudio: true,
                audioUrl: dataUrl
            };
            setMessages(prev => [...prev, userMsg]);

            let aiMsgId = '';
            try {
                if (!aiRef.current) {
                    const apiKey = getApiKey();
                    if (!apiKey) throw new Error("API Key missing");
                    aiRef.current = new GoogleGenAI({ apiKey });
                }

                // 1. Transcribe Audio
                let transcription = "";
                try {
                    const transcribeResult = await aiRef.current.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    { inlineData: { mimeType: baseMimeType, data: base64String } },
                                    { text: "Transcribe the audio exactly as spoken. If it's Chinese, write Chinese. If it's English, write English. Do not translate. Return ONLY the transcription text, nothing else. Do not wrap in quotes." }
                                ]
                            }
                        ]
                    });
                    transcription = transcribeResult.text.trim();
                } catch (e) {
                    console.error("Transcription failed", e);
                    transcription = "[语音识别失败]";
                }

                // Update user message in UI
                setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, text: transcription } : m));
                userMsg.text = transcription; // Update local object for history

                aiMsgId = generateId();
                const aiMsg: Message = {
                    id: aiMsgId,
                    role: 'model',
                    text: '',
                };
                setMessages(prev => [...prev, aiMsg]);

                const history = messages
                  .filter(m => m.id !== 'welcome') 
                  .map(m => ({
                      role: m.role,
                      parts: [{ text: m.text || " " }] as Part[]
                  }));

                const responseStream = await aiRef.current.models.generateContentStream({
                    model: 'gemini-3-flash-preview',
                    contents: [
                        ...history,
                        {
                            role: 'user',
                            parts: [
                                { inlineData: { mimeType: baseMimeType, data: base64String } },
                                { text: `Here is my audio message. Transcription: "${transcription}". Please respond to me, and also analyze my pronunciation and grammar in this audio.` }
                            ]
                        }
                    ],
                    config: {
                        systemInstruction: 
                            "You are a friendly and helpful English language tutor for a Chinese student. " +
                            "1. Engage in natural conversation in English. " +
                            "2. If the user speaks Chinese, translate it to English first, then respond in English. " +
                            "3. Keep your conversational part concise (under 50 words) to keep the chat flowing. " +
                            "4. IMPORTANT: After your conversational reply, you MUST add the exact text '---ANALYSIS---' on a new line, followed by your analysis of the user's input. " +
                            "   - In the analysis section, if there are grammar mistakes, list them under '📝 Grammar Check:'. " +
                            "   - If the user sent audio, analyze their pronunciation and provide feedback under '🎤 Pronunciation:'."
                    }
                });

                let fullText = '';
                if (responseStream) {
                    for await (const chunk of responseStream) {
                        const chunkText = chunk.text;
                        if (chunkText) {
                            fullText += chunkText;
                            setMessages(prev => prev.map(m => 
                                m.id === aiMsgId ? { ...m, text: m.text + chunkText } : m
                            ));
                        }
                    }
                }
                
                // Re-initialize chat with the new history including audio so future text messages have context
                initChat([...messages, userMsg, { ...aiMsg, text: fullText }]);
                
            } catch (error) {
                console.error("Audio Send Error", error);
                // Simple retry for audio is harder because we need the blob again. 
                // For now, just alert.
                setMessages(prev => prev.filter(m => m.id !== userMsg.id && m.id !== aiMsgId));
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
            const result = await aiRef.current.models.generateContent({
                model: 'gemini-3-flash-preview',
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

  const handleSpeech = async (msgId: string, text: string) => {
      if (speakingMessageId === msgId) {
          if (audioPlayerRef.current) {
              audioPlayerRef.current.pause();
              audioPlayerRef.current.currentTime = 0;
          }
          setSpeakingMessageId(null);
          return;
      }

      if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          setSpeakingMessageId(null);
      }

      const msg = messages.find(m => m.id === msgId);
      if (!msg) return;

      setIsTTSLoading(msgId);

      try {
          let audioBase64 = msg.aiAudioBase64;
          
          if (!audioBase64) {
              if (!aiRef.current) {
                  const apiKey = getApiKey();
                  if (!apiKey) throw new Error("API Key missing");
                  aiRef.current = new GoogleGenAI({ apiKey });
              }
              
              const response = await aiRef.current.models.generateContent({
                  model: "gemini-2.5-flash-preview-tts",
                  contents: [{ parts: [{ text: text }] }],
                  config: {
                      responseModalities: ["AUDIO"],
                      speechConfig: {
                          voiceConfig: {
                              prebuiltVoiceConfig: { voiceName: 'Kore' },
                          },
                      },
                  },
              });
              
              audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
              
              if (audioBase64) {
                  setMessages(prev => prev.map(m => m.id === msgId ? { ...m, aiAudioBase64: audioBase64 } : m));
              }
          }

          if (audioBase64) {
              const binaryString = window.atob(audioBase64);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
              }
              
              const isWav = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF';
              let finalBytes = bytes;
              if (!isWav) {
                  const sampleRate = 24000;
                  const numChannels = 1;
                  const bitsPerSample = 16;
                  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
                  const blockAlign = numChannels * (bitsPerSample / 8);
                  const dataSize = bytes.length;
                  const buffer = new ArrayBuffer(44 + dataSize);
                  const view = new DataView(buffer);

                  const writeString = (view: DataView, offset: number, string: string) => {
                      for (let i = 0; i < string.length; i++) {
                          view.setUint8(offset + i, string.charCodeAt(i));
                      }
                  };

                  writeString(view, 0, 'RIFF');
                  view.setUint32(4, 36 + dataSize, true);
                  writeString(view, 8, 'WAVE');
                  writeString(view, 12, 'fmt ');
                  view.setUint32(16, 16, true);
                  view.setUint16(20, 1, true);
                  view.setUint16(22, numChannels, true);
                  view.setUint32(24, sampleRate, true);
                  view.setUint32(28, byteRate, true);
                  view.setUint16(32, blockAlign, true);
                  view.setUint16(34, bitsPerSample, true);
                  writeString(view, 36, 'data');
                  view.setUint32(40, dataSize, true);

                  const out = new Uint8Array(buffer);
                  out.set(bytes, 44);
                  finalBytes = out;
              }

              const blob = new Blob([finalBytes], { type: 'audio/wav' });
              const url = URL.createObjectURL(blob);
              const audio = new Audio(url);
              
              audio.onended = () => setSpeakingMessageId(null);
              audioPlayerRef.current = audio;
              
              setIsTTSLoading(null);
              setSpeakingMessageId(msgId);
              await audio.play();
          } else {
              throw new Error("No audio data returned");
          }
      } catch (e) {
          console.error("TTS Error", e);
          setIsTTSLoading(null);
          setSpeakingMessageId(null);
          alert("语音合成失败，请重试");
      }
  };

  const handlePlayUserAudio = (msgId: string, url?: string) => {
      if (!url) return;
      if (speakingMessageId === msgId) {
          if (audioPlayerRef.current) {
              audioPlayerRef.current.pause();
              audioPlayerRef.current.currentTime = 0;
          }
          setSpeakingMessageId(null);
          return;
      }

      if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
      }

      const audio = new Audio(url);
      audio.onended = () => setSpeakingMessageId(null);
      audioPlayerRef.current = audio;
      setSpeakingMessageId(msgId);
      audio.play().catch(e => {
          console.error("Play user audio error", e);
          setSpeakingMessageId(null);
          alert("播放失败");
      });
  };

  const handleToggleAnalysis = (msgId: string) => {
      setMessages(prev => prev.map(m => 
          m.id === msgId ? { ...m, showAnalysis: !m.showAnalysis } : m
      ));
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
                <p className="text-[10px] text-gray-500">Gemini 3 Flash • 实时纠错</p>
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
          const parts = (msg.text || '').split('---ANALYSIS---');
          const mainText = parts[0].trim();
          const analysisText = parts.length > 1 ? parts.slice(1).join('---ANALYSIS---').trim() : '';
          const hasAnalysis = analysisText.length > 0;

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
                            <button 
                                onClick={() => handlePlayUserAudio(msg.id, msg.audioUrl)}
                                className={`p-1.5 rounded-full transition-all flex-shrink-0 ${
                                    speakingMessageId === msg.id 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/50'
                                }`}
                                title="播放录音"
                            >
                                {speakingMessageId === msg.id ? (
                                    <Icons.Square size={14} fill="currentColor" />
                                ) : (
                                    <Icons.Volume2 size={14} />
                                )}
                            </button>
                            <span className="whitespace-pre-wrap">{mainText}</span>
                        </div>
                    ) : (
                        isUser ? (
                            <div className="whitespace-pre-wrap">{mainText}</div>
                        ) : (
                            <div className="prose prose-sm prose-indigo max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 prose-pre:text-gray-800">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {mainText}
                                </ReactMarkdown>
                            </div>
                        )
                    )}
                    
                    {/* Translation Result */}
                    {msg.translation && (
                        <div className="mt-2 pt-2 border-t border-gray-200/50 text-xs text-gray-500 italic">
                            {msg.translation}
                        </div>
                    )}

                    {/* Analysis Result */}
                    {!isUser && msg.showAnalysis && hasAnalysis && (
                        <div className="mt-3 pt-3 border-t border-indigo-100 bg-indigo-50/50 -mx-4 -mb-3 px-4 pb-3 rounded-b-2xl">
                            <div className="text-xs font-bold text-indigo-600 mb-1 flex items-center">
                                <Icons.Lightbulb size={12} className="mr-1" />
                                助教解析
                            </div>
                            <div className="prose prose-sm prose-indigo max-w-none prose-p:leading-relaxed text-gray-700 text-xs">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {analysisText}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                  </div>

                  {/* Message Actions (Only for AI responses) */}
                  {!isUser && (
                      <div className="flex items-center space-x-3 mt-1 ml-1">
                          <button 
                            onClick={() => handleSpeech(msg.id, mainText)}
                            disabled={isTTSLoading === msg.id}
                            className={`p-1 rounded-full transition-colors ${speakingMessageId === msg.id ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                              {isTTSLoading === msg.id ? (
                                  <Icons.Loader size={14} className="animate-spin" />
                              ) : speakingMessageId === msg.id ? (
                                  <Icons.Square size={14} fill="currentColor" />
                              ) : (
                                  <Icons.Volume2 size={14} />
                              )}
                          </button>
                          
                          <button 
                            onClick={() => handleTranslate(msg.id, mainText)}
                            className="text-gray-400 hover:text-gray-600 flex items-center space-x-0.5"
                          >
                              {msg.isTranslating ? <Icons.Loader size={12} className="animate-spin" /> : <Icons.Languages size={12} />}
                              <span className="text-[10px]">翻译</span>
                          </button>

                          {hasAnalysis && (
                              <button 
                                onClick={() => handleToggleAnalysis(msg.id)}
                                className={`flex items-center space-x-0.5 transition-colors ${msg.showAnalysis ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                              >
                                  <Icons.Lightbulb size={12} />
                                  <span className="text-[10px]">{msg.showAnalysis ? '收起解析' : '解析'}</span>
                              </button>
                          )}
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
