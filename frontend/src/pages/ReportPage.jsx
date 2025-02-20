import { useState, useEffect } from 'react';
import axios from 'axios';
import LogoKomdigi from '../assets/logoKomdigiKlaten.png';
import logoKlaten from '../assets/logoKlaten-removebg-preview (2).png';
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportPage = () => {
  const [entries, setEntries] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [userName, setUserName] = useState('');
  
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
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('/api/entries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleDownloadPDF = () => {
    let filteredData = entries;
  
    // Apply filters
    if (category) {
      filteredData = filteredData.filter(entry => entry.kategori.toLowerCase() === category.toLowerCase());
    }
    if (startDate) {
      filteredData = filteredData.filter(entry => new Date(entry.tanggal) >= new Date(startDate));
    }
    if (endDate) {
      filteredData = filteredData.filter(entry => new Date(entry.tanggal) <= new Date(endDate));
    }
  
    const doc = new jsPDF();
  
    // Pastikan gambar tanda tangan dimuat terlebih dahulu
    const signaturePromises = filteredData.map((entry, index) => {
      return new Promise((resolve) => {
        if (entry.tandaTangan) {
          const img = new Image();
          img.src = entry.tandaTangan;
          img.onload = () => {
            entry.signatureImg = img;
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load signature image for entry ${index}`);
            resolve();
          };
        } else {
          resolve();
        }
      });
    });
  
    Promise.all(signaturePromises).then(() => {
      // Add title
      doc.setFontSize(16);
      doc.text('LAPORAN BUKU TAMU', 105, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text('DISKOMINFO KABUPATEN KLATEN', 105, 25, { align: 'center' });
  
      // Add filter info
      doc.setFontSize(10);
      doc.text(`Periode: ${startDate || 'Semua'} s/d ${endDate || 'Semua'}`, 14, 35);
      doc.text(`Kategori: ${category || 'Semua'}`, 14, 42);
  
      // Create table
      const tableColumn = ['No', 'Nama', 'Tanggal', 'Kategori', 'Tujuan', 'Instansi', 'Tanda Tangan'];
      const tableRows = filteredData.map((entry, index) => [
        index + 1,
        entry.nama,
        new Date(entry.tanggal).toLocaleString('id-ID', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        entry.kategori,
        entry.tujuan,
        entry.instansi,
        '' // Kolom tanda tangan akan diisi dengan gambar nanti
      ]);
  
      // Konfigurasi tambahan untuk tabel
      const tableConfig = {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          minCellHeight: 25,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 10 }, // No
          1: { cellWidth: 30 }, // Nama
          2: { cellWidth: 30 }, // Tanggal
          3: { cellWidth: 20 }, // Kategori
          4: { cellWidth: 30 }, // Tujuan
          5: { cellWidth: 30 }, // Instansi
          6: { cellWidth: 40 }  // Tanda tangan
        },
        didDrawCell: (data) => {
          // Hanya menambahkan gambar jika ini adalah kolom tanda tangan dan bukan header
          if (data.column.index === 6 && data.section === 'body') {
            const entry = filteredData[data.row.index];
            if (entry?.tandaTangan) {
              // Menghitung posisi tengah sel
              const cellWidth = data.cell.width;
              const cellHeight = data.cell.height;
              const imgWidth = 25; // Lebar gambar tanda tangan
              const imgHeight = 15; // Tinggi gambar tanda tangan
              
              // Menghitung posisi x dan y untuk menempatkan gambar di tengah sel
              const x = data.cell.x + (cellWidth - imgWidth) / 2;
              const y = data.cell.y + (cellHeight - imgHeight) / 2;
  
              try {
                doc.addImage(
                  entry.tandaTangan,
                  'PNG',
                  x,
                  y,
                  imgWidth,
                  imgHeight,
                  `sign-${data.row.index}`,
                  'FAST'
                );
              } catch (error) {
                console.error('Error adding signature:', error, entry.tandaTangan);
              }
            }
          }
        }
      };
      
      doc.autoTable(tableConfig);
  
      // Save PDF
      const date = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
      doc.save(`laporan-buku-tamu-${date}.pdf`);
    });
  };
  
  const handleDownload = async () => {
    let filteredData = entries;
  
    // Apply filters
    if (category) {
      filteredData = filteredData.filter(entry => entry.kategori.toLowerCase() === category.toLowerCase());
    }
    if (startDate) {
      filteredData = filteredData.filter(entry => new Date(entry.tanggal) >= new Date(startDate));
    }
    if (endDate) {
      filteredData = filteredData.filter(entry => new Date(entry.tanggal) <= new Date(endDate));
    }
  
    // Create a new workbook and a new worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Tamu');
  
    // Add headers
    worksheet.addRow(['Nama', 'Tanggal', 'Kategori', 'Tujuan', 'Instansi', 'Tanda Tangan']);
  
    // Add data to the worksheet
    for (const entry of filteredData) {
      const row = [
        entry.nama,
        new Date(entry.tanggal).toLocaleString(),
        entry.kategori,
        entry.tujuan,
        entry.instansi,
      ];
      const newRow = worksheet.addRow(row);
  
      // Add image if available
      if (entry.tandaTangan) {
        // Check if tandaTangan is a URL or base64
        const isBase64 = entry.tandaTangan.startsWith('data:image/');
        const imageId = workbook.addImage({
          filename: isBase64 ? undefined : entry.tandaTangan, // Use filename if it's a URL
          base64: isBase64 ? entry.tandaTangan.split(',')[1] : undefined, // Use base64 if it's a base64 string
          extension: 'png',
        });
        worksheet.addImage(imageId, {
          tl: { col: 5, row: newRow.number - 1 }, // Menempatkan gambar di kolom ke-6 (index 5)
          ext: { width: 50, height: 50 }, // Ukuran gambar
        });
      }
    }
  
    // Generate the Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `laporan-tamu-${new Date().toLocaleDateString()}.xlsx`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleBack = () => {
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img src={LogoKomdigi} alt="Logo" className="h-10 w-34" />
          </div>
          <div className="flex items-center">
            <img src={logoKlaten} alt="Logo" className="h-10 w-34" />
          </div>
          <div className="text-sm">
            {userName ? `${userName} (DISKOMINFO)` : 'Loading...'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Download Laporan</h2>
            <button onClick={handleBack} className="btn btn-outline btn-primary btn-sm">
              Kembali
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Kategori</span>
              </label>
              <select 
                className="select select-bordered"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                <option value="umum">Umum</option>
                <option value="dinas">Dinas</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Dari Tanggal</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Sampai Tanggal</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4"> {/* Container Flexbox dengan gap 4 unit (vertikal) */}
    <button 
        onClick={handleDownload}
        className="btn btn-primary w-full"
    >
        Download Laporan EXCEL
    </button>
    <button 
        onClick={handleDownloadPDF}
        className="btn btn-primary w-full"
    >
        Download Laporan PDF
    </button>
</div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;

