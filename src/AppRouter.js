import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import AdminApp from './AdminApp';
import apiService from './services/api2';

const AppRouter = () => {
  // Estados compartilhados entre App e AdminApp
  const [companyRequests, setCompanyRequests] = useState([]);
  const [sharedRegisteredCompanies, setSharedRegisteredCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  // Carregar empresas aprovadas quando o aplicativo inicia
  useEffect(() => {
    const loadApprovedCompanies = async () => {
      try {
        console.log('🔄 [ROUTER] Carregando empresas aprovadas...');
        setIsLoadingCompanies(true);
        
        const result = await apiService.getCompanies('approved');
        if (result.success && result.companies) {
          console.log('✅ [ROUTER] Empresas aprovadas carregadas:', result.companies.length);
          setSharedRegisteredCompanies(result.companies);
        } else {
          console.log('⚠️ [ROUTER] Nenhuma empresa aprovada encontrada ou erro na API');
          setSharedRegisteredCompanies([]);
        }
      } catch (error) {
        console.error('❌ [ROUTER] Erro ao carregar empresas aprovadas:', error);
        setSharedRegisteredCompanies([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    loadApprovedCompanies();
  }, []);

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
      
      // Atualizar a senha da empresa no banco (importante para login)
      if (request.password) {
        console.log('🔐 [ROUTER] Atualizando senha da empresa no banco...');
        const passwordUpdateResult = await apiService.updateCompanyPassword(apiResult.company.id, request.password);
        if (!passwordUpdateResult.success) {
          console.warn('⚠️ [ROUTER] Aviso: Não foi possível atualizar a senha da empresa:', passwordUpdateResult.message);
        } else {
          console.log('✅ [ROUTER] Senha da empresa atualizada com sucesso');
        }
      }
      
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
            isLoadingCompanies={isLoadingCompanies}
          />
        } />
        {/* Redirect para home se rota não encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;