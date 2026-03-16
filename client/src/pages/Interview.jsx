import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const UserVideo = ({ isCameraOn }) => {
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
    <div className="relative bg-gray-900 rounded-lg shadow-md overflow-hidden h-72 flex-1">
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
  );
};

const AIAssistant = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center justify-center h-72 flex-1">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4">
        <span className="text-4xl text-white font-bold">AI</span>
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-900 text-lg">Interview Assistant</p>
        <p className="text-sm text-gray-500 mt-2">Ready to talk</p>
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
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

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

      <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
        {/* Video and AI Assistant Section */}
        <div className="flex gap-6">
          {/* Left: User Camera */}
          <div className="flex-1">
            <UserVideo isCameraOn={isCameraOn} />
          </div>
          
          {/* Right: AI Assistant */}
          <div className="flex-1">
            <AIAssistant />
          </div>
        </div>

        {/* Controls Section */}
        <Controls
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          onMicToggle={() => setIsMicOn(!isMicOn)}
          onCameraToggle={() => setIsCameraOn(!isCameraOn)}
          onEndInterview={handleEndInterview}
        />
      </div>
    </div>
  );
}
