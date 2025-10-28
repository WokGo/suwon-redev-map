import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import AdminPage2 from './pages/AdminPage2';
import RowAdminPage from './pages/RowAdminPage';  // 새로운 페이지를 추가
import './css/App.css'

const resolveBasename = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return '/admin';
  }
  return '/';
};

const App = () => {
  const basename = resolveBasename();

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="dashboard" element={<AdminPage />} />
        <Route path="dashboard2" element={<AdminPage2 />} />
        <Route path="rowadmin" element={<RowAdminPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
};

export default App;
