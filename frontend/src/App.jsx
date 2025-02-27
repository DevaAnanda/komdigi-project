import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FormPembukuan from './pages/Form';
import Admin from './pages/Admin';
import ReportPage from "./pages/ReportPage";
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import PrivateRoute from './utils/PrivateRoute';
import Terimakasih from './pages/EndSelamat';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<FormPembukuan />} /> {/* Halaman utama client */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/trimakasih" element={<Terimakasih />} />
        
        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route path="/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;