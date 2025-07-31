import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    password: '',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando usuários da API...');
      
      // Buscar usuários do backend com autenticação
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Usuários recebidos:', response.data);
      
      let filteredUsers = response.data.users || [];
      
      // Aplicar filtro de busca se existir
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.cpf?.includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Aplicar filtro de status se existir
      if (statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => {
          if (statusFilter === 'active') return user.isActive !== false;
          if (statusFilter === 'inactive') return user.isActive === false;
          return true;
        });
      }
      
      // Simular paginação
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      setUsers(paginatedUsers);
      setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      console.log('🔄 Alterando status do usuário:', { userId, currentStatus });
      
      const token = localStorage.getItem('admin_token');
      
      // Atualizar status via backend
      const response = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
        isActive: !currentStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Atualizar lista local
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ));
      }
      
      await axios.put(`${API_BASE_URL}/users/${userId}`, updatedUser);
      console.log('✅ Status atualizado com sucesso');
      
      fetchUsers();
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      alert('Erro ao alterar status do usuário');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      console.log('👤 Criando novo usuário:', newUserData);
      
      // Validações básicas
      if (!newUserData.name.trim()) {
        alert('Nome é obrigatório');
        return;
      }
      
      if (!newUserData.cpf.trim()) {
        alert('CPF é obrigatório');
        return;
      }
      
      if (!newUserData.password.trim()) {
        alert('Senha é obrigatória');
        return;
      }
      
      const token = localStorage.getItem('admin_token');
      const cleanCPF = newUserData.cpf.replace(/\D/g, '');
      
      // Criar novo usuário via backend
      const response = await axios.post(`${API_BASE_URL}/api/admin/users`, {
        name: newUserData.name.trim(),
        cpf: cleanCPF,
        email: newUserData.email.trim() || null,
        phone: newUserData.phone.trim() || null,
        password: newUserData.password.trim(),
        isActive: newUserData.isActive
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Usuário criado com sucesso');
      
      // Resetar formulário e fechar modal
      setNewUserData({
        name: '',
        cpf: '',
        email: '',
        phone: '',
        password: '',
        isActive: true
      });
      setShowUserModal(false);
      
      // Recarregar lista
      fetchUsers();
      
      alert('Usuário criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    }
  };

  const UserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Criar Novo Usuário</h3>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={newUserData.name}
            onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="CPF"
            value={newUserData.cpf}
            onChange={(e) => setNewUserData({...newUserData, cpf: e.target.value})}
            className="input-field"
            required
          />
          <input
            type="email"
            placeholder="Email (opcional)"
            value={newUserData.email}
            onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
            className="input-field"
          />
          <input
            type="tel"
            placeholder="Telefone (opcional)"
            value={newUserData.phone}
            onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Senha"
            value={newUserData.password}
            onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
            className="input-field"
            required
          />
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={newUserData.isActive}
              onChange={(e) => setNewUserData({...newUserData, isActive: e.target.checked})}
              className="rounded" 
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Conta ativa
            </label>
          </div>
        </form>
        <div className="flex space-x-3 mt-6">
          <button 
            onClick={handleCreateUser}
            className="btn-primary flex-1"
          >
            Criar Usuário
          </button>
          <button
            onClick={() => setShowUserModal(false)}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  const UserDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Detalhes do Usuário</h3>
          <button
            onClick={() => setShowUserDetails(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {selectedUser && (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p className="text-lg font-semibold">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CPF</label>
                <p className="text-lg">{selectedUser.cpf}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{selectedUser.email || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <p className="text-lg">{selectedUser.phone || 'Não informado'}</p>
              </div>
            </div>

            {/* Status */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Status da Conta</h4>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedUser.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.isActive ? 'Ativa' : 'Inativa'}
                </span>
                {selectedUser.isPaymentOverdue && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Pagamento em Atraso
                  </span>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Estatísticas</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {selectedUser.totalDonated?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-blue-600">Total Doado</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedUser.memberSince ? new Date(selectedUser.memberSince).getFullYear() : 'N/A'}
                  </p>
                  <p className="text-sm text-green-600">Membro Desde</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedUser.lastPayment 
                      ? new Date(selectedUser.lastPayment).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </p>
                  <p className="text-sm text-purple-600">Último Pagamento</p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="border-t pt-4 flex space-x-3">
              <button className="btn-primary">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              <button 
                onClick={() => handleToggleStatus(selectedUser.id, selectedUser.isActive)}
                className={selectedUser.isActive ? 'btn-danger' : 'btn-success'}
              >
                {selectedUser.isActive ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Ativar
                  </>
                )}
              </button>
              <button className="btn-secondary">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerenciar membros da Liga do Bem</p>
        </div>
        <button
          onClick={() => setShowUserModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 input-field"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field w-auto"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <button
            onClick={fetchUsers}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Doado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.cpf}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive !== false ? 'Ativo' : 'Inativo'}
                          </span>
                          {user.isPaymentOverdue && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pagamento em Atraso
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {user.totalDonated?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className="text-admin-600 hover:text-admin-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive !== false)}
                          className={user.isActive !== false ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{currentPage}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showUserModal && <UserModal />}
      {showUserDetails && <UserDetailsModal />}
    </div>
  );
};

export default Users;