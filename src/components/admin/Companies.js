import React, { useState, useEffect } from 'react';
import apiService from '../../services/api2';
import EditCompanyModal from './EditCompanyModal';
import { Building, Eye, Check, X, MapPin, Phone, Mail, FileText, Percent, Calendar, Filter, Search, AlertCircle, CheckCircle2, XCircle, Edit, Trash2 } from 'lucide-react';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCompanies();
      if (response.success) {
        setCompanies(response.companies);
        setError('');
      } else {
        setCompanies([]);
        setError(response.message || 'Erro ao carregar empresas');
      }
    } catch (err) {
      setCompanies([]);
      setError('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    if (filter !== 'all' && company.status !== filter) return false;
    const companyName = company.companyName || '';
    const cnpj = company.cnpj || '';
    const email = company.email || '';
    const searchTermLower = searchTerm.toLowerCase();
    return (
      companyName.toLowerCase().includes(searchTermLower) ||
      cnpj.includes(searchTerm) ||
      email.toLowerCase().includes(searchTermLower)
    );
  });

  const handleApprove = async (companyId) => {
    setActionLoading(companyId);
    try {
      const response = await apiService.approveCompany(companyId);
      if (response.success) {
        setCompanies(prev => prev.map(c => c._id === companyId ? response.company : c));
        setShowModal(false);
        setSelectedCompany(null);
      } else {
        setError(response.message || 'Erro ao aprovar empresa');
      }
    } catch (err) {
      setError('Erro ao aprovar empresa no servidor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (companyId) => {
    setActionLoading(companyId);
    try {
      const response = await apiService.rejectCompany(companyId);
      if (response.success) {
        setCompanies(prev => prev.map(c => c._id === companyId ? response.company : c));
        setShowModal(false);
        setSelectedCompany(null);
      } else {
        setError(response.message || 'Erro ao rejeitar empresa');
      }
    } catch (err) {
      setError('Erro ao rejeitar empresa no servidor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowEditModal(true);
    setError('');
  };

  const handleSaveEdit = async (updatedCompany) => {
    setActionLoading('saving');
    try {
      console.log('🔧 [COMPANIES] Salvando empresa:', updatedCompany);
      console.log('🔧 [COMPANIES] ID da empresa:', updatedCompany.id);
      
      const response = await apiService.updateCompany(updatedCompany.id, updatedCompany);
      console.log('🔧 [COMPANIES] Resposta da API:', response);
      
      if (response.success) {
        console.log('✅ [COMPANIES] Empresa atualizada com sucesso');
        setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? response.company : c));
        setShowEditModal(false);
        setEditingCompany(null);
      } else {
        console.error('❌ [COMPANIES] Erro na resposta:', response.message);
        setError(response.message || 'Erro ao editar empresa');
      }
    } catch (err) {
      console.error('❌ [COMPANIES] Erro ao editar empresa:', err);
      setError('Erro ao editar empresa no servidor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCompany(null);
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return;
    setActionLoading(companyId);
    try {
      const response = await apiService.deleteCompany(companyId);
      if (response.success) {
        setCompanies(prev => prev.filter(c => c._id !== companyId));
        setShowModal(false);
        setSelectedCompany(null);
      } else {
        setError(response.message || 'Erro ao excluir empresa');
      }
    } catch (err) {
      setError('Erro ao excluir empresa no servidor');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pendente</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovada</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejeitada</span>;
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const statsData = {
    pending: companies.filter(c => c.status === 'pending').length,
    approved: companies.filter(c => c.status === 'approved').length,
    rejected: companies.filter(c => c.status === 'rejected').length,
    total: companies.length
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas Parceiras</h1>
          <p className="text-gray-600">Gerencie solicitações de parceria empresarial</p>
        </div>
        <button
          onClick={loadCompanies}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Atualizar lista</span>
        </button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-lg p-2"><AlertCircle className="h-5 w-5 text-yellow-600" /></div>
            <div className="ml-3"><p className="text-sm font-medium text-gray-600">Pendentes</p><p className="text-2xl font-bold text-gray-900">{statsData.pending}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-2"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div className="ml-3"><p className="text-sm font-medium text-gray-600">Aprovadas</p><p className="text-2xl font-bold text-gray-900">{statsData.approved}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-lg p-2"><XCircle className="h-5 w-5 text-red-600" /></div>
            <div className="ml-3"><p className="text-sm font-medium text-gray-600">Rejeitadas</p><p className="text-2xl font-bold text-gray-900">{statsData.rejected}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-2"><Building className="h-5 w-5 text-blue-600" /></div>
            <div className="ml-3"><p className="text-sm font-medium text-gray-600">Total</p><p className="text-2xl font-bold text-gray-900">{statsData.total}</p></div>
          </div>
        </div>
      </div>
      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-600 focus:border-transparent">
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovadas</option>
              <option value="rejected">Rejeitadas</option>
              <option value="all">Todas</option>
            </select>
          </div>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Buscar por nome, CNPJ ou email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-admin-600 focus:border-transparent" />
            </div>
          </div>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-md p-4"><div className="flex"><XCircle className="h-5 w-5 text-red-400" /><div className="ml-3"><h3 className="text-sm font-medium text-red-800">Erro</h3><p className="text-sm text-red-700 mt-1">{error}</p></div></div></div>}
      {/* Companies Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-admin-100 rounded-lg p-2"><Building className="h-5 w-5 text-admin-600" /></div>
                      <div className="ml-3"><div className="text-sm font-medium text-gray-900">{company.companyName}</div><div className="text-sm text-gray-500">{company.email}</div></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.cnpj}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><Percent className="h-4 w-4 text-green-500 mr-1" /><span className="text-sm text-gray-900">{company.discount}</span></div></td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(company.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{formatDate(company.createdAt)}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { setSelectedCompany(company); setShowModal(true); }} className="text-admin-600 hover:text-admin-900 p-1 rounded hover:bg-admin-50" title="Ver detalhes"><Eye className="h-4 w-4" /></button>
                      {(company.status === 'pending' || company.status === 'approved') && (
                        <>
                          <button onClick={() => handleEdit(company)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="Editar empresa"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(company.id)} disabled={actionLoading === company.id} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50" title="Excluir empresa">{actionLoading === company.id ? (<div className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>) : (<Trash2 className="h-4 w-4" />)}</button>
                        </>
                      )}
                      {company.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(company.id)} disabled={actionLoading === company.id} className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 disabled:opacity-50" title="Aprovar">{actionLoading === company.id ? (<div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>) : (<Check className="h-4 w-4" />)}</button>
                          <button onClick={() => handleReject(company.id)} disabled={actionLoading === company.id} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50" title="Rejeitar">{actionLoading === company.id ? (<div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>) : (<X className="h-4 w-4" />)}</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12"><Building className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma empresa encontrada</h3><p className="mt-1 text-sm text-gray-500">{filter === 'pending' ? 'Não há empresas pendentes de aprovação.' : filter === 'approved' ? 'Nenhuma empresa foi aprovada ainda.' : filter === 'rejected' ? 'Nenhuma empresa foi rejeitada.' : 'Nenhuma empresa cadastrada.'}</p></div>
          )}
        </div>
      </div>
      {/* Modal de Detalhes */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true"><div className="absolute inset-0 bg-gray-900 opacity-80" onClick={() => setShowModal(false)}></div></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border-2 border-admin-200">
              <div className="bg-gradient-to-br from-white to-gray-50 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start"><div className="bg-admin-100 rounded-lg p-3"><Building className="h-8 w-8 text-admin-600" /></div><div className="mt-3 ml-4 flex-1"><h3 className="text-lg leading-6 font-medium text-gray-900">{selectedCompany.companyName}</h3><div className="mt-2">{getStatusBadge(selectedCompany.status)}</div></div></div>
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">CNPJ</label><p className="mt-1 text-sm text-gray-900">{selectedCompany.cnpj}</p></div>
                    <div><label className="block text-sm font-medium text-gray-700">Telefone</label><div className="flex items-center mt-1"><Phone className="h-4 w-4 text-gray-400 mr-2" /><p className="text-sm text-gray-900">{selectedCompany.phone}</p></div></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700">Email</label><div className="flex items-center mt-1"><Mail className="h-4 w-4 text-gray-400 mr-2" /><p className="text-sm text-gray-900">{selectedCompany.email}</p></div></div>
                  <div><label className="block text-sm font-medium text-gray-700">Endereço</label><div className="flex items-start mt-1"><MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" /><p className="text-sm text-gray-900">{selectedCompany.address}</p></div></div>
                  <div><label className="block text-sm font-medium text-gray-700">Desconto Oferecido</label><div className="flex items-center mt-1"><Percent className="h-4 w-4 text-green-500 mr-2" /><p className="text-sm text-gray-900">{selectedCompany.discount}</p></div></div>
                  {selectedCompany.description && (<div><label className="block text-sm font-medium text-gray-700">Descrição</label><div className="flex items-start mt-1"><FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" /><p className="text-sm text-gray-900">{selectedCompany.description}</p></div></div>)}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Data de Cadastro</label><p className="mt-1 text-sm text-gray-900">{formatDate(selectedCompany.createdAt)}</p></div>
                    {selectedCompany.approvedAt && (<div><label className="block text-sm font-medium text-gray-700">Data de Aprovação</label><p className="mt-1 text-sm text-gray-900">{formatDate(selectedCompany.approvedAt)}</p></div>)}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                {selectedCompany.status === 'pending' && (<><button type="button" onClick={() => handleApprove(selectedCompany.id)} disabled={actionLoading === selectedCompany.id} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">{actionLoading === selectedCompany.id ? (<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>) : (<Check className="h-4 w-4 mr-2" />)}Aprovar</button><button type="button" onClick={() => handleReject(selectedCompany.id)} disabled={actionLoading === selectedCompany.id} className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">{actionLoading === selectedCompany.id ? (<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>) : (<X className="h-4 w-4 mr-2" />)}Rejeitar</button></>)}
                {selectedCompany.status === 'approved' && (<><button type="button" onClick={() => handleEdit(selectedCompany)} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"><Edit className="h-4 w-4 mr-2" />Editar</button><button type="button" onClick={() => handleDelete(selectedCompany.id)} disabled={actionLoading === selectedCompany.id} className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">{actionLoading === selectedCompany.id ? (<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>) : (<Trash2 className="h-4 w-4 mr-2" />)}Excluir</button></>)}
                <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-500 sm:mt-0 sm:w-auto sm:text-sm">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <EditCompanyModal company={editingCompany} isOpen={showEditModal} onClose={handleCloseEditModal} onSave={handleSaveEdit} isLoading={actionLoading === 'saving'} />
    </div>
  );
};

export default Companies;
