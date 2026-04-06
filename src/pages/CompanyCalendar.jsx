import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Search, 
  Plus, Filter, Grid, List, RefreshCw, ChevronDown, Check, X, Save,
  History, LayoutDashboard, Settings, Bell, User, Briefcase, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import TableTabs from '../components/DataTable/TableTabs';
import { MOCK_CALENDAR_EVENTS } from '../data/mockData';

const CompanyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [companyEvents, setCompanyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // New Event Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'meeting',
    location: '',
    description: ''
  });

  // Fetch calendar data from dummy source
  const fetchCalendarData = () => {
    setLoading(true);
    // Simulate slight delay for realism
    setTimeout(() => {
      setCompanyEvents(MOCK_CALENDAR_EVENTS);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return companyEvents.filter(event => event.date === dateString);
  };

  const getEventTypeColor = (category) => {
    if (!category) return 'bg-slate-50 text-slate-500 border-slate-200/50';
    switch (category.toLowerCase()) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'holiday': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'training': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'event': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200/50';
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (day) => {
    return day &&
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      day === today.getDate();
  };

  // Filter events based on search
  const filteredEvents = companyEvents.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= new Date(today.setHours(0, 0, 0, 0));
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleSync = () => {
    setIsSyncing(true);
    fetchCalendarData();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleOpenAddModal = (day = null) => {
    let initialDate = '';
    if (day) {
      initialDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else if (selectedDate) {
      initialDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    }
    
    setEventFormData({
      title: '',
      date: initialDate,
      time: '10:00',
      type: 'meeting',
      location: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventFormData.title || !eventFormData.date) {
      toast.error("Please fill in Title and Date");
      return;
    }
    
    // In a real app, we would POST to the API here.
    // For now, we simulate success.
    toast.success("Event scheduled successfully!");
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-2 pb-20 md:pb-8 font-outfit">
      
      {/* 🗓️ Add Event Modal - Executive Design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Schedule New Event</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Company calendar entry</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {/* Title - Full Width */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Event Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Q2 Strategy Meeting"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-medium text-sm"
                  />
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      type="date" 
                      value={eventFormData.date}
                      onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      type="time" 
                      value={eventFormData.time}
                      onChange={(e) => setEventFormData({...eventFormData, time: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Event Type / Category */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                  <div className="relative">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      type="text" 
                      placeholder="Meeting, Holiday, etc."
                      value={eventFormData.category}
                      onChange={(e) => setEventFormData({...eventFormData, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      type="text" 
                      placeholder="Meeting Room / Virtual"
                      value={eventFormData.location}
                      onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description / Notes</label>
                  <textarea 
                    rows="3"
                    placeholder="Enter event details here..."
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-medium text-sm resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl text-[11px] font-bold transition-all uppercase tracking-widest shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEvent}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-bold transition-all shadow-lg shadow-indigo-200 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 🧩 Header Section - Professional Executive Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-1 px-0.5 mt-1">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <h2 className="hidden md:block text-xl font-semibold text-slate-800 tracking-tight whitespace-nowrap">Company Schedule</h2>
          
          {/* Professional Navigation Pill */}
          <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/40 self-start md:self-auto shadow-sm">
            <button onClick={() => navigateMonth(-1)} className="p-1 px-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-600 active:scale-95">
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-white rounded-lg transition-all uppercase tracking-widest whitespace-nowrap"
            >
              Today
            </button>
            <button onClick={() => navigateMonth(1)} className="p-1 px-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-600 active:scale-95">
              <ChevronRight size={16} />
            </button>
          </div>
          
          <span className="text-[14px] font-semibold text-indigo-600 tracking-tight ml-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
             {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-3.5 w-full md:w-auto">
          {/* View Switcher Tabs */}
          <div className="bg-slate-100/50 p-1 rounded-xl transition-all duration-300 inline-flex self-start md:self-auto border border-slate-200/30 overflow-hidden">
            <TableTabs 
              activeTab={viewMode}
              onTabChange={(id) => setViewMode(id)}
              tabs={[
                { id: 'month', label: `Month`, icon: <Grid /> },
                { id: 'list', label: `Agenda`, icon: <List /> }
              ]}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 sm:w-60 group">
               <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
               <input 
                  type="text" 
                  placeholder="Search events..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-1.5 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-[13px] shadow-sm bg-white/80 transition-all placeholder:text-slate-300 font-medium h-9"
               />
            </div>

            <button 
               onClick={() => handleOpenAddModal()}
               className="flex items-center justify-center gap-2.5 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/15 transition-all duration-300 active:scale-95 w-full sm:w-auto overflow-hidden"
            >
               <Plus size={15} />
               <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">Add Event</span>
            </button>

            <button 
               onClick={handleSync}
               disabled={loading || isSyncing}
               className="flex items-center justify-center gap-2.5 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/15 transition-all duration-300 active:scale-95 w-full sm:w-auto overflow-hidden disabled:opacity-50"
            >
               <RefreshCw size={15} className={`${isSyncing || loading ? "animate-spin" : ""} transition-transform duration-300`} />
               <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">{isSyncing ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[500px] flex items-center justify-center">
            <LoadingSpinner message="Retrieving schedule data..." minHeight="400px" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Content Area: Month Calendar or Agenda List */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl shadow-sm border border-slate-100/60 overflow-hidden flex flex-col min-h-[650px]">
            {viewMode === 'month' ? (
               /* Re-Implement Month Grid with refined aesthetics */
               <div className="flex flex-col h-full bg-white">
                  <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
                    {daysOfWeek.map(day => (
                      <div key={day} className="py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] italic">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 flex-1">
                    {days.map((day, index) => {
                      const events = day ? filteredEvents.filter(e => {
                         const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                         return e.date === dateString;
                      }) : [];
                      
                      const isDotted = events.length > 0;
                      const dayIsToday = isToday(day);

                      return (
                        <div
                          key={index}
                          onClick={() => day && setSelectedDate(day)}
                          className={`min-h-[110px] p-2 border-r border-b border-slate-100/60 cursor-pointer transition-all duration-200 flex flex-col group ${
                            day ? "hover:bg-indigo-50/20" : "bg-slate-50/20"
                          } ${dayIsToday ? 'bg-indigo-50/30 relative' : ''}`}
                        >
                          {day && (
                            <>
                              <div className="flex justify-between items-start mb-1.5">
                                <span className={`flex items-center justify-center w-7 h-7 text-[13px] font-semibold rounded-full transition-all ${
                                  dayIsToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 group-hover:text-indigo-500"
                                }`}>
                                  {day}
                                </span>
                                {isDotted && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/50 mt-1.5" />}
                              </div>
                              
                              <div className="space-y-1 px-0.5 overflow-hidden">
                                {events.slice(0, 3).map(event => (
                                  <div
                                    key={event.id}
                                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-md truncate border shadow-sm transition-all hover:brightness-95 ${getEventTypeColor(event.type)}`}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {events.length > 3 && (
                                  <div className="text-[10px] text-slate-400 font-semibold px-1.5 uppercase tracking-tighter opacity-70">
                                    + {events.length - 3} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
               </div>
            ) : (
               /* Agenda / List View - Compact executive style */
               <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.sort((a,b) => new Date(a.date) - new Date(b.date)).map(event => (
                      <div key={event.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all active:scale-[0.99] group shadow-sm">
                         <div className="flex flex-col items-center justify-center min-w-[50px] h-fit bg-indigo-50 rounded-xl p-2 border border-indigo-100">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase leading-none mb-1">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-xl font-bold text-indigo-600 leading-none">{new Date(event.date).getDate()}</span>
                         </div>
                         <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                               <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-tight">{event.title}</h3>
                               <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border shadow-sm ${getEventTypeColor(event.category)}`}>
                                 {event.category}
                               </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 font-medium">
                               <p className="flex items-center gap-1.5 text-indigo-400 font-semibold uppercase tracking-tighter"><Clock size={12} /> {event.time}</p>
                               <p className="flex items-center gap-1.5 uppercase tracking-tighter opacity-80"><MapPin size={12} className="text-slate-300" /> {event.location}</p>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold uppercase tracking-widest bg-white rounded-2xl border-2 border-dashed border-slate-100">No events found...</div>
                  )}
               </div>
            )}
          </div>

          {/* Sidebar Area: Detailed Peek & Legends */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-5">
            {/* Selected Date Detail Panel (Interactive) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100/60 overflow-hidden">
               <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold text-slate-800 tracking-tight uppercase">Selected Date</h3>
                  {selectedDate && <span className="text-[11px] font-semibold text-indigo-600 px-3 py-1 bg-white rounded-full border border-indigo-100">{months[currentDate.getMonth()]} {selectedDate}</span>}
               </div>
               <div className="p-5 min-h-[180px]">
                  {selectedDate ? (
                    <div className="space-y-4">
                        {getEventsForDate(selectedDate).length > 0 ? (
                           getEventsForDate(selectedDate).map(event => (
                              <div key={event.id} className="space-y-2.5">
                                 <div className="flex items-center justify-between">
                                    <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{event.title}</h4>
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-lg shadow-indigo-100" />
                                 </div>
                                 <p className="text-[11px] text-slate-500 italic leading-snug">"{event.description || 'Professional corporate engagement entry.'}"</p>
                                 <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-t border-slate-50">
                                    <p className="flex items-center gap-1.5"><Clock size={11} className="text-indigo-400" /> {event.time}</p>
                                    <p className="flex items-center gap-1.5 truncate leading-none opacity-80"><MapPin size={11} /> {event.location}</p>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="flex flex-col items-center justify-center py-6 gap-3">
                              <History size={24} className="text-slate-100" />
                              <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">No detailed entries</p>
                           </div>
                        )}
                        <button 
                           onClick={() => handleOpenAddModal()}
                           className="w-full py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                           <Plus size={14} />
                           Add Event
                        </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                          <Grid size={24} />
                       </div>
                       <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest leading-relaxed">Select a date to view<br/>professional details</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Event Legend Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100/60 p-5 space-y-4">
              <h3 className="text-[12px] font-semibold text-slate-800 tracking-tight uppercase border-b border-slate-50 pb-2.5">Agenda Legend</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Meetings', color: 'bg-blue-100 ring-blue-500' },
                  { label: 'Holidays', color: 'bg-rose-100 ring-rose-500' },
                  { label: 'Training', color: 'bg-emerald-100 ring-emerald-500' },
                  { label: 'Reviews', color: 'bg-purple-100 ring-purple-500' },
                  { label: 'Events', color: 'bg-amber-100 ring-amber-500' }
                ].map(type => (
                  <div key={type.label} className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${type.color.split(' ')[0]} ring-1 ${type.color.split(' ')[1]}/20`} />
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Feed (Synced Peek) */}
            <div className="bg-indigo-600 rounded-[32px] p-6 shadow-xl shadow-indigo-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <Calendar size={80} />
               </div>
               <div className="relative z-10 space-y-5">
                  <h3 className="text-white font-semibold text-base tracking-tight">Sync Feed</h3>
                  <div className="space-y-4">
                     {upcomingEvents.slice(0, 2).map(event => (
                        <div key={event.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                           <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-none mb-1">{event.date}</p>
                           <h4 className="text-xs font-semibold text-white leading-tight mb-2">{event.title}</h4>
                           <div className="flex items-center gap-2 text-[9px] text-white/50 font-bold uppercase tracking-tighter">
                              <MapPin size={10} />
                              {event.location}
                           </div>
                        </div>
                     ))}
                  </div>
                  <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-[0.2em] italic text-center pt-2">Real-time scheduling active</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyCalendar;