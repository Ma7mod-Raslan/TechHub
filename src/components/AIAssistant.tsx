import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, User } from 'lucide-react';
import { Button } from './ui/button';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIAssistantProps {
  contextType?: 'course' | 'dashboard' | 'assignments' | 'compiler' | 'general';
}

export default function AIAssistant({ contextType = 'general' }: AIAssistantProps) {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI learning assistant. I can help you with questions about courses, assignments, coding help, or general guidance. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getContextualResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Context-specific responses
    if (contextType === 'dashboard') {
      if (lowerMessage.includes('progress') || lowerMessage.includes('track')) {
        return 'You can track your learning progress through the dashboard cards showing completed courses, assignments, and certificates. The progress bars give you a visual representation of your achievements!';
      }
      if (lowerMessage.includes('course') || lowerMessage.includes('enroll')) {
        return 'To enroll in a new course, navigate to "My Courses" from the sidebar and browse available courses. Click "Enroll" on any course that interests you to get started!';
      }
    }
    
    if (contextType === 'assignments') {
      if (lowerMessage.includes('submit') || lowerMessage.includes('deadline')) {
        return 'To submit an assignment, click on it from your assignments list, complete the required tasks, and upload your work before the deadline. You\'ll receive feedback from your instructor!';
      }
      if (lowerMessage.includes('late') || lowerMessage.includes('overdue')) {
        return 'If you miss a deadline, you can still submit late assignments, but they may be marked as overdue. It\'s best to contact your instructor if you need an extension.';
      }
    }
    
    if (contextType === 'compiler') {
      if (lowerMessage.includes('language') || lowerMessage.includes('support')) {
        return 'The compiler supports multiple programming languages including JavaScript, Python, Java, C++, and more. Select your preferred language from the dropdown menu!';
      }
      if (lowerMessage.includes('error') || lowerMessage.includes('debug')) {
        return 'When you encounter an error, check the console output for details. Common issues include syntax errors, missing semicolons, or undefined variables. I can help explain specific error messages!';
      }
    }
    
    // General responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return 'I\'m here to help! You can ask me about navigating the platform, understanding course content, completing assignments, or getting coding help. What specific area would you like assistance with?';
    }
    
    if (lowerMessage.includes('certificate')) {
      return 'You can earn certificates by completing all course lectures and assignments. View your certificates in the "Certificates" section from the sidebar menu!';
    }
    
    if (lowerMessage.includes('community') || lowerMessage.includes('forum')) {
      return 'Join our community forum to connect with other learners, ask questions, share projects, and collaborate. Access it through the "Community" menu in the sidebar!';
    }
    
    if (lowerMessage.includes('roadmap')) {
      return 'Learning roadmaps provide structured paths to achieve your goals. Check out the "Roadmaps" section to find curated learning paths for different career tracks!';
    }
    
    if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
      return 'For hands-on coding practice, use our built-in compiler accessible from the sidebar. You can write, run, and test code in multiple programming languages!';
    }
    
    if (lowerMessage.includes('profile') || lowerMessage.includes('settings')) {
      return 'You can update your profile information and preferences in the "Settings" section. Customize your learning experience to match your needs!';
    }
    
    // Default response
    return 'That\'s a great question! I can help you with courses, assignments, coding problems, certificates, and navigating the platform. Could you provide more details about what you need help with?';
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      role: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responseContent = getContextualResponse(currentMessage);
      
      const aiResponse: ChatMessage = {
        id: chatMessages.length + 2,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const quickActions = contextType === 'compiler' 
    ? ['How do I run code?', 'Supported languages?', 'Debug help']
    : contextType === 'assignments'
    ? ['How to submit?', 'Deadline info', 'Late submission']
    : ['Getting started', 'Course help', 'Certificate info'];

  return (
    <>
      {/* AI Assistant Chat */}
      <AnimatePresence>
        {showAIAssistant && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 right-4 md:right-8 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 border border-violet-200"
          >
            <div className="bg-gradient-to-r from-violet-600 to-cyan-500 p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white">AI Learning Assistant</h3>
                    <p className="text-white/80 text-xs">Ask me anything</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIAssistant(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-full transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="h-96 overflow-y-auto scrollbar-hide p-4 bg-gray-50">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                      }`}>{message.timestamp}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2 justify-start"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="w-2 h-2 bg-violet-600 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                          className="w-2 h-2 bg-violet-600 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                          className="w-2 h-2 bg-violet-600 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            
            <div className="p-4 border-t bg-white rounded-b-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 px-4"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setNewMessage(action)}
                    className="text-xs px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full hover:bg-violet-100 transition-colors duration-200"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAIAssistant(!showAIAssistant)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center z-40 group"
      >
        <AnimatePresence mode="wait">
          {showAIAssistant ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Bot className="h-6 w-6 text-white" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2
                }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          AI Assistant
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </div>
      </motion.button>
    </>
  );
}
