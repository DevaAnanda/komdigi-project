import logo from "../assets/logoKomdigiKlaten.png";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Form = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: "", 
    instansi: "",
    tanggal: "",
    tujuan: "",
    kategori: "UMUM",
    tandaTangan: "",
  });

  // Setup canvas when modal opens
  useEffect(() => {
    if (showSignatureModal && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Atur ukuran canvas
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      canvas.style.width = `${canvas.offsetWidth}px`;
      canvas.style.height = `${canvas.offsetHeight}px`;

      // Atur properti menggambar
      context.scale(2, 2);
      context.lineCap = "round";
      context.strokeStyle = "black";
      context.lineWidth = 2;

      contextRef.current = context;
    }
  }, [showSignatureModal]);
  
  // Fungsi memulai menggambar
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // For touch devices
  const startDrawingTouch = (e) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.touches[0].clientX - rect.left;
    const offsetY = e.touches[0].clientY - rect.top;
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };
  
  // Fungsi menggambar
  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  // For touch devices
  const drawTouch = (e) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.touches[0].clientX - rect.left;
    const offsetY = e.touches[0].clientY - rect.top;
    
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };
  
  // Fungsi berhenti menggambar
  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };
  
  // Fungsi untuk membersihkan canvas
  const clearCanvas = () => {
    if (!canvasRef.current || !contextRef.current) return;
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  // Simpan tanda tangan dan tutup modal
  const saveSignature = () => {
    if (!canvasRef.current) return;
    const canvasData = canvasRef.current.toDataURL("image/png");
    setFormData({ ...formData, tandaTangan: canvasData });
    setShowSignatureModal(false);
  };

  // Buka modal tanda tangan
  const openSignatureModal = () => {
    setShowSignatureModal(true);
  };
  
  // Fungsi menangani perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const navigate = useNavigate();

  // Fungsi untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data:', formData); // Log data yang akan dikirim
    try {
      const response = await axios.post('https://komdigi-project.vercel.app/api/register-guest', formData);
      console.log(response.data);
      navigate('/trimakasih');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showSignatureModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showSignatureModal]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-center" style={{
      backgroundImage: "url(https://static.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/222/2024/07/30/WhatsApp-Image-2024-07-29-at-231057-2532557899.jpeg)",
    }}>
      <div className="backdrop-blur-sm w-full max-w-md p-6 shadow-2xl rounded-lg">
        <div className="flex flex-col items-center">
          <a href="/login">
            <img src={logo} alt="Logo Diskominfo" className="h-16 mb-4" />
          </a>
          <h1 className="text-xl font-bold text-center text-white">BUKU TAMU DIGITAL</h1>
        </div>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="form-control mb-4">
            <label className="label-text text-white font-medium">Nama</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Masukkan nama"
              className="input input-bordered input-netura"
            />
          </div>
          <div className="form-control mb-4">
            <label className="label-text text-white font-medium">Instansi</label>
            <input
              type="text"
              name="instansi"
              value={formData.instansi}
              onChange={handleChange}
              placeholder="Masukkan instansi"
              className="input input-bordered input-netural"
            />
          </div>
          <div className="form-control mb-4">
            <label className="label-text text-white font-medium">Hari & Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              className="input input-bordered"
            />
          </div>
          <div className="form-control mb-4">
            <label className="label-text text-white font-medium">Maksud & Tujuan</label>
            <textarea
              name="tujuan"
              value={formData.tujuan}
              onChange={handleChange}
              placeholder="Masukkan maksud & tujuan"
              className="textarea textarea-bordered textarea-netural"
            ></textarea>
          </div>
          <div className="form-control mb-4">
            <div className="label">
              <span className="label-text text-white font-medium">
                Kategori
              </span>
            </div>
            <select name="kategori" value={formData.kategori} onChange={handleChange} className="select select-bordered select-netural">
              <option>UMUM</option>
              <option>DINAS</option>
            </select>
          </div>
          <div className="form-control mb-4">
            <label className="label font-medium text-white">Tanda Tangan</label>
            <div 
              onClick={openSignatureModal} 
              className="border border-gray-400 h-32 rounded-lg bg-white flex items-center justify-center cursor-pointer"
            >
              {formData.tandaTangan ? (
                <img src={formData.tandaTangan} alt="Tanda Tangan" className="max-h-full max-w-full" />
              ) : (
                <p className="text-gray-500">Klik untuk menambahkan tanda tangan</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="border border-white text-white bg-transparent hover:bg-gray-800 hover:text-white transition duration-300 ease-in-out py-2 px-4 rounded"
            >
              Kirim
            </button>
          </div>
        </form>

        {/* Modal Tanda Tangan */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-11/12 max-w-md">
              <h2 className="text-lg font-bold mb-2">Tanda Tangan</h2>
              <div className="border border-gray-400 h-64 mb-4">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawingTouch}
                  onTouchMove={drawTouch}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full touch-none"
                />
              </div>
              <div className="flex justify-between">
                <button 
                  onClick={clearCanvas} 
                  className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded"
                >
                  Reset
                </button>
                <div>
                  <button 
                    onClick={() => setShowSignatureModal(false)} 
                    className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded mr-2"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={saveSignature} 
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;