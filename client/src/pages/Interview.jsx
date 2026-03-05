import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Message = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-orange-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
};

const ChatBox = ({ messages, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Interview starting...</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <Message key={idx} role={msg.role} content={msg.content} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response or paste speech-to-text here..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows="2"
          />
          <button
            onClick={handleSend}
            className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoPanel = ({ isCameraOn }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.log('Camera access denied:', err));
    }
  }, [isCameraOn]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="relative bg-gray-900 rounded-lg shadow-md overflow-hidden flex-1">
        {isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <VideoOff size={48} className="text-gray-600" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <span className="text-2xl text-white font-bold">AI</span>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">Interview Assistant</p>
          <p className="text-sm text-gray-500">Ready to talk</p>
        </div>
      </div>
    </div>
  );
};

const Controls = ({ isMicOn, isCameraOn, onMicToggle, onCameraToggle, onEndInterview }) => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center gap-4 items-center bg-white rounded-lg shadow-md p-4">
      <button
        onClick={onMicToggle}
        className={`p-3 rounded-full transition-colors ${
          isMicOn
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
        title={isMicOn ? 'Mute' : 'Unmute'}
      >
        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      <button
        onClick={onCameraToggle}
        className={`p-3 rounded-full transition-colors ${
          isCameraOn
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
      </button>

      <div className="w-px h-8 bg-gray-300"></div>

      <button
        onClick={() => navigate('/feedback')}
        className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors font-medium"
      >
        <Phone size={20} />
        End Interview
      </button>
    </div>
  );
};

const Timer = ({ duration }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="text-sm text-gray-600 font-mono">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

export default function Interview() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hello! I'm your AI interviewer. Let's start with a warm-up question. Can you tell me about your most recent project?"
    }
  ]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const handleSendMessage = (content) => {
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: 'That sounds interesting. Can you tell me more about the technical challenges you faced?'
        }
      ]);
    }, 1000);
  };

  const handleEndInterview = () => {
    alert('Interview ended. Thank you for participating!');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 to-neutral-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prepify Interview</h1>
            <p className="text-sm text-gray-600">Frontend Engineer Position</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Duration</p>
              <Timer />
            </div>
            <div className="flex gap-2 items-center">
              <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                Technical
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Live Coding
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-6 gap-6 flex">
        <div className="w-96 flex flex-col gap-4">
          <VideoPanel isCameraOn={isCameraOn} />
          <Controls
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            onMicToggle={() => setIsMicOn(!isMicOn)}
            onCameraToggle={() => setIsCameraOn(!isCameraOn)}
            onEndInterview={handleEndInterview}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <ChatBox messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
