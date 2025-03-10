import LogoKomdigi from '../assets/logoKomdigiKlaten.png';
import logoKlaten from '../assets/logoKlaten-removebg-preview (2).png';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement, 
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement, 
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesCount, setEntriesCount] = useState(10);
  const [userName, setUser] = useState('');
  const [barChartPeriod, setBarChartPeriod] = useState('hari');
  const [pieChartPeriod, setPieChartPeriod] = useState('hari');

  const tableHeaders = [
    'No',
    'Nama',
    'Waktu Tanggal',
    'Kategori',
    'Identitas Tujuan',
    'Tanda Tangan',
    'Aksi'
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  const getDataByPeriod = (data, period) => {
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.error('Data is not an array:', data);
      return { umum: 0, dinas: 0 };
    }
    
    const now = new Date();
    const filteredData = data.filter(entry => {
      // Check if entry and entry.tanggal exist
      if (!entry || !entry.tanggal) return false;
      
      const entryDate = new Date(entry.tanggal);
      switch (period) {
        case 'hari':{
          return entryDate.toDateString() === now.toDateString();
        }
        case 'minggu':{
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return entryDate >= weekAgo;
        }
        case 'bulan':{
          return (
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear()
          );
        }
        case 'tahun':{
          return entryDate.getFullYear() === now.getFullYear();
        }
        default:{
          return true;
        }
      }
    });

    return {
      umum: filteredData.filter(entry => entry && entry.kategori === 'UMUM').length,
      dinas: filteredData.filter(entry => entry && entry.kategori === 'DINAS').length
    };
  };

  const getBarChartData = () => {
    // Ensure entries is an array before processing
    if (!Array.isArray(entries)) {
      return {
        labels: ['UMUM', 'DINAS'],
        datasets: [
          {
            label: `Jumlah Entri per Kategori (${barChartPeriod})`,
            data: [0, 0],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }
    
    const periodData = getDataByPeriod(entries, barChartPeriod);
    return {
      labels: ['UMUM', 'DINAS'],
      datasets: [
        {
          label: `Jumlah Entri per Kategori (${barChartPeriod})`,
          data: [periodData.umum, periodData.dinas],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getPieChartData = () => {
    // Ensure entries is an array before processing
    if (!Array.isArray(entries)) {
      return {
        labels: ['UMUM', 'DINAS'],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }
    
    const periodData = getDataByPeriod(entries, pieChartPeriod);
    return {
      labels: ['UMUM', 'DINAS'],
      datasets: [
        {
          data: [periodData.umum, periodData.dinas],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Statistik Entri per Kategori (${barChartPeriod})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Distribusi Kategori Tamu (${pieChartPeriod})`,
      },
    },
  };

  const PeriodDropdown = ({ value, onChange, className }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`select select-bordered select-sm ${className}`}
    >
      <option value="hari">Hari Ini</option>
      <option value="minggu">Minggu Ini</option>
      <option value="bulan">Bulan Ini</option>
      <option value="tahun">Tahun Ini</option>
    </select>
  );

  PeriodDropdown.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  PeriodDropdown.defaultProps = {
    className: '',
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('https://komdigi-project-backend.vercel.app/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUser(response.data.name);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get('https://komdigi-project-backend.vercel.app/api/entries', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
    
        console.log('Fetched entries:', response.data); // Log data yang diterima
        
        // Ensure we're working with an array
        const entriesData = Array.isArray(response.data) ? response.data : [];
        
        // Format dates properly
        const formattedEntries = entriesData.map(entry => ({
          ...entry,
          // Ensure tanggal is a proper Date object or ISO string
          tanggal: entry.tanggal ? entry.tanggal : new Date().toISOString()
        }));
        
        setEntries(formattedEntries);
        setFilteredEntries(formattedEntries);
      } catch (error) {
        console.error('Error fetching entries:', error);
        // Set empty arrays to prevent rendering errors
        setEntries([]);
        setFilteredEntries([]);
      }
    };
  
    fetchEntries();
  }, []);
  
  const filterEntries = () => {
    // Ensure entries is an array
    if (!Array.isArray(entries)) {
      console.error('Entries is not an array:', entries);
      setFilteredEntries([]);
      return;
    }
    
    let filtered = [...entries];
  
    if (category) {
      filtered = filtered.filter(entry => 
        entry && entry.kategori && entry.kategori.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (startDate) {
      filtered = filtered.filter(entry => 
        entry && entry.tanggal && new Date(entry.tanggal) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filtered = filtered.filter(entry => 
        entry && entry.tanggal && new Date(entry.tanggal) <= new Date(endDate)
      );
    }
  
    if (searchQuery) {
      filtered = filtered.filter(entry => 
        (entry && entry.nama && entry.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entry && entry.tujuan && entry.tujuan.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  
    console.log('Filtered entries:', filtered); // Log data yang difilter
    setFilteredEntries(filtered);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus entri ini?");
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
  
        await axios.delete(`https://komdigi-project-backend.vercel.app/api/entries/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Make sure entries is an array before filtering
        if (Array.isArray(entries)) {
          setEntries(prevEntries => prevEntries.filter(entry => entry && entry._id !== id));
        }
        
        // Make sure filteredEntries is an array before filtering
        if (Array.isArray(filteredEntries)) {
          setFilteredEntries(prevFilteredEntries => 
            prevFilteredEntries.filter(entry => entry && entry._id !== id)
          );
        }
        
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Gagal menghapus data: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
      }
    }
  };

  const handleReportClick = () => {
    window.location.href = '/report';
  };

  const handlePeriodChange = (newPeriod) => {
    setBarChartPeriod(newPeriod);
    setPieChartPeriod(newPeriod);
  };

  const getMonthlyData = () => {
    // Ensure entries is an array
    if (!Array.isArray(entries)) {
      return Array(12).fill(0);
    }
    
    const monthlyData = Array(12).fill(0); // Array to hold total guests for each month (0-11)
  
    entries.forEach(entry => {
      if (entry && entry.tanggal) {
        const entryDate = new Date(entry.tanggal);
        const month = entryDate.getMonth(); // Get the month (0-11)
        monthlyData[month] += 1; // Increment the count for the corresponding month
      }
    });
  
    return monthlyData;
  };

  const getLineChartData = () => {
    const monthlyData = getMonthlyData();
    return {
      labels: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      datasets: [
        {
          label: 'Total Tamu per Bulan',
          data: monthlyData,
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
      ],
    };
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Tamu per Bulan',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Helper function to safely count entries by category
  const countEntriesByCategory = (categoryName) => {
    if (!Array.isArray(entries)) return 0;
    return entries.filter(entry => entry && entry.kategori === categoryName).length;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center ">
            <img src={LogoKomdigi} alt="Logo" className="h-10 w-34" />
          </div>
          <div className="flex items-center ">
            <img src={logoKlaten} alt="Logo" className="h-10 w-34" />
          </div>
          <div className="text-sm">
            {userName ? `${userName} (DISKOMINFO)` : 'Loading...'}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        <div className="w-48">
          <div className="flex flex-col gap-2">
            <button className="btn btn-primary btn-outline w-full">data tamu</button>
            <button onClick={handleReportClick} className="btn btn-primary btn-outline w-full">laporan</button>
            <button onClick={handleLogout} className="btn btn-error btn-outline w-full mt-auto">log out</button>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex gap-4 mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Kategori</span>
                </label>
                <select 
                  className="select select-bordered w-full select-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Semua</option>
                  <option value="umum">umum</option>
                  <option value="dinas">dinas</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Show</span>
                </label>
                <select 
                  className="select select-bordered select-sm"
                  value={entriesCount}
                  onChange={(e) => setEntriesCount(e.target.value)}
                >
                  <option value="10">10 entries</option>
                  <option value="25">25 entries</option>
                  <option value="50">50 entries</option>
                </select>
              </div>
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Search</span>
                </label>
                <input
                  type="text"
                  placeholder="Search..."
                  className="input input-bordered w-full input-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4 items-end">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Dari Tanggal</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Hingga</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button onClick={filterEntries} className="btn btn-primary btn-outline btn-sm">Submit</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow ">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Statistik Bar Chart</h2>
                <PeriodDropdown
                  value={barChartPeriod}
                  onChange={handlePeriodChange}
                  className="w-32"
                />
              </div>
              <Bar data={getBarChartData()} options={barChartOptions} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow ">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Statistik Pie Chart</h2>
              </div>
              <Pie data={getPieChartData()} options={pieChartOptions} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Total Tamu per Bulan</h2>
              <Line data={getLineChartData()} options={lineChartOptions} />
            </div>
          </div>
          

          {/* Additional Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Tamu</h3>
              <p className="text-3xl font-bold text-blue-600">
                {Array.isArray(entries) ? entries.length : 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Tamu Umum</h3>
              <p className="text-3xl font-bold text-pink-600">
                {countEntriesByCategory('UMUM')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Tamu Dinas</h3>
              <p className="text-3xl font-bold text-purple-600">
                {countEntriesByCategory('DINAS')}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  {tableHeaders.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredEntries) && filteredEntries.length > 0 ? (
                  filteredEntries.slice(0, parseInt(entriesCount)).map((entry, index) => (
                    <tr key={entry.id || index}>
                      <td>{index + 1}</td>
                      <td>{entry.nama || 'N/A'}</td>
                      <td>{entry.tanggal ? new Date(entry.tanggal).toLocaleString() : 'N/A'}</td>
                      <td>{entry.kategori || 'N/A'}</td>
                      <td>{entry.tujuan || 'N/A'}</td>
                      <td>
                        {entry.tandaTangan ? 
                          <img src={entry.tandaTangan} alt="Tanda Tangan" className='h-10 w-10 object-cover'/> : 
                          'No Image'
                        }
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDelete(entry.id || entry._id)} 
                          className="btn btn-sm btn-danger"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;