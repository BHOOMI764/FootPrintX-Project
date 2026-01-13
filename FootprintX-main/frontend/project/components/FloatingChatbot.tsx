'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'quick_reply';
  action?: string;
  suggestions?: string[];
  quickReplies?: string[];
}

interface UserContext {
  recentCalculations?: any[];
  averageScore?: number;
  totalScore?: number;
  lastActivity?: string;
}

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your eco-assistant 🌱. I can help with carbon footprint questions, sustainability tips, and app navigation. What can I help you with?",
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: [
        "How to reduce my footprint?",
        "Explain my dashboard",
        "Digital footprint tips",
        "Carbon offset options"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserContext();
      fetchChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserContext = async () => {
    try {
      const response = await apiClient.get('/api/calculate/history?limit=3');
      const data = response.data;
      setUserContext({
        recentCalculations: data.calculations || [],
        averageScore: data.summary?.averageScore || 0,
        totalScore: data.summary?.totalScore || 0,
        lastActivity: data.calculations?.[0]?.createdAt
      });
    } catch (error) {
      console.error('Error fetching user context:', error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await apiClient.get('/api/chatbot/history');
      const msgs = res.data?.messages || [];

      if (msgs.length > 0) {
        const mapped: Message[] = msgs.map((m: any) => ({
          id: m.id?.toString() || Date.now().toString(),
          text: m.message || '',
          sender: m.role === 'assistant' ? 'bot' : 'user',
          timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
          type: m.meta?.type || 'text',
          suggestions: m.meta?.suggestions,
          quickReplies: m.meta?.quickReplies
        }));

        setMessages(mapped);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const generateBotResponse = async (userInput: string, context: UserContext): Promise<{
    text: string;
    type: 'text' | 'suggestion' | 'quick_reply';
    suggestions?: string[];
    quickReplies?: string[];
  }> => {
    const input = userInput.toLowerCase();
    
    // Quick navigation responses
    if (input.includes('dashboard') || input.includes('view my data')) {
      return {
        text: "I can help you understand your dashboard! Your dashboard shows your carbon footprint trends, total score, and achievements. Would you like me to explain any specific part?",
        type: 'text',
        quickReplies: ['Explain my trends', 'What is my total score?', 'How to improve?']
      };
    }

    if (input.includes('calculate') || input.includes('footprint calculation')) {
      return {
        text: "I can guide you through calculating your carbon footprint! You can track both physical emissions (transport, energy, waste) and digital emissions (streaming, cloud storage). Which type would you like to start with?",
        type: 'suggestion',
        suggestions: [
          'Calculate physical carbon footprint',
          'Calculate digital carbon footprint',
          'View calculation history'
        ],
        quickReplies: ['Physical footprint', 'Digital footprint', 'View history']
      };
    }

    if (input.includes('suggestions') || input.includes('reduce') || input.includes('improve')) {
      return {
        text: "Great question! Here are some effective ways to reduce your carbon footprint:",
        type: 'suggestion',
        suggestions: [
          'Switch to public transport or cycling',
          'Reduce meat consumption',
          'Use energy-efficient appliances',
          'Minimize digital streaming quality',
          'Reduce waste and recycle more'
        ],
        quickReplies: ['Transport tips', 'Energy saving', 'Digital footprint', 'Food choices']
      };
    }

    if (input.includes('export') || input.includes('download') || input.includes('report')) {
      return {
        text: "You can export your carbon footprint data! Go to the Export page to download your data as CSV or PDF reports. This is great for workplace reporting or personal records.",
        type: 'text',
        quickReplies: ['How to export?', 'What data is included?', 'PDF vs CSV']
      };
    }

    if (input.includes('leaderboard') || input.includes('compare') || input.includes('ranking')) {
      return {
        text: "The leaderboard shows how your carbon footprint compares with other users. It's ranked by total score - lower scores are better for the environment!",
        type: 'text',
        quickReplies: ['How is ranking calculated?', 'How to improve my rank?', 'View leaderboard']
      };
    }

    if (input.includes('complaints') || input.includes('report issue') || input.includes('concern')) {
      return {
        text: "You can submit environmental complaints and concerns through the Complaints page. You can also tweet about climate issues directly from there!",
        type: 'text',
        quickReplies: ['How to submit complaint?', 'Tweet about climate', 'What happens next?']
      };
    }

    if (input.includes('tips') || input.includes('blog') || input.includes('learn')) {
      return {
        text: "Check out our Tips & Blog section for educational content about sustainability! You'll find practical tips, articles, and insights about reducing your environmental impact.",
        type: 'text',
        quickReplies: ['View tips', 'Read blog', 'Sustainability articles']
      };
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return {
        text: "Hello! 👋 I'm here to help you with FootprintX. I can explain features, answer sustainability questions, and guide you through the app. What would you like to know?",
        type: 'text',
        quickReplies: [
          "How to use the app?",
          "Sustainability tips",
          "Explain my data",
          "Navigation help"
        ]
      };
    }

    if (input.includes('unlock all') || input.includes('unlock achievements') || input.includes('unlock all achievements')) {
      return {
        text: "I'll unlock all achievements for you locally. Open the Gamification page to view them.",
        type: 'action',
        action: 'unlock_all',
        quickReplies: ['Open gamification', 'Reset achievements']
      } as any;
    }

    // Fallback response
    return {
      text: "I can help you with:\n• Understanding your carbon footprint data\n• Navigation and app features\n• Sustainability tips and advice\n• Explaining calculations and results\n\nWhat would you like to know?",
      type: 'text',
      quickReplies: [
        "App navigation",
        "Carbon footprint help",
        "Sustainability tips",
        "Data explanation"
      ]
    };
  };

  const processUserMessage = async (text: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/api/chatbot/process', {
        message: text,
        context: userContext
      });

      const botMessage: Message = {
        id: Date.now().toString(),
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        type: response.data.type,
        suggestions: response.data.suggestions,
        quickReplies: response.data.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);

      if (response.data.type === 'action' && response.data.action === 'unlock_all') {
        try { localStorage.setItem('unlockAllAchievements', 'true'); } catch (e) {}
        const confirmMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: 'All achievements have been unlocked locally. Visit the Gamification page to view them.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, confirmMsg]);
      }
    } catch (error) {
      // Fallback to local processing if API fails
      const response = await generateBotResponse(text, userContext);
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type,
        suggestions: response.suggestions,
        quickReplies: response.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);

      // Handle local action responses (e.g., unlock_all)
      if (response.type === 'action' && (response as any).action === 'unlock_all') {
        try { localStorage.setItem('unlockAllAchievements', 'true'); } catch (e) {}
        const confirmMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: 'All achievements have been unlocked locally. Visit the Gamification page to view them.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, confirmMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    await processUserMessage(inputText);
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    handleSendMessage();
  };

  const handleSuggestionClick = (suggestion: string) => {
    const suggestionMessage: Message = {
      id: Date.now().toString(),
      text: suggestion,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, suggestionMessage]);
    processUserMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-green-600 hover:bg-green-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white border rounded-lg shadow-xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-green-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-green-600" />
            <span className="font-semibold">Eco Assistant</span>
            <Badge variant="secondary" className="text-xs">AI</Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[350px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === 'bot' && <Bot className="h-3 w-3 mt-1 text-green-600" />}
                      {message.sender === 'user' && <User className="h-3 w-3 mt-1" />}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="mt-2 space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full text-left justify-start text-xs h-auto py-1"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <Lightbulb className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Quick Replies */}
                    {message.quickReplies && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.quickReplies.map((reply, index) => (
                          <Button
                            key={index}
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQuickReply(reply)}
                            className="text-xs h-6 px-2"
                          >
                            {reply}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-3 w-3 text-green-600" />
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask me anything..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                  size="sm"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
