import LogoKomdigi from '../assets/logoKomdigiKlaten.png';
import logoKlaten from '../assets/logoKlaten-removebg-preview (2).png';
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesCount, setEntriesCount] = useState(10);
  const [userName, setUserName] = useState('');

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUserName(response.data.name);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get('/api/entries', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
  
        setEntries(response.data);
        setFilteredEntries(response.data);
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    };
  
    fetchEntries();
  }, []);
  

  const filterEntries = () => {
    let filtered = entries;

    if (category) {
      filtered = filtered.filter(entry => entry.kategori.toLowerCase() === category.toLowerCase());
    }

    if (startDate) {
      filtered = filtered.filter(entry => new Date(entry.tanggal) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(entry => new Date(entry.tanggal) <= new Date(endDate));
    }

    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tujuan.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  };

  // Fungsi untuk menghapus entri
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus entri ini?");
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
  
        await axios.delete(`/api/entries/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Update the state only after successful deletion
        setEntries(prevEntries => prevEntries.filter(entry => entry._id !== id));
        setFilteredEntries(prevFilteredEntries => prevFilteredEntries.filter(entry => entry._id !== id));
        
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Gagal menghapus data: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
      }
    }
  };

  const handleReportClick = () => {
    window.location.href = '/report';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-48">
          <div className="flex flex-col gap-2">
            <button className="btn btn-primary btn-outline w-full">data tamu</button>
            <button onClick={handleReportClick} className="btn btn-primary btn-outline w-full">laporan</button>
            <button onClick={handleLogout} className="btn btn-error btn-outline w-full mt-auto">log out</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Filter Controls */}
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

          {/* Table */}
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
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry, index) => (
                    <tr key={entry._id}>
                      <td>{index + 1}</td>
                      <td>{entry.nama}</td>
                      <td>{new Date(entry.tanggal).toLocaleString()}</td>
                      <td>{entry.kategori}</td>
                      <td>{entry.tujuan}</td>
                      <td><img src={entry.tandaTangan} alt="Tanda Tangan" className='h-10 w-10 object-cover'/></td>
                      <td>
                        <button onClick={() => handleDelete(entry._id)} className="btn btn-sm btn-danger">Hapus</button>
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