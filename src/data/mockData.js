// src/data/mockData.js

export const MOCK_USERS = [
  { Username: "admin", Password: "123", Name: "Admin User", Admin: "Yes", Code: "ADM001" },
  { Username: "rahul", Password: "123", Name: "Rahul Sharma", Admin: "No", Code: "EMP1001", Department: "Engineering" },
  { Username: "priya", Password: "123", Name: "Priya Singh", Admin: "No", Code: "EMP1002", Department: "Human Resources" },
  { Username: "amit", Password: "123", Name: "Amit Verma", Admin: "No", Code: "EMP1003", Department: "Operations" },
];

export const MOCK_EMPLOYEES = [
  {
    joiningNo: "EMP1001",
    candidateName: "Rahul Sharma",
    designation: "Frontend Developer",
    department: "Engineering",
    dateOfJoining: "15/01/2023",
    mobileNo: "9876543210",
    email: "rahul.s@example.com",
    candidatePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    status: "Active",
    gatePassStatus: "Inside",
    location: "Noida, India",
    currentAddress: "B-45, Sector 62, Noida, UP",
    aadhaarNo: "XXXX-XXXX-1234",
    fatherName: "Mr. S.P. Sharma",
    gender: "Male",
  },
  {
    joiningNo: "EMP1002",
    candidateName: "Priya Singh",
    designation: "HR Manager",
    department: "Human Resources",
    dateOfJoining: "10/02/2023",
    mobileNo: "9876543211",
    email: "priya.h@example.com",
    candidatePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    status: "Active",
    gatePassStatus: "Outside",
    location: "Delhi, India",
    currentAddress: "Flat 202, Sunshine Apts, Dwarka, Delhi",
    aadhaarNo: "XXXX-XXXX-5678",
    fatherName: "Mr. R.K. Singh",
    gender: "Female",
  },
  {
    joiningNo: "EMP1003",
    candidateName: "Amit Verma",
    designation: "Operations Lead",
    department: "Operations",
    dateOfJoining: "05/03/2023",
    mobileNo: "9876543212",
    email: "amit.v@example.com",
    candidatePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    status: "Active",
    gatePassStatus: "Inside",
    location: "Gurgaon, India",
    currentAddress: "House 12, MG Road, Gurgaon, Haryana",
    aadhaarNo: "XXXX-XXXX-9012",
    gender: "Male",
  }
];

const now = new Date();
const currYear = now.getFullYear();
const currMonthStr = String(now.getMonth() + 1).padStart(2, '0');
const currMonthInt = now.getMonth();

export const MOCK_ATTENDANCE = Array.from({ length: 25 }, (_, i) => {
  const isLate = i % 5 === 0;
  const isAbsent = i % 12 === 0;
  
  // Assign most to EMP1001 (Rahul) for testing user view, plus some for others
  const empCode = i % 3 === 1 ? "EMP1002" : (i % 3 === 2 ? "EMP1003" : "EMP1001");
  const empName = empCode === "EMP1001" ? "Rahul Sharma" : (empCode === "EMP1002" ? "Priya Singh" : "Amit Verma");
  
  const dateDay = (i % 28) + 1;
  const formattedDay = String(dateDay).padStart(2, '0');

  return {
    date: `${currYear}-${currMonthStr}-${formattedDay}`,
    employeeId: empCode,
    name: empName,
    punchIn: isAbsent ? "-" : (isLate ? "09:45 AM" : "09:00 AM"),
    punchOut: isAbsent ? "-" : "06:00 PM",
    status: isAbsent ? "Absent" : (isLate ? "Late" : "Present"),
    location: i % 4 === 0 ? "Remote" : "Office"
  };
});

export const MOCK_LEAVE_DATA = Array.from({ length: 20 }, (_, i) => {
  const isPending = i % 4 === 0;
  const isRejected = i % 5 === 0 && !isPending;
  const status = isPending ? "Pending" : (isRejected ? "Rejected" : "Approved");
  
  const empCode = i % 2 === 0 ? "EMP1001" : (i % 3 === 0 ? "EMP1003" : "EMP1002");
  const empName = empCode === "EMP1001" ? "Rahul Sharma" : (empCode === "EMP1002" ? "Priya Singh" : "Amit Verma");
  
  const types = ["Casual Leave", "Sick Leave", "Earned Leave", "Restricted Holiday"];
  const leaveType = types[i % 4];
  
  const startD = (i % 20) + 1;
  const fStart = String(startD).padStart(2, '0');
  const endD = startD + (i % 3);
  const fEnd = String(endD).padStart(2, '0');

  return {
    id: i + 1,
    employeeId: empCode,
    employeeName: empName,
    startDate: `${fStart}/${currMonthStr}/${currYear}`,
    endDate: `${fEnd}/${currMonthStr}/${currYear}`,
    days: (endD - startD) + 1,
    leaveType: leaveType,
    status: status,
    reason: leaveType === "Sick Leave" ? "Viral Fever" : "Personal Work",
    appliedDate: `01/${currMonthStr}/${currYear}`
  };
});

