import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Heart, Image, X, Upload, Sparkles } from 'lucide-react';

const MentalHealthChatbot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! I'm MindfulChat, your compassionate AI companion. I'm here to provide support, guidance, and a listening ear for your mental health journey. How are you feeling today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isHealthRelated = (text) => {
    const healthKeywords = [
      'mental', 'health', 'anxiety', 'depression', 'stress', 'mood', 'feeling', 'emotion',
      'therapy', 'counseling', 'medication', 'sleep', 'insomnia', 'panic', 'worry',
      'sad', 'happy', 'angry', 'frustrated', 'overwhelmed', 'lonely', 'grief',
      'self-care', 'wellness', 'mindfulness', 'meditation', 'breathing', 'relaxation',
      'trauma', 'ptsd', 'bipolar', 'adhd', 'ocd', 'eating', 'disorder', 'addiction',
      'relationship', 'family', 'work', 'burnout', 'tired', 'exhausted', 'cope',
      'help', 'support', 'guidance', 'advice', 'struggling', 'difficult', 'hard',
      'pain', 'hurt', 'suffering', 'healing', 'recovery', 'improve', 'better'
    ];
    
    const lowerText = text.toLowerCase();
    return healthKeywords.some(keyword => lowerText.includes(keyword)) ||
           lowerText.includes('how are you') ||
           lowerText.includes('i feel') ||
           lowerText.includes('i am') ||
           lowerText.includes("i'm");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const callGeminiAPI = async (userMessage, imageBase64 = null) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key not found. Please check your .env file.');
      }

      let content;
      
      if (imageBase64) {
        // Remove data URL prefix to get pure base64
        const base64Data = imageBase64.split(',')[1];
        
        content = {
          contents: [{
            parts: [
              {
                text: `You are a compassionate mental health support chatbot with medical knowledge. Analyze this image carefully and provide helpful insights. Look for any visible health concerns, symptoms, skin conditions, injuries, or anything that might relate to physical or mental wellbeing. Be supportive and informative, but always remind the user to consult healthcare professionals for proper diagnosis. User's message: "${userMessage}"`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }]
        };
      } else {
        content = {
          contents: [{
            parts: [{
              text: `You are a compassionate mental health support chatbot. Respond empathetically and helpfully to this message: "${userMessage}". Provide supportive advice, coping strategies, or gentle guidance. Keep responses concise but caring. Always remind users to seek professional help for serious concerns.`
            }]
          }]
        };
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. If you're experiencing a mental health crisis, please contact a mental health professional or crisis hotline immediately.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage = {
      type: 'user',
      content: input || (selectedImage ? "I'd like you to analyze this image and tell me what you can see." : ""),
      timestamp: new Date(),
      image: imagePreview
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentImagePreview = imagePreview;
    setInput('');
    setIsLoading(true);

    let botResponse;
    
    if (!isHealthRelated(currentInput) && !selectedImage) {
      botResponse = "I'm here to provide mental health and wellness support, including analyzing images for health-related concerns. I'd love to help you with your feelings, stress management, self-care practices, or any mental health concerns you might have. What's on your mind today?";
    } else {
      botResponse = await callGeminiAPI(currentInput, currentImagePreview);
    }

    const botMessage = {
      type: 'bot',
      content: botResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
    removeImage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto max-w-6xl h-screen flex flex-col">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 p-4 md:p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                MindfulChat
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-slate-600 font-medium">AI Mental Health Companion</span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 transform transition-all duration-500 ease-out ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
              style={{
                animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Enhanced Avatar */}
              <div
                className={`relative p-3 rounded-2xl shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>

              {/* Enhanced Message Bubble */}
              <div
                className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-6 py-4 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    : 'bg-white/90 text-slate-800 border border-white/50'
                }`}
              >
                {message.image && (
                  <div className="mb-3 rounded-2xl overflow-hidden shadow-md">
                    <img 
                      src={message.image} 
                      alt="Shared content" 
                      className="w-full max-w-xs h-auto object-cover"
                    />
                  </div>
                )}
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {message.content}
                </p>
                <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
                  message.type === 'user' ? 'border-white/20' : 'border-slate-200'
                }`}>
                  <span className={`text-xs font-medium ${
                    message.type === 'user' ? 'text-indigo-100' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.type === 'bot' && (
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Enhanced Loading Animation */}
          {isLoading && (
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-3xl shadow-lg border border-white/50">
                <div className="flex space-x-2 items-center">
                  <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium ml-2">MindfulChat is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Section */}
        <div className="border-t border-white/20 bg-white/80 backdrop-blur-md p-4 md:p-6">
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <img 
                    src={imagePreview} 
                    alt="Upload preview" 
                    className="w-16 h-16 object-cover rounded-xl shadow-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">Image ready to share</p>
                  <p className="text-xs text-slate-500 mt-1">This image will be included with your message</p>
                </div>
                <button
                  onClick={removeImage}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input Controls */}
          <div className="flex items-end space-x-3">
            {/* Image Upload Button - Outside textarea */}
            <div className="flex-shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-blue-100 hover:to-indigo-100 text-slate-600 hover:text-blue-600 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 border border-slate-200"
                title="Upload image for analysis"
              >
                <Image className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind, or upload an image for health analysis..."
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-3xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 text-sm md:text-base shadow-lg"
                rows="1"
                style={{ minHeight: '56px', maxHeight: '140px' }}
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white p-4 rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Enhanced Disclaimer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 font-medium">
              🔒 Your privacy matters • 🖼️ Image analysis available • Not a replacement for professional care
            </p>
            <p className="text-xs text-slate-400 mt-1">
              I can analyze images for health insights, but always consult healthcare professionals for diagnosis
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MentalHealthChatbot;