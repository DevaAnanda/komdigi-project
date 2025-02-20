import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null); // State untuk menyimpan error
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    try {
      // Kirim data ke backend
      const response = await axios.post('http://localhost:5000/api/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Jika registrasi berhasil, arahkan ke halaman login
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (error) {
      // Tangani error dari server
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError("Terjadi kesalahan saat registrasi");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null); // Reset error saat input berubah
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center bg-center" style={{
        backgroundImage: "url(https://static.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/222/2024/07/30/WhatsApp-Image-2024-07-29-at-231057-2532557899.jpeg)",
      }}>
      <div className="card w-96 backdrop-blur-md shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center mb-4">Register</h2>
          {error && <p className="text-red-500">{error}</p>} {/* Tampilkan error jika ada */}
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nama</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Nama Lengkap"
                className="input input-bordered"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                className="input input-bordered"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="********"
                className="input input-bordered"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Konfirmasi Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="********"
                className="input input-bordered"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary">Register</button> 
            </div>
          </form>
          <p className="text-center mt-4">
            Sudah punya akun?{' '}
            <a href="/login" className="text-primary">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;