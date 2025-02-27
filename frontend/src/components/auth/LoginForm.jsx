import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://komdigi-project-backend.vercel.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center bg-center" style={{
        backgroundImage: "url(https://static.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/222/2024/07/30/WhatsApp-Image-2024-07-29-at-231057-2532557899.jpeg)",
      }}>
      <div className="card w-96 backdrop-blur-md shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center mb-4 text-white">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text text-white">Password</span>
              </label>
              <input
                type="password"
                placeholder="********"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary btn-outline">Login</button>
            </div>
          </form>
          <h2 className="text-center mt-4 text-white">
            Belum punya akun?{' '}
            <a href="/register" className="text-primary">
              Register
            </a>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;