export const MOCK_CALENDAR_EVENTS = [
  { id: 1, title: "Q2 Town Hall", date: "2024-04-15", category: "Meeting", location: "Conference Hall A", description: "Company-wide project updates" },
  { id: 2, title: "Eid Holiday", date: "2024-04-11", category: "Holiday", location: "Global", description: "Public holiday" },
  { id: 3, title: "Team Lunch", date: "2024-04-20", category: "Cultural", location: "Roof Garden", description: "Monthly team bonding" },
  { id: 4, title: "UI Design Workshop", multi: false, date: "2024-04-25", category: "Training", location: "Innovation Hub", description: "Modern UI/UX trends" },
];

const USERS_LIST = [
  { code: "EMP1001", name: "Rahul Sharma", dept: "Engineering" },
  { code: "EMP1002", name: "Priya Singh", dept: "Human Resources" },
  { code: "EMP1003", name: "Amit Verma", dept: "Operations" },
  { code: "EMP1004", name: "Sneha Gupta", dept: "Finance" },
  { code: "EMP1005", name: "Vikram Singh", dept: "Marketing" }
];

export const MOCK_NOC_108 = Array.from({ length: 20 }, (_, i) => {
  const isPending = i % 4 === 0;
  const isApproved = i % 4 === 1 || i % 4 === 2;
  const status = isPending ? 'Pending' : (isApproved ? 'Approved' : 'Rejected');
  
  const user = USERS_LIST[i % USERS_LIST.length];
  
  return {
    id: i + 1,
    serialNo: i + 1,
    employeeCode: user.code,
    department: user.dept,
    name: user.name,
    teamHead: `Head ${i % 3 + 1}`,
    dateOfJoining: `2023-${(i % 12) + 1 < 10 ? '0'+((i%12)+1) : (i%12)+1}-15`,
    completionDate: `2024-${(i % 12) + 1 < 10 ? '0'+((i%12)+1) : (i%12)+1}-10`,
    regUnder: i % 2 === 0 ? "Standard" : "Contract",
    experience: `1 Year ${i % 11 + 1} Months`,
    totalLeaveDate: `${(i % 15) + 2}`,
    status: status,
    approvalTime: isPending ? null : `2024-04-1${(i % 9)} 10:30 AM`,
    approveBy: isPending ? null : "Admin User"
  };
});

export const MOCK_PARTNERS = [
  { partnerCode: "P-001", partnerName: "Reliance Industries" },
  { partnerCode: "P-002", partnerName: "Tata Consultancy" },
  { partnerCode: "P-003", partnerName: "Wipro Tech" },
  { partnerCode: "P-004", partnerName: "Infosys" },
  { partnerCode: "P-005", partnerName: "HCL Technologies" }
];

export const MOCK_REIMBURSEMENTS = Array.from({ length: 20 }, (_, i) => {
  const isPending = i % 3 === 0;
  const isApproved = i % 3 === 1;
  const status = isPending ? 'Pending' : (isApproved ? 'Approved' : 'Rejected');
  
  const user = USERS_LIST[i % USERS_LIST.length];
  const partner = MOCK_PARTNERS[i % MOCK_PARTNERS.length];
  
  const km = (i * 15 + 20) % 150 + 10;
  const rate = i % 2 === 0 ? 10 : 5;
  const amount = km * rate;
  
  return {
    id: i + 1,
    serialNo: i + 1,
    employeeCode: user.code,
    name: user.name,
    visitDate: `2024-04-${(i % 28) + 1 < 10 ? '0'+((i%28)+1) : (i%28)+1}`,
    clientPlace: `Client Site ${i + 1}`,
    km: km.toString(),
    vehicleType: i % 2 === 0 ? "4-Wheeler" : "2-Wheeler",
    rateOfVehicle: rate.toString(),
    partnerCode: partner.partnerCode,
    partnerName: partner.partnerName,
    amount: amount.toString(),
    billImage: `bill_00${i + 1}.jpg`,
    status: status,
    approvalTime: isPending ? null : `2024-04-1${(i % 9)} 09:30 AM`,
    approveBy: isPending ? null : "Admin User",
    remarks: status === 'Rejected' ? "Missing toll receipts" : (isApproved ? "Approved by Admin" : "")
  };
});

export const MOCK_FEEDBACK = Array.from({ length: 20 }, (_, i) => {
  const isResponded = i % 2 === 0;
  
  const user = USERS_LIST[i % USERS_LIST.length];
  
  const problems = ["Missing Salary", "Software Crash", "Monitor Broken", "Leave Conflict", "Overtime Not Updated"];
  const problem = problems[i % problems.length];
  
  return {
    id: i + 1,
    serialNo: i + 1,
    employeeCode: user.code,
    name: user.name,
    problem: problem,
    description: `I am experiencing an issue regarding ${problem.toLowerCase()}. Need urgent assistance.`,
    screenShot: i % 3 === 0 ? `error_log_${i+1}.png` : "",
    suggestion: i % 4 === 0 ? "Maybe update the server guidelines" : "",
    email: `${user.name.split(" ")[0].toLowerCase()}@company.com`,
    status: isResponded ? "Responded" : "Pending",
    response: isResponded ? "We have reviewed your request and our IT team is currently resolving your issue. Expect an update within 24 hours." : ""
  };
});
