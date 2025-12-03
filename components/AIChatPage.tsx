import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Icons } from './Icons';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  translation?: string;
  isTranslating?: boolean;
  isAudio?: boolean; // Track if the user sent audio
}

const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your English AI tutor. You can type or speak to me. I'll help you with your grammar and pronunciation.",
    }
  ]);
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

  useEffect(() => {
    // Initialize AI on mount
    if (!aiRef.current && process.env.API_KEY) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = aiRef.current.chats.create({
        model: 'gemini-2.5-flash',
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
    }
    scrollToBottom();
    
    // Cleanup speech synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleSendAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("无法访问麦克风，请检查权限设置");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data url prefix (e.g. "data:audio/webm;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // --- Send Logic ---

  const handleSendAudio = async (audioBlob: Blob) => {
    if (!chatRef.current || isLoading) return;

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { 
      id: userMsgId, 
      role: 'user', 
      text: '🎤 [Voice Message]',
      isAudio: true
    }]);
    setIsLoading(true);

    try {
      const base64Audio = await blobToBase64(audioBlob);
      
      // Send audio + text prompt to context
      const result = await chatRef.current.sendMessage({ 
        message: [
          { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
          { text: "Please listen to my audio, respond to the content, and correct my pronunciation and grammar." }
        ]
      });
      
      const responseText = result.text;
      
      const responseId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: responseId,
        role: 'model',
        text: responseText || "Sorry, I couldn't process the audio."
      }]);

      // Automatically play the response for voice interaction feeling
      speakText(responseText || "", responseId);

    } catch (error) {
      console.error("Audio chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error processing your audio."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatRef.current || isLoading) return;

    const userMsgId = Date.now().toString();
    const userText = inputText;
    
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: userText }]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userText });
      const responseText = result.text;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Sorry, I didn't understand that."
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered a network error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Feature Logic ---

  const handleTranslate = async (messageId: string, text: string) => {
    if (!aiRef.current) return;

    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isTranslating: true } : msg
    ));

    try {
      const response = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following English text to simplified Chinese. Only output the translation, nothing else.\n\nText: "${text}"`,
      });

      const translation = response.text || "翻译失败";

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, translation, isTranslating: false } : msg
      ));
    } catch (error) {
      console.error("Translation error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isTranslating: false } : msg
      ));
    }
  };

  const speakText = (text: string, id: string) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // If clicking the same button that is speaking, just stop it
    if (speakingMessageId === id) {
        setSpeakingMessageId(null);
        return;
    }

    // Clean text for speech (remove markdown bolding etc if possible, but basic is fine)
    const cleanText = text.replace(/\*\*/g, '').replace(/[\#\-]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US'; // Set to English
    utterance.rate = 1.0;
    
    utterance.onend = () => {
        setSpeakingMessageId(null);
    };
    
    utterance.onerror = () => {
        setSpeakingMessageId(null);
    };

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to parse text for better display (bolding keywords)
  const renderMessageText = (text: string) => {
      // Simple bold parser for markdown **text**
      const parts = text.split(/(\*\*.*?\*\*)/);
      return parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index} className="font-bold text-indigo-700">{part.slice(2, -2)}</strong>;
          }
          return <span key={index} className="whitespace-pre-wrap">{part}</span>;
      });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-center sticky top-0 z-10">
         <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-1.5 rounded-full">
                <Icons.Bot size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">AI 英语助教</h1>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div 
              key={msg.id} 
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0 border border-indigo-200 self-start mt-1">
                  <Icons.Bot size={16} className="text-indigo-600" />
                </div>
              )}
              
              <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
                    isUser 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {/* Message Content */}
                  <div>
                      {isUser && msg.isAudio ? (
                          <div className="flex items-center space-x-2">
                              <Icons.Mic size={16} className="animate-pulse" />
                              <span>Voice Message</span>
                          </div>
                      ) : (
                          renderMessageText(msg.text)
                      )}
                  </div>
                </div>
                
                {/* Actions Row (Translate & Play) */}
                <div className="flex items-center mt-1 space-x-2 ml-1">
                    {!isUser && (
                        <>
                            <button 
                                onClick={() => speakText(msg.text, msg.id)}
                                className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${isSpeaking ? 'bg-indigo-100 text-indigo-600' : 'bg-transparent text-gray-400 hover:text-indigo-500'}`}
                                title="Play Audio"
                            >
                                {isSpeaking ? <Icons.Loader size={12} className="animate-spin" /> : <Icons.Volume2 size={12} />}
                            </button>

                            {!msg.translation && (
                                <button 
                                    onClick={() => handleTranslate(msg.id, msg.text)}
                                    disabled={msg.isTranslating}
                                    className="flex items-center text-[10px] text-gray-400 hover:text-indigo-500 transition-colors"
                                >
                                    {msg.isTranslating ? (
                                    <Icons.Loader size={10} className="animate-spin mr-1" />
                                    ) : (
                                    <Icons.Languages size={10} className="mr-1" />
                                    )}
                                    {msg.isTranslating ? '翻译中' : '翻译'}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Translation Display */}
                {msg.translation && (
                   <div className="mt-1 ml-1 bg-amber-50 text-amber-800 text-xs px-3 py-2 rounded-lg border border-amber-100 w-full animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-1 mb-0.5 opacity-60 text-[10px] uppercase font-bold tracking-wider">
                         <Icons.Languages size={10} /> 中文翻译
                      </div>
                      {msg.translation}
                   </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0 overflow-hidden self-start mt-1">
                   <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <Icons.Bot size={16} className="text-indigo-600" />
               </div>
               <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-1">
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 flex items-center gap-2 z-20">
         {/* Voice Mode Toggle / Recording Status */}
         <div className="relative">
             <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={isLoading}
                className={`p-2.5 rounded-full transition-all duration-200 ${
                    isRecording 
                    ? 'bg-red-500 text-white scale-110 shadow-lg ring-4 ring-red-100' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
             >
                {isRecording ? <Icons.Square size={20} className="animate-pulse" /> : <Icons.Mic size={20} />}
             </button>
             {isRecording && (
                 <div className="absolute -top-10 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap animate-bounce">
                     Release to Send
                 </div>
             )}
         </div>

         <input
           type="text"
           value={inputText}
           onChange={(e) => setInputText(e.target.value)}
           onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
           placeholder={isRecording ? "Listening..." : "Type or hold mic to speak..."}
           className="flex-1 bg-gray-100 text-gray-800 text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
           disabled={isLoading || isRecording}
         />
         
         <button 
           onClick={handleSendMessage}
           disabled={!inputText.trim() || isLoading || isRecording}
           className={`p-2.5 rounded-full transition-all ${
             inputText.trim() && !isLoading && !isRecording
               ? 'bg-indigo-600 text-white shadow-md active:scale-95' 
               : 'bg-gray-200 text-gray-400'
           }`}
         >
            <Icons.Send size={20} />
         </button>
      </div>
    </div>
  );
};

export default AIChatPage;