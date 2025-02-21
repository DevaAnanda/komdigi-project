import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // Jika pengguna sudah terautentikasi dan mencoba mengakses halaman login, arahkan ke admin
  if (isAuthenticated && window.location.pathname === '/login') {
    return <Navigate to="/admin" replace />;
  }

  // Jika tidak terautentikasi, arahkan ke halaman login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Menambahkan validasi untuk props
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;