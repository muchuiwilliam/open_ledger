import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const API_URL = 'http://127.0.0.1:9090';

// Theme Colors
const COLORS = {
  golden: '#B8860B',
  goldenDark: '#8B6508',
  goldenLight: '#D4AF37',
  muted: '#e5e7eb',
  pie: ['#B8860B', '#4B5563']
};

// Formatter for large numbers (Billions/Millions)
const formatCurrency = (value) => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  return value.toLocaleString();
};

// --- COMPONENTS ---

const Navbar = () => {
  const location = useLocation();
  
  const navLink = (path, name) => {
    const isActive = location.pathname.startsWith(path);
    return (
      <Link 
        to={path} 
        className={`px-4 py-2 rounded-md font-semibold transition-colors ${
          isActive 
            ? 'bg-[#B8860B] text-white shadow' 
            : 'text-gray-600 hover:bg-[#f3f4f6] hover:text-[#8B6508]'
        }`}
      >
        {name}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 mb-8 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#8B6508] flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          FinanceGov
        </h1>
        <div className="flex gap-2">
          {navLink('/expenditure', 'Expenditure')}
          {navLink('/revenue', 'Revenue')}
          {navLink('/tendering', 'Tendering')}
        </div>
      </div>
    </nav>
  );
};

// --- PAGES ---

const Expenditure = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  
  // Toggles for bar chart
  const [activeFields, setActiveFields] = useState({
    personal_income_tax: true,
    corporation_income_tax: true,
    domestic_vat: true,
    imports_excise_duty: true,
    imports_vat: true,
  });

  useEffect(() => {
    fetch(`${API_URL}/expenditure`)
      .then(res => res.json())
      .then(fetchedData => {
        const cleanedData = fetchedData.map(item => ({
          ...item,
          year: item.fiscal_year.replace('Y', ''),
        })).sort((a, b) => a.year.localeCompare(b.year));
        setData(cleanedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleField = (field) => {
    setActiveFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) return <div className="text-center p-8 text-[#B8860B]">Loading expenditure data...</div>;
  if (!data.length) return <div className="text-center p-8 text-gray-500">No data available. Ensure the backend is running.</div>;

  const filteredData = selectedYear === 'All' ? data : data.filter(d => d.year === selectedYear);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Tax Trends Over Time (Line Graph)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => [value.toLocaleString(), undefined]} />
              <Legend />
              <Line type="monotone" dataKey="domestic_vat" stroke={COLORS.golden} name="Domestic VAT" strokeWidth={3} />
              <Line type="monotone" dataKey="corporation_income_tax" stroke={COLORS.goldenDark} name="Corporate Tax" strokeWidth={3} />
              <Line type="monotone" dataKey="personal_income_tax" stroke={COLORS.goldenLight} name="Personal Tax" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Expenditure Breakdown by Year (Bar Graph)</h2>
          <select 
            className="border-2 border-gray-200 p-2 rounded-md focus:outline-none focus:border-[#B8860B] bg-white"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="All">All Years</option>
            {data.map(d => <option key={d.year} value={d.year}>{d.year}</option>)}
          </select>
        </div>
        
        {/* Clickable Options for Bar Graph */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.keys(activeFields).map((field) => (
            <button
              key={field}
              onClick={() => toggleField(field)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFields[field] 
                  ? 'bg-[#B8860B] text-white shadow-md' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => [value.toLocaleString(), undefined]} cursor={{fill: '#f9fafb'}} />
              <Legend />
              {activeFields.domestic_vat && <Bar dataKey="domestic_vat" fill={COLORS.golden} name="Domestic VAT" radius={[4, 4, 0, 0]} />}
              {activeFields.corporation_income_tax && <Bar dataKey="corporation_income_tax" fill={COLORS.goldenDark} name="Corporate Tax" radius={[4, 4, 0, 0]} />}
              {activeFields.personal_income_tax && <Bar dataKey="personal_income_tax" fill={COLORS.goldenLight} name="Personal Tax" radius={[4, 4, 0, 0]} />}
              {activeFields.imports_vat && <Bar dataKey="imports_vat" fill="#4B5563" name="Imports VAT" radius={[4, 4, 0, 0]} />}
              {activeFields.imports_excise_duty && <Bar dataKey="imports_excise_duty" fill="#9CA3AF" name="Imports Excise" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Revenue = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/revenue`)
      .then(res => res.json())
      .then(fetchedData => {
        const cleanedData = fetchedData.map(item => ({
          ...item,
          year: item.fiscal_year.replace('Y', ''),
          non_domestic: item.total_revenue - item.domestic // Calculate for pie chart
        })).sort((a, b) => a.year.localeCompare(b.year));
        setData(cleanedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8 text-[#B8860B]">Loading revenue data...</div>;
  if (!data.length) return <div className="text-center p-8 text-gray-500">No data available. Ensure the backend is running.</div>;

  // For the pie chart, we'll display the latest year's breakdown
  const latestData = data[data.length - 1];
  const pieData = [
    { name: 'Domestic Revenue', value: latestData.domestic },
    { name: 'Other Revenue', value: latestData.non_domestic }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      {/* Line Chart Component */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Revenue Growth</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="total_revenue" stroke={COLORS.golden} name="Total Revenue" strokeWidth={3} />
              <Line type="monotone" dataKey="domestic" stroke={COLORS.goldenDark} name="Domestic" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart Component */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Revenue Breakdown ({latestData.year})</h2>
        <p className="text-sm text-gray-500 mb-4 border-b pb-2">Clickable segments for detailed tooltips</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Tendering = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/tendering`)
      .then(res => res.json())
      .then(fetchedData => {
        const cleanedData = fetchedData.map(item => ({
          ...item,
          year: item.fiscal_year.replace('Y', ''),
        })).sort((a, b) => a.year.localeCompare(b.year));
        setData(cleanedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8 text-[#B8860B]">Loading tendering data...</div>;
  if (!data.length) return <div className="text-center p-8 text-gray-500">No data available. Ensure the backend is running.</div>;

  return (
    <div className="animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Tendering Opportunities Over Time</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={COLORS.golden} 
                name="Opportunity Count" 
                strokeWidth={3} 
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- APP WRAPPER ---

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#faf9f6] font-sans text-gray-800">
        <Navbar />
        <main className="max-w-6xl mx-auto px-8 pb-12">
          <Routes>
            {/* Redirect root (/) to expenditure to fix 404 */}
            <Route path="/" element={<Navigate to="/expenditure" replace />} />
            <Route path="/expenditure" element={<Expenditure />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/tendering" element={<Tendering />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
