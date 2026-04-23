import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDataStore = create(
  persist(
    (set, get) => ({
      // Indent Data
      indentData: [],
      addIndent: (data) => set((state) => ({
        indentData: [...state.indentData, { 
          ...data, 
          id: Date.now(), 
          indentNo: `IND-${String(state.indentData.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString() 
        }]
      })),


      // Find Enquiry Data
      findEnquiryData: [],
      addEnquiry: (data) => set((state) => ({
        findEnquiryData: [...state.findEnquiryData, { 
          ...data, 
          id: Date.now(),
          candidateEnquiryNo: `EN-${String(state.findEnquiryData.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString() 
        }]
      })),

      // Call Tracker Data
      callTrackerData: [],
      updateCallTracker: (id, data) => set((state) => ({
        callTrackerData: state.callTrackerData.map(item => 
          item.id === id ? { ...item, ...data, lastUpdated: new Date().toISOString() } : item
        )
      })),

      // Employee Data
      employeeData: [],
      addEmployee: (data) => set((state) => ({
        employeeData: [...state.employeeData, { 
          ...data, 
          id: Date.now(),
          employeeId: `EMP-${String(state.employeeData.length + 1).padStart(4, '0')}`,
          status: 'active',
          createdAt: new Date().toISOString() 
        }]
      })),

      // After Joining Work Data
      afterJoiningData: [],
      updateAfterJoining: (id, data) => set((state) => ({
        afterJoiningData: state.afterJoiningData.map(item => 
          item.id === id ? { ...item, ...data, completed: true } : item
        )
      })),

      // Leaving Data
      leavingData: [],
      addLeaving: (data) => set((state) => ({
        leavingData: [...state.leavingData, { 
          ...data, 
          id: Date.now(),
          status: 'pending',
          createdAt: new Date().toISOString() 
        }]
      })),

      // After Leaving Work Data
      afterLeavingData: [],
      updateAfterLeaving: (id, data) => set((state) => ({
        afterLeavingData: state.afterLeavingData.map(item => 
          item.id === id ? { ...item, ...data, completed: true } : item
        )
      })),

      // Employee Attendance Data
      attendanceData: [
        {
          id: 1,
          employeeId: 'EMP-0001',
          date: '2024-01-15',
          checkIn: '09:00',
          checkOut: '18:00',
          status: 'Present',
          workingHours: 9,
          overtime: 0
        },
        {
          id: 2,
          employeeId: 'EMP-0001',
          date: '2024-01-16',
          checkIn: '09:15',
          checkOut: '18:30',
          status: 'Present',
          workingHours: 9.25,
          overtime: 0.25
        },
        {
          id: 3,
          employeeId: 'EMP-0001',
          date: '2024-01-17',
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          workingHours: 0,
          overtime: 0
        }
      ],
      addAttendance: (data) => set((state) => ({
        attendanceData: [...state.attendanceData, { 
          ...data, 
          id: Date.now(),
          createdAt: new Date().toISOString() 
        }]
      })),

      // Leave Requests Data
      leaveRequestsData: [
        {
          id: 1,
          employeeId: 'EMP-0001',
          leaveType: 'Sick Leave',
          fromDate: '2024-01-20',
          toDate: '2024-01-22',
          days: 3,
          reason: 'Medical treatment',
          status: 'Approved',
          appliedDate: '2024-01-18',
          approvedBy: 'HR Manager'
        },
        {
          id: 2,
          employeeId: 'EMP-0001',
          leaveType: 'Annual Leave',
          fromDate: '2024-02-10',
          toDate: '2024-02-12',
          days: 3,
          reason: 'Personal work',
          status: 'Pending',
          appliedDate: '2024-01-25',
          approvedBy: null
        }
      ],
      addLeaveRequest: (data) => set((state) => ({
        leaveRequestsData: [...state.leaveRequestsData, { 
          ...data, 
          id: Date.now(),
          appliedDate: new Date().toISOString().split('T')[0],
          status: 'Pending'
        }]
      }))

    }),
    {
      name: 'hr-fms-data-storage',
    }
  )
);

export default useDataStore;