import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, Settings, Brain, MapPin, Coffee, Waves, Cpu } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { AIConfigModal } from './components/AIConfigModal';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useAI } from './hooks/useAI';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { AIConfig, DEFAULT_AI_CONFIG, AI_PROVIDERS } from './types/ai-providers';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { startListening, stopListening, transcript, isSupported } = useSpeechRecognition();
  const { sendMessage, isLoading } = useAI(aiConfig);
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setAiConfig({ ...DEFAULT_AI_CONFIG, ...parsedConfig });
      } catch (error) {
        console.error('Error parsing saved config:', error);
      }
    } else {
      setShowConfigModal(true);
    }
  }, []);

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    if (!aiConfig.apiKey && aiConfig.provider !== 'custom') {
      setShowConfigModal(true);
      return;
    }

    // For custom endpoints, check if we have required fields
    if (aiConfig.provider === 'custom' && !aiConfig.customModel) {
      setShowConfigModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await sendMessage(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Automatically speak the response
      speak(response);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please check your configuration and try again.';
      
      if (error instanceof Error) {
        // Show more detailed error message for better user understanding
        errorMessage = `Sorry, I encountered an error:\n\n${error.message}`;
      }
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      if (inputText.trim()) {
        handleSendMessage(inputText);
      }
    } else {
      startListening();
      setIsListening(true);
      stopSpeaking(); // Stop any current speech
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleConfigSubmit = (config: AIConfig) => {
    setAiConfig(config);
    localStorage.setItem('ai-config', JSON.stringify(config));
    setShowConfigModal(false);
  };

  const handleOpenConfigModal = () => {
    setShowConfigModal(true);
  };

  const getConfigStatus = () => {
    const provider = AI_PROVIDERS.find(p => p.id === aiConfig.provider);
    const hasRequiredKey = !provider?.requiresApiKey || aiConfig.apiKey;
    const hasRequiredModel = aiConfig.provider !== 'custom' || aiConfig.customModel;
    
    if (!hasRequiredKey || !hasRequiredModel) {
      return { 
        text: 'Setup Required', 
        color: 'text-red-500', 
        bgColor: 'bg-red-50 border-red-200',
        icon: '⚠️'
      };
    }
    
    const displayModel = aiConfig.provider === 'custom' 
      ? aiConfig.customModel 
      : provider?.models.find(m => m.id === aiConfig.model)?.name;
    
    return { 
      text: `Ready with ${provider?.name}${displayModel ? ` (${displayModel})` : ''}!`, 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-50 border-emerald-200',
      icon: provider?.icon || '🤖'
    };
  };

  const configStatus = getConfigStatus();

  const quickQuestions = [
    "What's your life story in a few sentences?",
    "What's your biggest superpower?",
    "Tell me about your AI projects",
    "What's it like being from Kerala?",
    "How did you get into machine learning?",
    "What misconceptions do people have about you?"
  ];

  const handleQuickQuestion = (question: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === aiConfig.provider);
    const hasRequiredKey = !provider?.requiresApiKey || aiConfig.apiKey;
    const hasRequiredModel = aiConfig.provider !== 'custom' || aiConfig.customModel;
    
    if (hasRequiredKey && hasRequiredModel) {
      handleSendMessage(question);
    } else {
      setShowConfigModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-100/20 to-emerald-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-emerald-200/50 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg">
                    <Coffee className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Ajay Prasad P K
                  </h1>
                  <div className="flex items-center space-x-3 text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium">AI Professional • Calicut, Kerala</span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-1 text-xs bg-emerald-100 px-2 py-1 rounded-full">
                      <Waves className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">God's Own Country</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Enhanced AI Config Status */}
                <div className={`hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full border ${configStatus.bgColor} transition-all duration-300`}>
                  <span className="text-sm">{configStatus.icon}</span>
                  <Cpu className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm font-semibold ${configStatus.color}`}>
                    {configStatus.text}
                  </span>
                </div>
                
                {/* Enhanced Settings Button */}
                <button
                  onClick={handleOpenConfigModal}
                  className="p-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  title="AI Configuration"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <span className="text-white text-xs">🥥</span>
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                  നമസ്കാരം! I'm Ajay
                </h2>
                <p className="text-gray-600 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                  AI professional from Kerala with expertise in machine learning, Python development, and network security. 
                  Ask me anything about my journey, experiences, or technical background! 
                  <span className="inline-block ml-2">☕</span>
                </p>
                
                {(!aiConfig.apiKey && aiConfig.provider !== 'custom') || (aiConfig.provider === 'custom' && !aiConfig.customModel) && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8 max-w-md mx-auto shadow-lg">
                    <div className="flex items-center justify-center space-x-2 text-yellow-800 mb-3">
                      <Cpu className="w-6 h-6" />
                      <span className="font-bold text-lg">Setup Required</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-4">
                      Please configure your AI provider to start our conversation!
                    </p>
                    <button
                      onClick={handleOpenConfigModal}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Configure AI
                    </button>
                  </div>
                )}
                
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-2 border-emerald-200/50 shadow-xl mb-8">
                  <h3 className="font-bold text-gray-900 mb-6 text-xl">Get to know me better:</h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <div className="space-y-3">
                      {quickQuestions.slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          disabled={(!aiConfig.apiKey && aiConfig.provider !== 'custom') || (aiConfig.provider === 'custom' && !aiConfig.customModel)}
                          className="flex items-center space-x-3 w-full text-left p-3 rounded-xl hover:bg-emerald-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                            index === 0 ? 'from-emerald-500 to-teal-500' :
                            index === 1 ? 'from-teal-500 to-cyan-500' :
                            'from-cyan-500 to-blue-500'
                          } group-hover:scale-110 transition-transform duration-200`}></div>
                          <span className="group-hover:text-emerald-700 transition-colors duration-200">"{question}"</span>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {quickQuestions.slice(3, 6).map((question, index) => (
                        <button
                          key={index + 3}
                          onClick={() => handleQuickQuestion(question)}
                          disabled={(!aiConfig.apiKey && aiConfig.provider !== 'custom') || (aiConfig.provider === 'custom' && !aiConfig.customModel)}
                          className="flex items-center space-x-3 w-full text-left p-3 rounded-xl hover:bg-emerald-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                            index === 0 ? 'from-emerald-600 to-teal-600' :
                            index === 1 ? 'from-teal-600 to-cyan-600' :
                            'from-cyan-600 to-blue-600'
                          } group-hover:scale-110 transition-transform duration-200`}></div>
                          <span className="group-hover:text-emerald-700 transition-colors duration-200">"{question}"</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fun Facts Section */}
                <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-6 border border-emerald-200 shadow-lg">
                    <div className="text-2xl mb-2">🎓</div>
                    <h4 className="font-semibold text-emerald-800 mb-1">Education</h4>
                    <p className="text-sm text-emerald-700">M.Sc AI from Kerala University</p>
                  </div>
                  <div className="bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl p-6 border border-teal-200 shadow-lg">
                    <div className="text-2xl mb-2">💼</div>
                    <h4 className="font-semibold text-teal-800 mb-1">Experience</h4>
                    <p className="text-sm text-teal-700">AI Intern at Technopark</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-6 border border-cyan-200 shadow-lg">
                    <div className="text-2xl mb-2">🏆</div>
                    <h4 className="font-semibold text-cyan-800 mb-1">Achievement</h4>
                    <p className="text-sm text-cyan-700">UGC-NET Qualified (Top 6%)</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-xl border border-emerald-200 max-w-xs">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Ajay is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Voice Visualizer */}
        {isListening && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 m-4 max-w-sm w-full text-center shadow-2xl border-2 border-emerald-200">
              <VoiceVisualizer isActive={isListening} />
              <p className="text-gray-800 mt-6 mb-2 font-bold text-lg">Listening...</p>
              <p className="text-sm text-gray-600 mb-6">Speak clearly into your microphone</p>
              <button
                onClick={handleVoiceToggle}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                Stop Listening
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Input Area */}
        <div className="bg-white/80 backdrop-blur-lg border-t border-emerald-200/50 shadow-lg">
          <div className="max-w-5xl mx-auto p-6">
            <form onSubmit={handleSubmit} className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    (aiConfig.apiKey || aiConfig.provider === 'custom') && (aiConfig.provider !== 'custom' || aiConfig.customModel)
                      ? "Type your message or use voice... നമസ്കാരം!" 
                      : "Please configure your AI provider first..."
                  }
                  className="w-full px-6 py-4 pr-14 bg-white/90 backdrop-blur-sm border-2 border-emerald-300/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-lg disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 text-lg"
                  disabled={isLoading || (!aiConfig.apiKey && aiConfig.provider !== 'custom') || (aiConfig.provider === 'custom' && !aiConfig.customModel)}
                />
                {isSpeaking && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Volume2 className="w-6 h-6 text-emerald-500 animate-pulse" />
                  </div>
                )}
              </div>
              
              {isSupported && (
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    isListening
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none'
                  }`}
                  disabled={isLoading || (!aiConfig.apiKey && aiConfig.provider !== 'custom') || (aiConfig.provider === 'custom' && !aiConfig.customModel)}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              )}
              
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading || (!aiConfig.apiKey && aiConfig.provider !== 'custom') || (aiConfig.provider === 'custom' && !aiConfig.customModel)}
                className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* AI Configuration Modal */}
      <AIConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSubmit={handleConfigSubmit}
        currentConfig={aiConfig}
      />
    </div>
  );
}

export default App;