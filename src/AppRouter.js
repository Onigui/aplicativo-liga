import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import AdminApp from './AdminApp';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rota admin - App administrativo */}
        <Route path="/admin/*" element={<AdminApp />} />
        {/* Rota principal - App público */}
        <Route path="/*" element={<App />} />
        {/* Redirect para home se rota não encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;