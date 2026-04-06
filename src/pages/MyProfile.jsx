import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, Building, 
  Camera, Edit3, Save, X, ArrowLeft, History, Clock, FileText, 
  CheckCircle2, AlertCircle, ChevronRight, LayoutDashboard,
  Settings, LogOut, Bell, Shield, Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { MOCK_EMPLOYEES, MOCK_LEAVE_DATA } from '../data/mockData';

const MyProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaveData, setLeaveData] = useState([]);
  const [gatePassData, setGatePassData] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setLoading(true);
    // Simulate upload delay
    setTimeout(() => {
      const imageUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, candidatePhoto: imageUrl }));
      setFormData(prev => ({ ...prev, candidatePhoto: imageUrl }));
      toast.success('Profile picture updated successfully (Mock)!');
      setLoading(false);
    }, 1000);
  };

  const getDisplayableImageUrl = (url) => {
    if (!url) return null;
    return url;
  };

  const fetchLeaveData = () => {
    const employeeName = profileData?.candidateName;
    if (!employeeName) return;

    const data = MOCK_LEAVE_DATA.filter(
      leave => leave.employeeName.toLowerCase() === employeeName.toLowerCase()
    );
    setLeaveData(data);
  };

  const fetchGatePassData = () => {
    setGatePassData([]); // Mock gate pass data empty for now
  };

  const fetchJoiningData = () => {
    setLoading(true);
    const userData = localStorage.getItem('user');
    if (!userData) {
      setLoading(false);
      return;
    }

    const currentUser = JSON.parse(userData);
    const profile = MOCK_EMPLOYEES.find(
      emp => emp.candidateName.toLowerCase() === currentUser.Name.toLowerCase()
    );

    if (profile) {
      setProfileData(profile);
      setFormData(profile);
      localStorage.setItem("employeeId", profile.joiningNo);
    } else {
      setProfileData(null);
      setFormData({});
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJoiningData();
  }, []);

  useEffect(() => {
    if (profileData && profileData.candidateName) {
      fetchLeaveData();
      fetchGatePassData();
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate save delay
    setTimeout(() => {
      setProfileData(formData);
      toast.success('Profile updated successfully (Mock)!');
      setIsEditing(false);
      setLoading(false);
    }, 800);
  };

  const handleCancel = () => {
    setFormData(profileData || {});
    setIsEditing(false);
  };

  if (loading && !profileData) {
    return (
      <div className="page-content p-6">
        <LoadingSpinner message="Loading profile data..." minHeight="400px" />
      </div>
    );
  }

  if (!profileData && !loading) {
    return <div className="page-content p-6 text-center py-20">
      <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
      <p className="text-slate-500 font-medium text-lg">No profile data available for this user.</p>
    </div>;
  }

  return (
    <div className="space-y-6 page-content p-6 font-outfit">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your personal information and history</p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-100"
            >
              <Edit3 size={16} className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg shadow-emerald-100"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all font-bold text-sm"
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 flex flex-col items-center text-center">
            <div
              className="relative w-40 h-40 bg-indigo-50 rounded-full flex items-center justify-center mb-6 overflow-hidden cursor-pointer group border-4 border-white shadow-xl shadow-slate-100"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={handleProfilePictureClick}
            >
              {profileData.candidatePhoto ? (
                <img
                  src={getDisplayableImageUrl(profileData.candidatePhoto)}
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <User size={64} className="text-indigo-200" />
              )}
              
              <div
                className={`absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              >
                <Camera size={32} className="text-white" />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {profileData.candidateName}
            </h2>
            <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">{profileData.designation}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 w-full flex justify-around">
               <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Active</span>
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID</p>
                  <span className="text-sm font-black text-slate-700">#{profileData.joiningNo}</span>
               </div>
            </div>
        </div>

        {/* Personal Information */}
        <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8">
          <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8 flex items-center gap-2">
            <User size={20} className="text-indigo-600" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            <InfoField label="Father's Name" value={profileData.fatherName} icon={<User size={14}/>} />
            <InfoField label="Department" value={profileData.department} icon={<Building size={14}/>} />
            <InfoField label="Date of Joining" value={profileData.dateOfJoining} icon={<Calendar size={14}/>} />
            <InfoField label="Gender" value={profileData.gender} />
            
            <EditableField 
              label="Email Address" 
              name="email" 
              value={formData.email} 
              isEditing={isEditing} 
              onChange={handleInputChange} 
              icon={<Mail size={14}/>} 
            />
            
            <EditableField 
              label="Phone Number" 
              name="mobileNo" 
              value={formData.mobileNo} 
              isEditing={isEditing} 
              onChange={handleInputChange} 
              icon={<Phone size={14}/>} 
            />
            
            <EditableField 
              label="Emergency Contact" 
              name="familyMobileNo" 
              value={formData.familyMobileNo} 
              isEditing={isEditing} 
              onChange={handleInputChange} 
            />
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-indigo-600" />
              Current Address
            </label>
            {isEditing ? (
              <textarea
                name="currentAddress"
                value={formData.currentAddress || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all"
              />
            ) : (
              <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
                {profileData.currentAddress}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Leave History Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
               <History size={20} className="text-indigo-600" />
               Leave History
             </h3>
             <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest">{leaveData.length} Records</span>
          </div>

          {leaveData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaveData.map((leave, index) => (
                    <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-slate-700">
                        {leave.leaveType}
                      </td>
                      <td className="py-4 text-xs font-bold text-slate-600">
                        {leave.startDate} <span className="text-slate-300 mx-1">→</span> {leave.endDate}
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              leave.status.toLowerCase() === "approved" ? "bg-emerald-100 text-emerald-700" : 
                              leave.status.toLowerCase() === "rejected" ? "bg-rose-100 text-rose-700" : 
                              "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-bold text-slate-400">
                        {leave.appliedDate || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                <p className="text-sm font-bold text-slate-400">No leave records found</p>
             </div>
          )}
      </div>
    </div>
  );
};

const InfoField = ({ label, value, icon }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </label>
    <p className="text-sm font-black text-slate-700">{value || 'N/A'}</p>
  </div>
);

const EditableField = ({ label, name, value, isEditing, onChange, icon }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </label>
    {isEditing ? (
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all"
      />
    ) : (
      <p className="text-sm font-black text-slate-700">{value || 'N/A'}</p>
    )}
  </div>
);

export default MyProfile;