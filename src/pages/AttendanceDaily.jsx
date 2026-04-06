import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Users, Calendar, Filter, Clock, CheckCircle2, 
  XCircle, AlertCircle, ChevronRight, FileText, ChevronDown, 
  Check, History, Download, MapPin, List, LayoutDashboard, Plus, Camera, Save, X, Briefcase
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

// Professional Dummy Data Generator (Every Date April 2024 for 10 Personnel)
const generateDailyData = () => {
  const employees = [
    { id: "EMP1001", name: "Rahul Sharma", dept: "Engineering", post: "Software Engineer" },
    { id: "EMP1002", name: "Priya Patel", dept: "HR", post: "HR Manager" },
    { id: "EMP1003", name: "Amit Kumar", dept: "Sales", post: "Sales Executive" },
    { id: "EMP1004", name: "Sneha Gupta", dept: "Finance", post: "Accountant" },
    { id: "EMP1005", name: "Vikram Singh", dept: "Operations", post: "Project Manager" },
    { id: "EMP1006", name: "Anjali Desai", dept: "Marketing", post: "Creative Director" },
    { id: "EMP1007", name: "Rohan Mehta", dept: "Engineering", post: "Software Engineer" },
    { id: "EMP1008", name: "Sonal Varma", dept: "HR", post: "HR Manager" },
    { id: "EMP1009", name: "Arjun Reddy", dept: "Sales", post: "Sales Executive" },
    { id: "EMP1010", name: "Neha Kapoor", dept: "Finance", post: "Accountant" },
    { id: "EMP1011", name: "Sandeep Nair", dept: "Operations", post: "Project Manager" },
    { id: "EMP1012", name: "Pooja Hegde", dept: "Marketing", post: "Creative Director" },
    { id: "EMP1013", name: "Karan Johar", dept: "Engineering", post: "Software Engineer" },
    { id: "EMP1014", name: "Aditi Rao", dept: "HR", post: "HR Manager" },
    { id: "EMP1015", name: "Abhishek Das", dept: "Sales", post: "Sales Executive" },
    { id: "EMP1016", name: "Deepika Roy", dept: "Finance", post: "Accountant" },
    { id: "EMP1017", name: "Vivek Joshi", dept: "Operations", post: "Project Manager" },
    { id: "EMP1018", name: "Shweta Tiwari", dept: "Marketing", post: "Creative Director" },
    { id: "EMP1019", name: "Manish Paul", dept: "Engineering", post: "Software Engineer" },
    { id: "EMP1020", name: "Kirti Sanon", dept: "HR", post: "HR Manager" },
  ];

  const data = [];
  const dates = ["2024-04-01", "2024-04-02", "2024-04-03", "2024-04-04", "2024-04-05", "2024-04-06"];
  
  let serialCounter = 1;
  const clients = ["Global Tech", "Smart Solutions", "Nexus Corp", "Apex Industries"];

  dates.forEach(dateStr => {
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    
    employees.forEach((emp, index) => {
      // ⬇️ 1st Row for every employee: PUNCH IN
      data.push({
        id: `${emp.id}-${dateStr}-in`,
        serialNo: serialCounter++,
        empId: emp.id,
        employeeCode: emp.id,
        name: emp.name,
        department: emp.dept,
        designation: emp.post,
        date: dateStr,
        day: dayName,
        punchStatus: "IN",
        clientName: clients[index % clients.length],
        imageUrl: `https://i.pravatar.cc/150?u=${emp.id}_in_${dateStr}`,
        latitude: "28.5355",
        longitude: "77.2739",
        locationLink: "https://maps.google.com/?q=28.5355,77.2739",
        locationName: "Okhla Phase III, Delhi",
        status: "Present",
      });

      // ⬇️ 2nd Row for every employee: PUNCH OUT
      data.push({
        id: `${emp.id}-${dateStr}-out`,
        serialNo: serialCounter++,
        empId: emp.id,
        employeeCode: emp.id,
        name: emp.name,
        department: emp.dept,
        designation: emp.post,
        date: dateStr,
        day: dayName,
        punchStatus: "OUT",
        clientName: clients[index % clients.length],
        imageUrl: `https://i.pravatar.cc/150?u=${emp.id}_out_${dateStr}`,
        latitude: "28.5355",
        longitude: "77.2739",
        locationLink: "https://maps.google.com/?q=28.5355,77.2739",
        locationName: "Okhla Phase III, Delhi",
        status: "Present",
      });
    });
  });
  return data.reverse();
};

const DUMMY_ATTENDANCE = generateDailyData();

const AttendanceDaily = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeCode: "",
    punchStatus: "IN",
    imageCaptured: false
  });
  const [isModalCapturing, setIsModalCapturing] = useState(false);
  const [capturedModalPhoto, setCapturedModalPhoto] = useState(null);

  // Modal Camera Refs
  const modalVideoRef = useRef(null);
  const modalCanvasRef = useRef(null);
  const modalStreamRef = useRef(null);

  useEffect(() => {
    setTableLoading(true);
    const timer = setTimeout(() => setTableLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredData = DUMMY_ATTENDANCE.filter(item => {
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDepartment || item.department === filterDepartment;
    const matchesDate = !filterDate || item.date === filterDate;
    return matchesSearch && matchesDept && matchesDate;
  });

  const departments = [...new Set(DUMMY_ATTENDANCE.map(d => d.department))].sort();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50">
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      {[...Array(Math.max(1, Math.min(5, totalPages)))].map((_, i) => (
        <button key={i} onClick={() => paginate(i+1)} className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-bold ${currentPage === (i+1) ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages} className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );

  const startModalCamera = async () => {
    try {
      setIsModalCapturing(true);
      setCapturedModalPhoto(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (modalVideoRef.current) {
        modalVideoRef.current.srcObject = stream;
        modalStreamRef.current = stream;
      }
    } catch (err) {
      console.error("Modal Camera Error:", err);
      toast.error("Unable to access system camera.");
      setIsModalCapturing(false);
    }
  };

  const stopModalCamera = () => {
    if (modalStreamRef.current) {
      modalStreamRef.current.getTracks().forEach(track => track.stop());
      modalStreamRef.current = null;
    }
    setIsModalCapturing(false);
  };

  const takeModalSnapshot = () => {
    if (modalVideoRef.current && modalCanvasRef.current) {
      const video = modalVideoRef.current;
      const canvas = modalCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedModalPhoto(dataUrl);
      setFormData({ ...formData, imageCaptured: true });
      stopModalCamera();
    }
  };

  const handleCloseModal = () => {
    stopModalCamera();
    setIsModalOpen(false);
    setCapturedModalPhoto(null);
  };

  const handleSave = () => {
    if (!formData.employeeCode) {
      toast.error("Please enter Employee ID");
      return;
    }
    if (!formData.imageCaptured && !capturedModalPhoto) {
      toast.error("Please capture a live identity photo");
      return;
    }
    toast.success("Attendance saved successfully!");
    handleCloseModal();
    setFormData({ employeeCode: "", punchStatus: "IN", imageCaptured: false });
  };

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-3 pb-20 md:pb-8 font-outfit">
      
      {/* 📍 Attendance Modal - Clean High-Fidelity UI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3 -mx-1">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight ml-1">Mark Attendance</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="text-gray-400" size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Employee Code */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Employee ID / Code</label>
                  <input 
                    type="text" 
                    placeholder="Enter Code (e.g. CD-1001)"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({...formData, employeeCode: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-sm shadow-sm"
                  />
                </div>

                {/* Punch Status */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Punch Status</label>
                  <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-inner">
                    <button 
                      onClick={() => setFormData({...formData, punchStatus: "IN"})}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.punchStatus === 'IN' ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      PUNCH IN
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, punchStatus: "OUT"})}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.punchStatus === 'OUT' ? 'bg-white text-rose-500 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      PUNCH OUT
                    </button>
                  </div>
                </div>

                 {/* Capture Image */}
                 <div className="space-y-2">
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Verification</label>
                   <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-100 group shadow-md">
                     {capturedModalPhoto ? (
                       <img src={capturedModalPhoto} className="w-full h-full object-cover" alt="Captured" />
                     ) : isModalCapturing ? (
                       <video 
                         ref={modalVideoRef}
                         autoPlay
                         playsInline
                         className="w-full h-full object-cover scale-x-[-1]"
                       />
                     ) : (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 group-hover:text-white/50 transition-colors cursor-pointer" onClick={startModalCamera}>
                         <Camera size={24} strokeWidth={1.5} />
                         <span className="text-[8px] font-black mt-1.5 uppercase tracking-widest">Start Live Capture</span>
                       </div>
                     )}
                     
                     {/* Floating Capture Button Overlay */}
                     {isModalCapturing && !capturedModalPhoto && (
                       <button 
                         onClick={takeModalSnapshot}
                         className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-50 active:scale-95 transition-all z-20 flex items-center gap-2"
                       >
                         <Camera size={12} />
                         Snap Identity
                       </button>
                     )}

                     {capturedModalPhoto && (
                        <button 
                         onClick={startModalCamera}
                         className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white hover:bg-white/40 transition-all z-20"
                        >
                           <Camera size={14} />
                        </button>
                     )}

                     {/* Hidden Canvas for Snapshots */}
                     <canvas ref={modalCanvasRef} className="hidden" />

                     {/* Location Footer on Image */}
                     <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent">
                       <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                         <span className="text-[8px] font-bold text-white/90 uppercase tracking-tight drop-shadow-sm">OKHLA PHASE III, NEW DELHI</span>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black transition-all shadow-md shadow-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 🧩 Header Section - Call Tracker Parity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="hidden md:block text-xl font-bold text-gray-800 tracking-tight">Daily Attendance Logs</h2>

        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input 
               type="text" 
               placeholder="Search calls..." 
               value={searchTerm} 
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
               className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full text-[13px] shadow-sm bg-white"
            />
          </div>

          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2">
             {/* Department Filter */}
             <div className="relative">
               <div onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)} className="flex items-center gap-2 h-8 px-3 border border-gray-200 rounded bg-white text-[11px] text-gray-700 font-medium cursor-pointer hover:border-indigo-400 transition shadow-sm">
                 <Filter size={11} className="text-gray-400" />
                 <span className="truncate">{filterDepartment || "All Dept"}</span>
                 <ChevronDown size={12} className={`ml-1 text-gray-400 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
               </div>
               {isDeptDropdownOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsDeptDropdownOpen(false)}></div>
                   <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 ring-1 ring-black ring-opacity-5">
                     <div
                        onClick={() => { setFilterDepartment(""); setIsDeptDropdownOpen(false); setCurrentPage(1); }}
                        className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${!filterDepartment ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 font-medium'}`}
                     >
                        All Departments
                        {!filterDepartment && <Check size={12} className="text-indigo-500" />}
                     </div>
                     {departments.map(d => (
                       <div
                         key={d}
                         onClick={() => { setFilterDepartment(d); setIsDeptDropdownOpen(false); setCurrentPage(1); }}
                         className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${filterDepartment === d ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 font-medium'}`}
                       >
                         {d}
                         {filterDepartment === d && <Check size={12} className="text-indigo-500" />}
                       </div>
                     ))}
                   </div>
                 </>
               )}
             </div>

             {/* Date Picker */}
             <div className="flex items-center gap-1 h-8 px-2 border border-gray-200 rounded bg-white text-[11px] text-gray-600 shadow-sm relative">
               <Calendar size={11} className="text-gray-400" />
               <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} className="bg-transparent focus:outline-none text-[10px] w-24 cursor-pointer" />
             </div>

             {/* ➕ Add Attendance Button */}
             <button 
               onClick={() => setIsModalOpen(true)}
               className="flex items-center justify-center gap-2 h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm transition-all duration-200 active:scale-95"
             >
               <Plus size={14} />
               <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">Attendance</span>
             </button>
          </div>
        </div>
      </div>

      {/* 📊 Main Table Content Area - Desktop Table (Hidden on Mobile) */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] flex flex-col hidden md:flex min-w-[1000px] lg:min-w-full">
        {tableLoading ? (
           <div className="flex-1 flex items-center justify-center p-12">
             <LoadingSpinner message="Retrieving logs..." minHeight="450px" />
           </div>
        ) : (
          <>
            <div className="max-h-[calc(105vh-280px)] min-h-[530px] overflow-y-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sr.</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee Code</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Full Name</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Punch Status</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Client Name</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Designation</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Image URL</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Latitude</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Longitude</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Location Link</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Location Name</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-24 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No matching records found.</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-2 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold">{item.serialNo}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-gray-500 font-medium">{item.date} <span className="text-[9px] text-gray-400 opacity-60 uppercase">{item.day}</span></td>
                        <td className="px-6 py-2 whitespace-nowrap text-center">
                            <span className="text-[11px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest italic">{item.employeeCode}</span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-700 font-bold uppercase tracking-tight">
                           {item.name}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center">
                           <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.punchStatus === 'IN' ? 'bg-green-100 text-green-700 font-black' : (item.punchStatus === 'OUT' ? 'bg-red-100 text-red-700 font-black' : 'bg-gray-100 text-gray-500')}`}>
                             {item.punchStatus}
                           </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-gray-400 font-normal italic">{item.clientName}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500 font-bold uppercase tracking-tight">{item.department}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[10px] text-gray-400 font-medium uppercase tracking-tight italic">{item.designation}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[10px] text-indigo-600 font-medium underline cursor-pointer">{item.imageUrl.substring(0, 20)}...</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500 font-normal">{item.latitude}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500 font-normal">{item.longitude}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[10px] text-indigo-600 font-medium underline">
                           <a href={item.locationLink} target="_blank" rel="noreferrer">View Map</a>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500 font-normal">{item.locationName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 📑 Desktop Pagination Layer (Hidden on Mobile) */}
            <div className="hidden md:flex px-4 py-3 bg-white border-t border-gray-200 flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <p className="text-[13px] text-gray-600 font-medium tracking-wide">
                  Showing <span className="font-bold text-gray-900">{filteredData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="font-bold text-gray-900">{filteredData.length}</span> records
                </p>
                <div className="flex items-center gap-2 h-5">
                  <label className="text-[13px] text-gray-500 font-medium whitespace-nowrap">Rows per page:</label>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-xs bg-transparent font-medium text-gray-700 outline-none cursor-pointer">
                    {[15, 30, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center w-auto justify-end">
                {renderPaginationNav()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 📱 Mobile Card View - Synced with Employee.jsx Aesthetic */}
      <div className="md:hidden flex flex-col h-[calc(105vh-280px)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <div className="flex-1 p-2.5 space-y-3 overflow-y-auto scrollbar-hide">
          {tableLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner minHeight="40px" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Logs...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-2xl bg-white m-2">No records found.</div>
          ) : (
            currentItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 relative overflow-hidden active:scale-[0.98] transition-all duration-200 shadow-sm">
                 {/* Card Header (Bleed Style) */}
                 <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100 mb-0.5">
                    <div className="flex items-center gap-1">
                       <div className={`w-1 h-3 rounded-full ${item.punchStatus === 'IN' ? 'bg-green-500' : 'bg-red-500'}`} />
                       <span className="font-black text-indigo-600 text-[10px] tracking-tighter uppercase">#{item.employeeCode}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${item.punchStatus === 'IN' ? 'bg-green-100 text-green-700' : (item.punchStatus === 'OUT' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500')}`}>
                      {item.punchStatus}
                    </span>
                 </div>

                 {/* Body: Identity */}
                 <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-tight truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.department}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                       <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1 opacity-60">Verified</span>
                       <CheckCircle2 size={12} className="text-emerald-500" />
                    </div>
                 </div>

                 {/* Metrics Grid */}
                 <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                   <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Time & Date</span>
                      <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 leading-none">
                        <Clock size={10} className="text-indigo-400" />
                        {item.date} <span className="text-[8px] opacity-40 uppercase">{item.day}</span>
                      </p>
                   </div>
                   <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60 leading-none">Client</span>
                      <p className="text-[10px] font-bold text-gray-500 italic truncate uppercase tracking-tighter">{item.clientName}</p>
                   </div>
                 </div>

                 {/* Action Bar */}
                 <div className="flex items-center justify-end pt-1">
                   <a href={item.locationLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 font-black text-[9px] uppercase tracking-widest bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100 active:scale-95 transition-all shadow-sm">
                      <MapPin size={10} strokeWidth={3} />
                      View On Map
                   </a>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* 📱 Mobile Sticky Pagination (Synced with Employee.jsx) */}
        <div className="border-t border-gray-200 bg-white p-2.5 flex flex-col items-center gap-2 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between w-full px-2 mb-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Page {currentPage} of {totalPages}</p>
              <div className="flex items-center gap-2 h-5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Rows:</label>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-[10px] font-black text-indigo-600 bg-transparent outline-none">
                  {[15, 30, 50].map(val => <option key={val} value={val}>{val}</option>)}
                </select>
              </div>
           </div>
           {renderPaginationNav()}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDaily;