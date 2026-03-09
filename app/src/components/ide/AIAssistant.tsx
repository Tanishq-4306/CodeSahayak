import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  Bug,
  BookOpen,
  ChevronRight,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { useIDEStore } from '@/store/ideStore';
import { useLanguageStore } from '@/store/languageStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const quickActions = [
  { id: 'explain', label: 'Explain Code', icon: BookOpen, color: 'text-blue-400' },
  { id: 'debug', label: 'Debug', icon: Bug, color: 'text-red-400' },
  { id: 'hint', label: 'Get Hint', icon: Lightbulb, color: 'text-yellow-400' },
  { id: 'improve', label: 'Improve', icon: Sparkles, color: 'text-purple-400' },
];

export function AIAssistant() {
  const {
    aiMessages,
    aiPanelVisible,
    aiPanelWidth,
    isAIStreaming,
    toggleAIPanel,
    addAIMessage,
    clearAIChat,
  } = useIDEStore();
  
  const { currentLanguage } = useLanguageStore();
  const [input, setInput] = useState('');
  const [width, setWidth] = useState(aiPanelWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);
  
  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        setWidth(Math.max(280, Math.min(500, newWidth)));
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    addAIMessage({ role: 'user', content: input });
    const userInput = input;
    setInput('');
    
    // Get current code
    const { openTabs, activeTabId } = useIDEStore.getState();
    const activeTab = openTabs.find((t) => t.id === activeTabId);
    
    try {
      // Call Gurujii API
      const response = await fetch('http://localhost:5000/api/gurujii/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: activeTab?.content || '',
          message: userInput,
          language: currentLanguage,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      // Add AI response
      addAIMessage({
        role: 'assistant',
        content: result.explanation || "I'm here to help! Please provide more details about what you need.",
      });
      
      // Play voice if available
      if (result.voiceUrl) {
        const audio = new Audio(`http://localhost:5000${result.voiceUrl}`);
        audio.play().catch(err => console.error('Failed to play voice:', err));
      }
    } catch (error) {
      console.error('Gurujii API error:', error);
      
      // Fallback response
      const fallbackResponses: Record<string, string> = {
        en: "I'm having trouble connecting to my AI brain right now. Please make sure the Gurujii API is running on http://localhost:5000",
        hi: "मुझे अभी अपने AI दिमाग से जुड़ने में परेशानी हो रही है। कृपया सुनिश्चित करें कि Gurujii API http://localhost:5000 पर चल रहा है",
        ta: "எனது AI மூளையுடன் இணைவதில் சிக்கல் உள்ளது. Gurujii API http://localhost:5000 இல் இயங்குகிறதா என்பதை உறுதிப்படுத்தவும்",
      };
      
      addAIMessage({
        role: 'assistant',
        content: fallbackResponses[currentLanguage as keyof typeof fallbackResponses] || fallbackResponses.en,
      });
    }
  };
  
  const handleQuickAction = async (actionId: string) => {
    const { openTabs, activeTabId } = useIDEStore.getState();
    const activeTab = openTabs.find((t) => t.id === activeTabId);
    
    if (!activeTab) {
      addAIMessage({
        role: 'assistant',
        content: 'Please open a file first so I can help you with it!',
      });
      return;
    }
    
    const actionPrompts: Record<string, string> = {
      explain: 'Please explain this code in detail',
      debug: 'Please debug this code and find any errors',
      hint: 'Give me a hint about how to improve this code',
      improve: 'How can I improve this code? Suggest best practices',
    };
    
    const userMessage = actionPrompts[actionId] || 'Help me with this code';
    addAIMessage({ role: 'user', content: userMessage });
    
    try {
      // Call Gurujii API
      const response = await fetch('http://localhost:5000/api/gurujii/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: activeTab.content,
          message: userMessage,
          language: currentLanguage,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      // Add AI response
      addAIMessage({
        role: 'assistant',
        content: result.explanation || "I've analyzed your code. Let me help you with that!",
      });
      
      // Play voice if available
      if (result.voiceUrl) {
        const audio = new Audio(`http://localhost:5000${result.voiceUrl}`);
        audio.play().catch(err => console.error('Failed to play voice:', err));
      }
    } catch (error) {
      console.error('Gurujii API error:', error);
      
      // Fallback response
      addAIMessage({
        role: 'assistant',
        content: 'Unable to connect to Gurujii AI. Please ensure the API is running on http://localhost:5000',
      });
    }
  };
  
  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  if (!aiPanelVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={toggleAIPanel}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-3 py-3 bg-[#6C5CE7] text-white rounded-l-lg shadow-lg hover:bg-[#5B4BD6] transition-colors"
      >
        <Bot className="w-5 h-5" />
      </motion.button>
    );
  }
  
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width }}
      className="flex flex-col bg-[#1E1E2E] border-l border-[#2D2D3A]"
    >
      {/* Resize Handle */}
      <div
        onMouseDown={() => setIsResizing(true)}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[#6C5CE7] transition-colors"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252532] border-b border-[#2D2D3A]">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#6C5CE7]" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Gurujii
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-gray-400 hover:text-white"
            onClick={clearAIChat}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-gray-400 hover:text-white"
            onClick={toggleAIPanel}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-3 py-2 border-b border-[#2D2D3A]">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className="flex items-center gap-2 px-3 py-2 bg-[#2D2D3A] hover:bg-[#3D3D4A] rounded-lg transition-colors text-left"
            >
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span className="text-xs text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 gurujii-scrollbar"
          style={{ 
            maxHeight: '100%',
            overflowY: 'scroll',
            scrollbarWidth: 'thin',
            scrollbarColor: '#6C5CE7 #2D2D3A'
          }}
        >
          <div className="space-y-4 pr-2">
            {aiMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-[#6C5CE7] text-white'
                      : 'bg-[#2D2D3A] text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === 'assistant' ? (
                      <Bot className="w-4 h-4 text-[#6C5CE7]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-white/20" />
                    )}
                    <span className="text-xs font-medium">
                      {message.role === 'assistant' ? 'Gurujii' : 'You'}
                    </span>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="ml-auto text-gray-500 hover:text-white transition-colors"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {message.content}
                  </div>
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-[#2D2D3A]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your code..."
            className="flex-1 px-3 py-2 bg-[#2D2D3A] text-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6C5CE7] placeholder-gray-500"
          />
          <Button
            type="submit"
            size="icon"
            className="w-9 h-9 bg-[#6C5CE7] hover:bg-[#5B4BD6]"
            disabled={!input.trim() || isAIStreaming}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
