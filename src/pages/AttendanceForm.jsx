import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Clock, CheckCircle2, AlertCircle, Loader2, Send, Briefcase, ChevronDown, Check } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MOCK_CLIENTS = ["Nexus Corp", "Global Tech", "Smart Solutions", "Apex Industries", "Internal Office"];
const DUMMY_USER = { Name: "Rahul Sharma", Code: "EMP1001", Department: "Engineering", Admin: "No" };

const AttendanceForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [photo, setPhoto] = useState(null);
  const [punchStatus, setPunchStatus] = useState('Punch In');
  const [clientName, setClientName] = useState('Nexus Corp');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : DUMMY_USER;

  useEffect(() => {
    // Geolocation and Cleanup Tracker
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
        (error) => { toast.error("Please enable location simulation."); },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      // Auto-stop camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Unable to access camera. Please use file upload.");
      setIsCapturing(false);
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleCaptureClick = () => {
    if (photo) {
      setPhoto(null);
      startCamera();
    } else if (isCapturing) {
      takeSnapshot();
    } else {
      startCamera();
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // uploadPhoto removed for offline demo

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location.lat || !location.lng) {
      toast.error("Location is required. Please enable GPS simulation.");
      return;
    }

    if (!photo) {
      toast.error("Please take a verification selfie.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Processing your request...");

    // 🕒 Simulated "Live" Submission Pipeline
    setTimeout(() => {
      toast.success("Attendance successfully logged!", { id: toastId });
      setLoading(false);
      navigate('/attendance/daily'); // Redirect to log page for better demo flow
    }, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <LoadingSpinner message="Submitting attendance..." minHeight="400px" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-3 animate-in fade-in slide-in-from-bottom duration-500 pb-6 font-outfit">
      <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/30 border border-gray-100 overflow-hidden">
        {/* Header Section - Modern Clean Executive */}
        <div className="p-5 pb-3 text-gray-800 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight">Punch Attendance</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1 opacity-80">Workforce Location Verification</p>
            </div>
            <div className="p-2 bg-gray-50 border border-gray-100 rounded-xl shadow-sm">
              <Clock size={18} className="text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Location Status Card */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${location.lat ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${location.lat ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Geolocation</p>
                <p className="text-xs font-bold text-slate-700">
                  {location.lat ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Detecting...'}
                </p>
              </div>
              {location.lat ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Loader2 size={16} className="text-amber-500 animate-spin" />}
            </div>

            {/* DateTime Card */}
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Time</p>
                <p className="text-xs font-bold text-slate-700">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Punch Status Toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Punch Type</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPunchStatus('Punch In')}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${punchStatus === 'Punch In' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Punch IN
                </button>
                <button
                  type="button"
                  onClick={() => setPunchStatus('Punch Out')}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${punchStatus === 'Punch Out' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Punch OUT
                </button>
              </div>
            </div>

            {/* Client Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 ml-1">Assigned Client / Project</label>
              <div className="relative">
                <div onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 transition-all shadow-inner flex items-center justify-between cursor-pointer hover:bg-white hover:border-indigo-200">
                  <span className="flex items-center gap-2">
                    <Briefcase size={16} className="text-indigo-500" />
                    {clientName}
                  </span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {isClientDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {MOCK_CLIENTS.map(client => (
                      <div key={client} onClick={() => { setClientName(client); setIsClientDropdownOpen(false); }} className="px-5 py-3 text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer flex items-center gap-2 border-b border-gray-50 last:border-0">
                         {client === clientName && <Check size={14} className="text-indigo-600" />}
                         {client}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selfie Capture Section */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 ml-1">Live Identity Verification</label>
              <div 
                className={`relative aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden shadow-inner ${photo ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-indigo-400'}`}
              >
                {photo ? (
                  <img src={photo} alt="Captured preview" className="w-full h-full object-cover" />
                ) : isCapturing ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover grayscale-0 scale-x-[-1]"
                  />
                ) : (
                  <>
                    <div onClick={startCamera} className="p-3.5 bg-white rounded-2xl shadow-sm mb-3 hover:scale-110 transition-transform">
                      <Camera size={28} className="text-indigo-600" />
                    </div>
                    <p className="text-xs font-black text-gray-800 uppercase tracking-widest">Start Real-Time Scan</p>
                    <p className="text-[9px] text-gray-400 font-bold mt-1.5 uppercase tracking-tighter">Automatic facial scan enabled</p>
                  </>
                )}

                {/* Floating Snap Button Overlay */}
                {isCapturing && !photo && (
                  <button 
                    type="button"
                    onClick={takeSnapshot}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                     <Check size={14} strokeWidth={4} />
                     Snap Identity
                  </button>
                )}

                {photo && (
                   <button 
                    type="button"
                    onClick={() => { setPhoto(null); startCamera(); }}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg hover:text-indigo-600 transition-colors"
                   >
                      <Camera size={18} />
                   </button>
                )}
              </div>

              {/* Auxiliary Canvas (Hidden) */}
              <canvas ref={canvasRef} className="hidden" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
              />
            </div>

            {/* Quick Info Grid */}
            <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-3">
               <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Employee</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{user?.Name || 'Loading...'}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Department</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{user?.Department || 'N/A'}</p>
               </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]'}`}
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Attendance
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Safety Note */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
          Your attendance is being logged with geolocation verification. 
          Please ensure you are at the correct location before submitting. 
          Image and location data are stored for auditing purposes.
        </p>
      </div>
    </div>
  );
};

export default AttendanceForm;
