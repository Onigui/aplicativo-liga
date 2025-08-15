import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import AdminApp from './AdminApp';

const AppRouter = () => {
  // Estados compartilhados entre App e AdminApp
  const [companyRequests, setCompanyRequests] = useState([]);

  // Funções para gerenciar solicitações
  const handleApproveCompanyRequest = async (request) => {
    try {
      console.log('✅ [ROUTER] Aprovando solicitação:', request);
      
      // Atualizar status da solicitação
      setCompanyRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'approved', approvedDate: new Date().toISOString() }
            : req
        )
      );
      
      // Aqui você pode adicionar a lógica para salvar no banco online
      console.log('✅ [ROUTER] Solicitação aprovada com sucesso');
      
    } catch (error) {
      console.error('❌ [ROUTER] Erro ao aprovar solicitação:', error);
    }
  };

  const handleRejectCompanyRequest = async (request) => {
    try {
      console.log('❌ [ROUTER] Rejeitando solicitação:', request);
      
      // Atualizar status da solicitação
      setCompanyRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'rejected', rejectedDate: new Date().toISOString() }
            : req
        )
      );
      
      console.log('✅ [ROUTER] Solicitação rejeitada com sucesso');
      
    } catch (error) {
      console.error('❌ [ROUTER] Erro ao rejeitar solicitação:', error);
    }
  };

  return (
    <Router>
      <Routes>
        {/* Rota admin - App administrativo */}
        <Route path="/admin/*" element={
          <AdminApp 
            companyRequests={companyRequests}
            onApproveCompanyRequest={handleApproveCompanyRequest}
            onRejectCompanyRequest={handleRejectCompanyRequest}
          />
        } />
        {/* Rota principal - App público */}
        <Route path="/*" element={
          <App 
            companyRequests={companyRequests}
            setCompanyRequests={setCompanyRequests}
          />
        } />
        {/* Redirect para home se rota não encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;