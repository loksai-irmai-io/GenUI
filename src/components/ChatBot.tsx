
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Minimize2, Loader2 } from "lucide-react";
import { sopDeviationService, SOPCountData, SOPPatternData } from '@/services/sopDeviationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SOPDeviationProps {
  onSOPDataReceived: (countData: SOPCountData, patternsData: SOPPatternData[]) => void;
}

const ChatBot: React.FC<SOPDeviationProps> = ({ onSOPDataReceived }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hello! I'm your GenUI assistant. Type 'SOP deviation' to fetch and visualize SOP deviation data from the API!", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSOPDeviation = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access SOP deviation data.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch data from both endpoints (with fallback)
      const [countData, patternsData] = await Promise.all([
        sopDeviationService.getSOPDeviationCount(),
        sopDeviationService.getSOPDeviationPatterns()
      ]);

      console.log('Fetched count data:', countData);
      console.log('Fetched patterns data:', patternsData);

      // Notify parent component with the data
      onSOPDataReceived(countData, patternsData);

      // Add success message to chat
      const successMessage: Message = {
        id: Date.now(),
        text: `Successfully fetched SOP deviation data! Found ${countData.count} deviations (${countData.percentage}% of total) and ${patternsData.length} pattern types. The data has been visualized on your dashboard.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);

      toast({
        title: "Data Fetched Successfully",
        description: "SOP deviation data has been loaded and visualized.",
      });

    } catch (error) {
      console.error('Error fetching SOP deviation data:', error);
      
      const errorMessage: Message = {
        id: Date.now(),
        text: "Sorry, I couldn't fetch the SOP deviation data. Please make sure the API endpoints are accessible and try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "API Error",
        description: "Failed to fetch SOP deviation data. Please check API connectivity.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage: Message = { 
      id: Date.now(), 
      text: message, 
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Check if message contains "SOP deviation"
    if (message.toLowerCase().includes('sop deviation')) {
      await handleSOPDeviation();
    } else {
      // Default bot response for other queries
      setTimeout(() => {
        const botResponse: Message = { 
          id: Date.now() + 1, 
          text: "I can help you with SOP deviation analysis. Try typing 'SOP deviation' to fetch and visualize real-time data from the API endpoints!", 
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
    
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-8 h-8 text-white" />
        </Button>
      ) : (
        <Card className="w-96 h-[500px] shadow-xl border-0 bg-white">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>GenUI Assistant</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[440px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[85%]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Fetching SOP deviation data...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t p-3 flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type 'SOP deviation' to fetch data..."
                className="flex-1 text-sm"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatBot;
