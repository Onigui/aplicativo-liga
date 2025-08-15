import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import AdminApp from './AdminApp';
import apiService from './services/api2';

const AppRouter = () => {
  // Estados compartilhados entre App e AdminApp
  const [companyRequests, setCompanyRequests] = useState([]);
  const [sharedRegisteredCompanies, setSharedRegisteredCompanies] = useState([]);

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
      
      // Criar empresa no banco online
      console.log('🌐 [ROUTER] Criando empresa no banco online...');
      const companyData = {
        ...request,
        status: 'approved',
        approvedDate: new Date().toISOString(),
        approvedBy: 'admin'
      };
      
      const apiResult = await apiService.createCompany(companyData);
      if (!apiResult.success) {
        throw new Error(apiResult.message || 'Erro ao cadastrar empresa no banco online');
      }
      
      console.log('✅ [ROUTER] Empresa criada no banco online:', apiResult.company);
      
      // Adicionar à lista de empresas aprovadas
      const approvedCompany = {
        ...request,
        id: apiResult.company.id,
        status: 'approved',
        approvedDate: new Date().toISOString()
      };
      
      setSharedRegisteredCompanies(prev => [...prev, approvedCompany]);
      console.log('✅ [ROUTER] Empresa adicionada ao estado compartilhado');
      
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
            sharedRegisteredCompanies={sharedRegisteredCompanies}
            setSharedRegisteredCompanies={setSharedRegisteredCompanies}
          />
        } />
        {/* Redirect para home se rota não encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;