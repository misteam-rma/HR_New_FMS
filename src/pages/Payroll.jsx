import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Filter, DollarSign, PieChart, 
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import DataTable from '../components/DataTable/DataTable';
import TableFilters from '../components/DataTable/TableFilters';
import TableTabs from '../components/DataTable/TableTabs';

const Payroll = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [filterDepartment, setFilterDepartment] = useState("");

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const dummyRows = [
          ["1", "EMP1001", "Rahul Sharma", "Software Engineer", "22", "50000", "30000", "2000", "5000", "2000", "5000", "6000", "0", "0", "48000", "2024", "April", "Engineering"],
          ["2", "EMP1002", "Priya Patel", "HR Manager", "23", "60000", "35000", "2000", "8000", "2000", "7000", "6000", "0", "0", "58000", "2024", "April", "HR"],
          ["3", "EMP1003", "Amit Kumar", "Sales Executive", "21", "40000", "25000", "2500", "4000", "1500", "3000", "4000", "1000", "0", "38000", "2024", "April", "Sales"],
          ["4", "EMP1004", "Sneha Gupta", "Accountant", "22", "45000", "28000", "2000", "4500", "1500", "4000", "5000", "0", "0", "43000", "2024", "April", "Finance"],
          ["5", "EMP1005", "Vikram Singh", "Project Manager", "24", "75000", "45000", "2000", "10000", "2500", "10000", "5500", "0", "0", "73000", "2024", "April", "Operations"]
        ];

        const transformedData = dummyRows.map((row) => ({
          serialNo: row[0] || "",
          employeeCode: row[1] || "",
          employeeName: row[2] || "",
          designation: row[3] || "",
          daysPresent: row[4] || 0,
          totalActual: parseFloat(row[5]) || 0,
          basic: parseFloat(row[6]) || 0,
          conveyance: parseFloat(row[7]) || 0,
          hra: parseFloat(row[8]) || 0,
          medicalAllowance: parseFloat(row[9]) || 0,
          specialAllowance: parseFloat(row[10]) || 0,
          otherAllowances: parseFloat(row[11]) || 0,
          loan: parseFloat(row[12]) || 0,
          additionalSalary: parseFloat(row[13]) || 0,
          toBePaidAfterPF: parseFloat(row[14]) || 0,
          year: row[15] || "",
          month: row[16] || "",
          department: row[17] || "N/A"
        }));

        setPayrollData(transformedData);
        setLoading(false);
      }, 800);
    };

    fetchData();
  }, []);

  const filteredData = payrollData.filter((item) => {
    const matchesSearch =
      item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.year.toString().includes(searchTerm) ||
      item.month.toString().toLowerCase().includes(searchTerm.toLowerCase());

    let matchesPeriod = true;
    if (selectedPeriod) {
      const [selectedYear, selectedMonthNum] = selectedPeriod.split('-');
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const selectedMonthName = monthNames[parseInt(selectedMonthNum) - 1];
      matchesPeriod = item.year.toString() === selectedYear &&
        item.month.toString() === selectedMonthName;
    }

    const matchesDept = !filterDepartment || item.department === filterDepartment;

    return matchesSearch && matchesPeriod && matchesDept;
  });

  const departments = [...new Set(payrollData.map(d => d.department))].filter(Boolean).sort();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const columns = [
    { 
      header: "Employee", 
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800">{item.employeeName}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.employeeCode} • {item.designation}</span>
        </div>
      )
    },
    { 
      header: "Attendance", 
      accessor: (item) => (
        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold lowercase tracking-tighter">
          {item.daysPresent} days present
        </span>
      )
    },
    { 
      header: "Base Payout", 
      accessor: (item) => (
        <div className="flex flex-col text-[11px]">
          <span className="font-bold text-slate-700">₹{item.basic.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 font-medium">Basic Salary</span>
        </div>
      )
    },
    { 
      header: "Allowances", 
      accessor: (item) => {
        const total = item.medicalAllowance + item.hra + item.conveyance + item.specialAllowance + item.otherAllowances;
        return (
          <div className="flex flex-col text-[11px]">
            <span className="font-bold text-emerald-600">₹{total.toLocaleString()}</span>
            <span className="text-[9px] text-slate-400 font-medium lowercase tracking-tighter">Total Adj.</span>
          </div>
        );
      }
    },
    { 
      header: "Deductions", 
      accessor: (item) => (
        <div className="flex flex-col text-[11px]">
          <span className="font-bold text-rose-500">-₹{item.loan.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 font-medium">Loan/Adv.</span>
        </div>
      )
    },
    { 
      header: "Net Paid", 
      accessor: (item) => (
        <div className="bg-indigo-50/40 px-3 py-1 rounded-lg border border-indigo-100 shadow-inner">
          <span className="text-xs font-bold text-indigo-700 tracking-tight whitespace-nowrap">₹{item.toBePaidAfterPF.toLocaleString()}</span>
        </div>
      ),
      className: "bg-indigo-50/10"
    },
    { 
      header: "Period", 
      accessor: (item) => (
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.month} {item.year}</span>
      )
    }
  ];

  const renderMobileCard = (item) => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600 text-xs">#{item.employeeCode}</span>
          <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-indigo-600 font-bold uppercase tracking-wider">{item.department}</span>
        </div>
        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">{item.daysPresent}D Present</span>
      </div>

      <div>
        <div className="text-sm font-bold text-slate-800 tracking-tight">{item.employeeName}</div>
        <div className="text-xs text-slate-500 mt-1 font-medium">{item.designation} • {item.month} {item.year}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-50">
        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
          <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-tighter">Gross Base</span>
          <span className="font-bold text-slate-700 text-xs">₹{item.basic.toLocaleString()}</span>
        </div>
        <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 text-right">
          <span className="block text-indigo-400 text-[9px] font-bold uppercase tracking-tighter">Net Payable</span>
          <span className="font-bold text-indigo-700 text-xs">₹{item.toBePaidAfterPF.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tighter text-slate-400 px-1">
        <div className="flex gap-3">
          <span className="flex items-center gap-1"><ArrowUpRight size={10} className="text-emerald-500" /> ₹{(item.medicalAllowance + item.hra + item.conveyance + item.specialAllowance + item.otherAllowances).toLocaleString()} All.</span>
          <span className="flex items-center gap-1"><ArrowDownRight size={10} className="text-rose-500" /> ₹{item.loan.toLocaleString()} Ded.</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:pb-4 mb-4 font-outfit">
      {/* Main Header & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
             <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payroll Management</h1>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Financial and compensation tracking system</p>
           </div>
           
           <TableTabs 
             activeTab="all"
             onTabChange={() => {}}
             tabs={[
               { id: 'all', label: `Payroll Records`, count: filteredData.length, icon: <DollarSign /> }
             ]}
           />
        </div>

        <TableFilters 
          searchTerm={searchTerm}
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          searchPlaceholder="Search by name, ID or designation..."
          filters={[
             {
              label: "All Departments",
              type: 'select',
              value: filterDepartment,
              options: departments.map(d => ({ label: d, value: d })),
              onSelect: (val) => { setFilterDepartment(val); setCurrentPage(1); }
            },
            {
              label: "Select Month",
              type: 'date', // Using date type for month picker parity in TableFilters
              value: selectedPeriod,
              onSelect: (val) => { setSelectedPeriod(val); setCurrentPage(1); }
            }
          ]}
        />
      </div>

      <DataTable 
        columns={columns}
        data={currentItems}
        loading={loading}
        error={error}
        onRetry={() => window.location.reload()}
        emptyMessage="No payroll records found matching your criteria."
        renderMobileCard={renderMobileCard}
        pagination={{
            currentPage,
            itemsPerPage,
            totalItems: filteredData.length,
            onPageChange: (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); },
            onItemsPerPageChange: (val) => { setItemsPerPage(val); setCurrentPage(1); }
        }}
      />
    </div>
  );
};

export default Payroll;