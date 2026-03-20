import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, PlaySquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

// --- 1. SUB-COMPONENTS ---

const ProctoredVideo = ({ isCameraOn, onTerminate }) => {
  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);
  const [score, setScore] = useState(100);
  const [warnings, setWarnings] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  const MAX_VIOLATION_FRAMES = 60; 
  const violationFrames = useRef(0);
  const totalWarnings = useRef(0);
  const lastWarningTime = useRef(0);

  useEffect(() => {
    let isMounted = true; 
    let animationFrameId = null;
    let faceLandmarker = null;
    let lastProcessedTime = -1; 
    let hasTerminated = false; // Local flag to prevent multiple triggers

    const initializeProctoring = async () => {
      if (isCameraOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          videoStreamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          console.error('Camera access denied:', err);
          return;
        }
      }

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: true, 
        outputFaceTransformationMatrixes: false,
        runningMode: "VIDEO",
        numFaces: 1
      });
      
      if (!isMounted) return; 
      setIsModelLoaded(true);

      const predictWebcam = () => {
        if (!videoRef.current || !faceLandmarker || !isMounted || videoRef.current.readyState < 2 || hasTerminated) {
          if (isMounted && !hasTerminated) animationFrameId = requestAnimationFrame(predictWebcam);
          return;
        }

        const currentTimestamp = performance.now();
        
        if (currentTimestamp !== lastProcessedTime) {
          lastProcessedTime = currentTimestamp;
          
          try {
            const results = faceLandmarker.detectForVideo(videoRef.current, currentTimestamp);
            let isLookingAway = false;

            if (!results.faceLandmarks?.length || !results.faceBlendshapes?.length) {
              isLookingAway = true; 
            } else {
              const blendshapes = results.faceBlendshapes[0].categories;
              const getScore = (name) => {
                const shape = blendshapes.find(b => b.categoryName === name);
                return shape ? shape.score : 0;
              };

              const lookLeft = Math.max(getScore("eyeLookOutLeft"), getScore("eyeLookInRight"));
              const lookRight = Math.max(getScore("eyeLookInLeft"), getScore("eyeLookOutRight"));
              const lookUp = Math.max(getScore("eyeLookUpLeft"), getScore("eyeLookUpRight"));
              const lookDown = Math.max(getScore("eyeLookDownLeft"), getScore("eyeLookDownRight"));

              if (lookLeft > 0.55 || lookRight > 0.55 || lookUp > 0.55 || lookDown > 0.75) {
                isLookingAway = true;
              }

              const landmarks = results.faceLandmarks[0];
              const leftEyeOuter = landmarks[33];
              const rightEyeOuter = landmarks[263];
              const leftCheek = landmarks[234];
              const rightCheek = landmarks[454];
              
              const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
              const headYawNormalized = Math.abs(leftEyeOuter.z - rightEyeOuter.z) / faceWidth;

              if (headYawNormalized > 0.15) {
                isLookingAway = true;
              }
            }

            if (isLookingAway) {
              violationFrames.current += 1;
            } else {
              violationFrames.current = Math.max(0, violationFrames.current - 4); 
            }

            const calculatedScore = Math.max(0, 100 - Math.floor((violationFrames.current / MAX_VIOLATION_FRAMES) * 100));
            setScore(calculatedScore);

            if (violationFrames.current >= MAX_VIOLATION_FRAMES && (Date.now() - lastWarningTime.current > 4000)) {
              totalWarnings.current += 1;
              setWarnings(totalWarnings.current);
              lastWarningTime.current = Date.now();
              violationFrames.current = 0; 

              if (totalWarnings.current >= 3) {
                hasTerminated = true;
                onTerminate(); // Fire the global termination trigger
              }
            }
          } catch (error) {
            console.error("Proctoring error:", error);
          }
        }

        if (isMounted && !hasTerminated) {
          animationFrameId = requestAnimationFrame(predictWebcam);
        }
      };

      predictWebcam();
    };

    initializeProctoring();

    return () => {
      isMounted = false; 
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (faceLandmarker) faceLandmarker.close();
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      }
    };
  }, [isCameraOn, onTerminate]);

  return (
    <div className="w-full h-full bg-[#202124] flex items-center justify-center relative overflow-hidden group">
      {isCameraOn ? (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className={`px-3 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-2 text-sm font-bold transition-colors ${score > 70 ? 'bg-green-500/20 text-green-400 border-green-500/50' : score > 30 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${score > 70 ? 'bg-green-400' : score > 30 ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
              {isModelLoaded ? `Attention: ${score}%` : 'Loading Proctor AI...'}
            </div>
            {warnings > 0 && (
              <div className="bg-red-600/90 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-lg animate-bounce">
                Warnings: {warnings} / 3
              </div>
            )}
          </div>
          {score < 20 && (
            <div className="absolute inset-0 border-4 border-red-500 shadow-[inset_0_0_50px_rgba(239,68,68,0.5)] pointer-events-none transition-opacity"></div>
          )}
        </>
      ) : (
        <VideoOff size={64} className="text-gray-600" />
      )}
    </div>
  );
};

const AIAssistant = ({ isSpeaking }) => {
  return (
    <div className={`relative bg-[#202124] rounded-xl shadow-lg overflow-hidden h-full w-full flex flex-col items-center justify-center transition-all duration-300 ${isSpeaking ? 'ring-4 ring-[#8ab4f8]' : 'border border-gray-800'}`}>
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-[#1a73e8] flex items-center justify-center z-10 relative">
          <span className="text-4xl text-white font-medium">AI</span>
        </div>
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full bg-[#8ab4f8] opacity-40 animate-ping" style={{ animationDuration: '2s' }}></div>
        )}
      </div>
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
        {isSpeaking && (
          <div className="flex items-end gap-0.5 h-3">
            <div className="w-1 bg-[#8ab4f8] h-full animate-bounce" style={{ animationDuration: '0.8s' }}></div>
            <div className="w-1 bg-[#8ab4f8] h-2/3 animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.1s' }}></div>
            <div className="w-1 bg-[#8ab4f8] h-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }}></div>
          </div>
        )}
        <span className="text-white text-sm font-medium">Interviewer</span>
      </div>
    </div>
  );
};

const Timer = () => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
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

// --- 2. MAIN COMPONENT ---
export default function Interview() {
  const navigate = useNavigate();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  // NEW: Global Termination State & Audio Tracker
  const [isTerminated, setIsTerminated] = useState(false);
  const currentAudioRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const isFinalizingRef = useRef(false);
  const chunkTimerRef = useRef(null);

  const handleStartInterview = async () => {
    setIsAILoading(true);
    setStatusMessage("Initializing Engine...");
    
    try {
      const response = await fetch('http://localhost:8001/api/start-interview', { method: 'POST' });
      const data = await response.json();
      
      setIsInterviewStarted(true);
      setChatHistory(prev => [...prev, { sender: 'bot', text: data.reply }]);
      
      if (data.audio_data) playAIAudio(data.audio_data);
    } catch (error) {
      setStatusMessage("Failed to connect to AI backend.");
    } finally {
      setIsAILoading(false);
      setStatusMessage("");
    }
  };

  const playAIAudio = (base64Audio) => {
    if (isTerminated) return; // Prevent new audio if already locked down
    setIsAISpeaking(true);
    const audio = new Audio("data:audio/mp3;base64," + base64Audio);
    currentAudioRef.current = audio; // Track the current audio object
    audio.onended = () => {
      setIsAISpeaking(false);
      currentAudioRef.current = null;
    };
    audio.play();
  };

  const handleToggleRecording = () => {
    if (isRecording) stopRecordingLoop();
    else startRecordingLoop();
  };

  const startRecordingLoop = async () => {
    if (isRecording || isTerminated) return; // Block recording if terminated
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      isFinalizingRef.current = false;
      setIsRecording(true);
      setStatusMessage("Recording... (Auto-syncing every 24s)");
      runChunkCycle();
    } catch (err) {
      setStatusMessage("Microphone access denied.");
    }
  };

  const runChunkCycle = () => {
    if (!streamRef.current || isTerminated) return;
    mediaRecorderRef.current = new MediaRecorder(streamRef.current);
    let audioChunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      await sendChunkToBackend(audioBlob, isFinalizingRef.current);
    };

    mediaRecorderRef.current.start();

    chunkTimerRef.current = setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording' && !isFinalizingRef.current) {
        mediaRecorderRef.current.stop(); 
        runChunkCycle(); 
      }
    }, 24000);
  };

  const stopRecordingLoop = () => {
    if (!isRecording) return;
    isFinalizingRef.current = true;
    setIsRecording(false);
    clearTimeout(chunkTimerRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); 
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    
    setStatusMessage("Stitching audio and waiting for AI...");
    setIsAILoading(true);
  };

  const sendChunkToBackend = async (audioBlob, isFinal) => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "chunk.webm");
    formData.append("is_final", isFinal ? "true" : "false");

    try {
      const response = await fetch('http://localhost:8001/api/audio-chunk', {
        method: 'POST', body: formData
      });

      const data = await response.json();
      if (isFinal && !isTerminated) { // Only process if not locked down
        if (data.user_text) setChatHistory(prev => [...prev, { sender: 'user', text: data.user_text }]);
        setChatHistory(prev => [...prev, { sender: 'bot', text: data.reply }]);
        if (data.audio_data) playAIAudio(data.audio_data);
        setStatusMessage("");
        setIsAILoading(false);
      }
    } catch (error) {
      if (isFinal) {
        setStatusMessage("Error reaching the AI backend.");
        setIsAILoading(false);
      }
    }
  };

  const handleEndInterview = async () => {
    if (isRecording) stopRecordingLoop();
    try {
      setStatusMessage("Saving session data...");
      const response = await fetch('http://localhost:8001/api/end-interview', { method: 'POST' });
      const data = await response.json();
      navigate('/feedback', { state: { sessionFile: data.filename } });
    } catch (error) {
      alert("Error saving interview session.")
      navigate('/feedback'); // Navigate anyway to avoid trapping user
    }
  };

  // NEW: Global Lockdown Trigger
  const handleGlobalTermination = () => {
    setIsTerminated(true);
    
    // 1. Kill the microphone loop
    if (isRecording) {
      isFinalizingRef.current = true;
      setIsRecording(false);
      clearTimeout(chunkTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop(); 
      }
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    }

    // 2. Brutally cut off the AI's voice
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsAISpeaking(false);
    setStatusMessage("Session Terminated.");
  };

  const currentAIText = chatHistory.slice().reverse().find(msg => msg.sender === 'bot')?.text || "";
  
  return (
    <div className="h-screen bg-[#f8f9fa] flex flex-col overflow-hidden relative">
      
      {/* NEW: Global Full-Screen Lockdown Overlay */}
      {isTerminated && (
        <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Interview Terminated</h2>
          <p className="text-gray-300 mb-10 max-w-md text-lg leading-relaxed">
            This session has been automatically locked and ended due to multiple severe proctoring violations.
          </p>
          <button
            onClick={handleEndInterview}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5"
          >
            Submit & Exit
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-8 py-4 shrink-0">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">P</div>
            <h1 className="text-xl font-bold text-gray-900">Prepify</h1>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">Machine Learning Engineer</span>
            <div className="flex items-center gap-2 font-mono bg-white border border-gray-200 px-3 py-1 rounded-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <Timer />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 p-4 md:p-8 flex flex-col gap-4 w-full max-w-[2560px] mx-auto min-h-0">
        
        <div className="flex-[2.5] flex flex-col md:flex-row gap-4 w-full min-h-0">
          <div className="flex-1 rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white relative">
            <AIAssistant isSpeaking={isAISpeaking} />
          </div>
          <div className="flex-1 rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative bg-black">
            <ProctoredVideo 
               isCameraOn={isCameraOn} 
               onTerminate={handleGlobalTermination} 
            />
            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg pointer-events-none">
              <span className="text-white font-medium tracking-wide">You</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-[1.5] w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-3 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto flex items-start pr-4 relative mb-1">
            <p className="text-sm md:text-base text-gray-800 font-medium leading-relaxed w-full">
              {!isInterviewStarted ? (
                "Welcome to Prepify. When you are ready, click 'Start Interview' to begin."
              ) : isRecording ? (
                <span className="text-gray-400 italic flex items-center gap-3 mt-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Listening to your response...
                </span>
              ) : (
                currentAIText
              )}
            </p>
          </div>

          {statusMessage && (
            <div className="text-xs text-blue-600 italic mb-1">
              {statusMessage}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 shrink-0">
            <div className="flex gap-1">
              <button onClick={() => setIsMicOn(!isMicOn)} disabled={isTerminated} className={`p-1.5 rounded-full transition-colors ${isMicOn ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-red-100 hover:bg-red-200 text-red-600'} disabled:opacity-50`}>
                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
              <button onClick={() => setIsCameraOn(!isCameraOn)} disabled={isTerminated} className={`p-1.5 rounded-full transition-colors ${isCameraOn ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-red-100 hover:bg-red-200 text-red-600'} disabled:opacity-50`}>
                {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>
            </div>

            <div>
              {!isInterviewStarted ? (
                <button onClick={handleStartInterview} disabled={isAILoading || isTerminated} className="flex items-center gap-1 px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all shadow-md disabled:opacity-50">
                  <PlaySquare size={14} /> Start Interview
                </button>
              ) : (
                <button onClick={handleToggleRecording} disabled={isAILoading || isTerminated} className={`flex items-center gap-1 px-4 py-1 text-xs text-white rounded-full font-medium transition-all shadow-md disabled:opacity-50 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`}>
                  {isRecording ? <Square size={14} /> : <Mic size={14} />}
                  {isRecording ? 'Submit' : 'Answer'}
                </button>
              )}
            </div>

            <div>
              <button onClick={handleEndInterview} disabled={isTerminated} className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-full transition-colors font-medium text-xs disabled:opacity-50">
                <Phone size={14} /> End
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}