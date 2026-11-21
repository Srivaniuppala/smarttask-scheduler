import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { useTasks } from '../context/TaskContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Plus, 
  MessageSquare, 
  Trash2,
  Clock
} from 'lucide-react';

export const AIAssistant = () => {
  const { tasks } = useTasks();
  const [conversations, setConversations] = useState([
    { id: 'c1', title: 'Daily Prioritization', date: 'Today' },
    { id: 'c2', title: 'ML Project Subtasks', date: 'Yesterday' },
    { id: 'c3', title: 'Weekly Sprint Retrospective', date: 'Nov 18' },
  ]);
  const [activeConvId, setActiveConvId] = useState('c1');

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Hi! Ask me about your tasks, priorities, schedule, or ways to break down a piece of work.',
      time: '09:00 AM'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    const userMsg = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulate slight cognitive typing delay
      await new Promise(r => setTimeout(r, 600));
      const aiReply = await aiService.askAssistant(userText, messages, tasks);
      
      const aiMsg = {
        id: `m-ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    const newId = `c-${Date.now()}`;
    const newConv = { id: newId, title: 'New Conversation', date: 'Just now' };
    setConversations([newConv, ...conversations]);
    setActiveConvId(newId);
    setMessages([
      {
        id: `m-init-${Date.now()}`,
        sender: 'ai',
        text: 'This optional assistant can help with task questions and planning. Answers require an OpenAI API key; without one, a limited local response is used.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Quick suggestion chips
  const suggestedPrompts = [
    "What should I focus on today?",
    "Break down my machine learning assignment",
    "How can I improve my productivity score?",
    "Plan a 4-hour sprint for my pending tasks"
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Left Chat History Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between bg-white">
        <div>
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Conversations
            </span>
            <button
              onClick={startNewChat}
              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto max-h-48 md:max-h-[calc(100vh-14rem)]">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-2 rounded-md flex items-center gap-2 text-xs transition-colors ${
                  activeConvId === conv.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate flex-1">{conv.title}</span>
                <span className="text-[10px] text-gray-400">{conv.date}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-[11px] text-gray-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Optional AI feature — requires backend configuration</span>
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col justify-between bg-white">
        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  isUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200 text-blue-600'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`space-y-1 ${isUser ? 'text-right' : ''}`}>
                  <div className={`p-3.5 rounded-lg text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 border border-gray-200 text-gray-900'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-md">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts & Input Area */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white space-y-3">
          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about your tasks, schedule, or time management..."
              className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className={`p-2.5 text-white rounded-lg transition-colors ${
                !inputMessage.trim() || isTyping
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
