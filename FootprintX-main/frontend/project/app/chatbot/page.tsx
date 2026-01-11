'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  TrendingDown,
  Car,
  Home,
  Trash2,
  ShoppingBag,
  Plane,
  Wifi,
  Monitor,
  Cloud,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import apiClient from '@/lib/apiClient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'quick_reply';
  suggestions?: string[];
  quickReplies?: string[];
}

interface UserContext {
  recentCalculations?: any[];
  averageScore?: number;
  totalScore?: number;
  lastActivity?: string;
}

function ChatbotContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your personal eco-assistant 🌱. I can help you understand your carbon footprint, suggest ways to reduce emissions, and answer sustainability questions. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: [
        "How can I reduce my carbon footprint?",
        "Explain my dashboard data",
        "What's my digital footprint?",
        "Carbon offset options"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserContext();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserContext = async () => {
    try {
      const response = await apiClient.get('/api/calculate/history?limit=5');
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

  const processUserMessage = async (text: string) => {
    setIsLoading(true);
    
    // Simulate NLP processing with rule-based responses
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
    setIsLoading(false);
  };

  const generateBotResponse = async (userInput: string, context: UserContext): Promise<{
    text: string;
    type: 'text' | 'suggestion' | 'quick_reply';
    suggestions?: string[];
    quickReplies?: string[];
  }> => {
    const input = userInput.toLowerCase();
    
    // Contextual responses based on user data
    if (context.averageScore && context.averageScore > 15000) {
      if (input.includes('reduce') || input.includes('lower') || input.includes('decrease')) {
        return {
          text: `I notice your average carbon footprint is quite high (${context.averageScore} kg CO₂e). Here are some high-impact actions you can take:`,
          type: 'suggestion',
          suggestions: [
            'Switch to public transport for daily commute',
            'Reduce meat consumption by 50%',
            'Install energy-efficient appliances',
            'Avoid short flights - use trains instead'
          ],
          quickReplies: ['More transport tips', 'Energy saving ideas', 'Food choices']
        };
      }
    }

    // General sustainability knowledge base
    if (input.includes('transport') || input.includes('driving') || input.includes('car')) {
      return {
        text: "Transportation is often the largest source of personal emissions. Here are effective ways to reduce transport emissions:",
        type: 'suggestion',
        suggestions: [
          'Use public transport, cycling, or walking for short trips',
          'Carpool or use ride-sharing services',
          'Choose fuel-efficient vehicles or electric cars',
          'Combine errands into single trips',
          'Work from home when possible'
        ],
        quickReplies: ['Calculate my transport footprint', 'Public transport options', 'Electric vehicle info']
      };
    }

    if (input.includes('energy') || input.includes('electricity') || input.includes('power')) {
      return {
        text: "Home energy use is a major contributor to carbon footprints. Here are energy-saving strategies:",
        type: 'suggestion',
        suggestions: [
          'Switch to LED light bulbs (75% less energy)',
          'Use programmable thermostats',
          'Insulate your home properly',
          'Unplug electronics when not in use',
          'Use energy-efficient appliances (Energy Star rated)'
        ],
        quickReplies: ['Energy calculator', 'Home efficiency tips', 'Renewable energy options']
      };
    }

    if (input.includes('digital') || input.includes('internet') || input.includes('streaming')) {
      return {
        text: "Digital activities contribute to carbon emissions too! Here's how to reduce your digital footprint:",
        type: 'suggestion',
        suggestions: [
          'Use lower video quality for streaming',
          'Delete unused files from cloud storage',
          'Close unused browser tabs',
          'Use audio-only for music streaming',
          'Download content for offline viewing'
        ],
        quickReplies: ['Digital footprint calculator', 'Streaming optimization', 'Cloud storage tips']
      };
    }

    if (input.includes('food') || input.includes('diet') || input.includes('meat')) {
      return {
        text: "Food choices significantly impact your carbon footprint. Here are sustainable eating tips:",
        type: 'suggestion',
        suggestions: [
          'Reduce meat consumption (especially beef)',
          'Choose local and seasonal produce',
          'Minimize food waste',
          'Eat more plant-based proteins',
          'Avoid highly processed foods'
        ],
        quickReplies: ['Plant-based recipes', 'Food waste reduction', 'Local food sources']
      };
    }

    if (input.includes('offset') || input.includes('carbon offset')) {
      return {
        text: "Carbon offsets can help neutralize remaining emissions. Here are verified offset options:",
        type: 'suggestion',
        suggestions: [
          'Gold Standard certified projects',
          'Verified Carbon Standard credits',
          'Forestry and reforestation projects',
          'Renewable energy projects',
          'Methane capture initiatives'
        ],
        quickReplies: ['Offset calculator', 'Verified platforms', 'Project types']
      };
    }

    if (input.includes('dashboard') || input.includes('data') || input.includes('results')) {
      const contextText = context.averageScore ? 
        `Your current average carbon footprint is ${context.averageScore} kg CO₂e. ` : '';
      
      return {
        text: `${contextText}Your dashboard shows your carbon footprint trends and progress. Here's what the data means:`,
        type: 'suggestion',
        suggestions: [
          'Total Score: Sum of all your calculations',
          'Average Score: Your typical carbon footprint',
          'Trend Chart: Shows if you\'re improving over time',
          'Achievements: Track your sustainability milestones'
        ],
        quickReplies: ['View my dashboard', 'Explain my trends', 'Set goals']
      };
    }

    if (input.includes('help') || input.includes('navigate') || input.includes('how to')) {
      return {
        text: "I can help you navigate FootprintX! Here's what you can do:",
        type: 'suggestion',
        suggestions: [
          'Calculate your carbon footprint (physical & digital)',
          'View personalized reduction suggestions',
          'Track your progress on the dashboard',
          'Export your data as CSV or PDF reports',
          'Read sustainability tips and articles'
        ],
        quickReplies: ['Start calculation', 'View suggestions', 'Read tips', 'Export data']
      };
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return {
        text: "Hello! 👋 I'm here to help you with all things sustainability and carbon footprint tracking. What would you like to know?",
        type: 'text',
        quickReplies: [
          "How can I reduce my footprint?",
          "Explain my dashboard",
          "Digital footprint tips",
          "Carbon offset options"
        ]
      };
    }

    // Fallback response
    return {
      text: "I didn't quite understand that. Could you try asking about:\n• How to reduce your carbon footprint\n• Understanding your dashboard data\n• Digital footprint reduction\n• Carbon offset options\n• Transportation, energy, or food tips",
      type: 'text',
      quickReplies: [
        "Reduce my footprint",
        "Dashboard help",
        "Digital tips",
        "Offset options"
      ]
    };
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transport': return <Car className="h-4 w-4" />;
      case 'energy': return <Home className="h-4 w-4" />;
      case 'food': return <ShoppingBag className="h-4 w-4" />;
      case 'digital': return <Wifi className="h-4 w-4" />;
      case 'waste': return <Trash2 className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🌱 Eco Assistant Chatbot</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your personal sustainability assistant powered by NLP. Ask questions about carbon footprints, 
          get personalized suggestions, and learn how to live more sustainably.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-600" />
              <CardTitle>Eco Assistant</CardTitle>
              <Badge variant="secondary">AI Powered</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.sender === 'bot' && <Bot className="h-4 w-4 mt-1 text-green-600" />}
                          {message.sender === 'user' && <User className="h-4 w-4 mt-1" />}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="mt-3 space-y-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="w-full text-left justify-start"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <Lightbulb className="h-3 w-3 mr-2" />
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Quick Replies */}
                        {message.quickReplies && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.quickReplies.map((reply, index) => (
                              <Button
                                key={index}
                                variant="secondary"
                                size="sm"
                                onClick={() => handleQuickReply(reply)}
                                className="text-xs"
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
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-green-600" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask me about sustainability, carbon footprints, or how to reduce emissions..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Natural Language Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask questions in natural language about sustainability, carbon footprints, and environmental topics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                Personalized Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get tailored recommendations based on your carbon footprint data and recent activities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Contextual Awareness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The chatbot understands your dashboard data and provides relevant, actionable advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <AuthGuard>
      <ChatbotContent />
    </AuthGuard>
  );
}
