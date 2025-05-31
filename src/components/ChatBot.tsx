
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Minimize2, Loader2 } from "lucide-react";
import { mockDataService } from '@/services/dataService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface DataVisualizationProps {
  onDataReceived: (type: string, data: any[], title: string) => void;
}

const ChatBot: React.FC<DataVisualizationProps> = ({ onDataReceived }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hello! I'm your GenUI assistant. Ask me about 'SOP deviation', 'Incomplete cases', or 'Long running cases' to visualize real data!", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSOPDeviation = async () => {
    try {
      const data = await mockDataService.getSOPDeviationTableData();
      onDataReceived('sop-table', data, 'SOP Deviation Analysis');
      
      const successMessage: Message = {
        id: Date.now(),
        text: `Successfully loaded SOP deviation data! Found ${data.length} patterns with detailed analysis. The data has been visualized as a table on your dashboard.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Error fetching SOP deviation data:', error);
      const errorMessage: Message = {
        id: Date.now(),
        text: "Sorry, I couldn't fetch the SOP deviation data. Please check that the sopdeviation.json file is accessible.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleIncompleteCases = async () => {
    try {
      const data = await mockDataService.getIncompleteCasesChartData();
      onDataReceived('incomplete-bar', data, 'Incomplete Cases Analysis');
      
      const successMessage: Message = {
        id: Date.now(),
        text: `Successfully loaded incomplete cases data! The analysis shows the distribution of complete vs incomplete cases. The data has been visualized as a bar chart on your dashboard.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Error fetching incomplete cases data:', error);
      const errorMessage: Message = {
        id: Date.now(),
        text: "Sorry, I couldn't fetch the incomplete cases data. Please check that the incompletecases.json file is accessible.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleLongRunningCases = async () => {
    try {
      const data = await mockDataService.getLongRunningCasesChartData();
      onDataReceived('longrunning-bar', data, 'Long Running Cases Analysis');
      
      const successMessage: Message = {
        id: Date.now(),
        text: `Successfully loaded long running cases data! Found ${data[0]?.value || 0} long running cases. The data has been visualized as a bar chart on your dashboard.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Error fetching long running cases data:', error);
      const errorMessage: Message = {
        id: Date.now(),
        text: "Sorry, I couldn't fetch the long running cases data. Please check that the longrunning_case.json file is accessible.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access data visualization features.",
        variant: "destructive",
      });
      return;
    }
    
    const userMessage: Message = { 
      id: Date.now(), 
      text: message, 
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    
    const lowerMessage = message.toLowerCase();
    
    try {
      if (lowerMessage.includes('sop deviation')) {
        await handleSOPDeviation();
      } else if (lowerMessage.includes('incomplete cases')) {
        await handleIncompleteCases();
      } else if (lowerMessage.includes('long running cases')) {
        await handleLongRunningCases();
      } else {
        // Default bot response for other queries
        setTimeout(() => {
          const botResponse: Message = { 
            id: Date.now() + 1, 
            text: "I can help you visualize data! Try asking about:\n• 'SOP deviation' - for detailed pattern analysis\n• 'Incomplete cases' - for case completion status\n• 'Long running cases' - for case duration analysis", 
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botResponse]);
        }, 1000);
      }
    } finally {
      setIsLoading(false);
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
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[85%]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t p-3 flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about SOP deviation, incomplete cases, or long running cases..."
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
