import React from 'react';

const UserModal = ({ 
  newUserData, 
  setNewUserData, 
  handleCreateUser, 
  setShowUserModal 
}) => {
  const handleInputChange = (field, value) => {
    setNewUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Criar Novo Usuário</h3>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={newUserData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="input-field"
            required
          />
          <input
            type="text"
            placeholder="CPF"
            value={newUserData.cpf}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            className="input-field"
            required
          />
          <input
            type="email"
            placeholder="Email (opcional)"
            value={newUserData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="input-field"
          />
          <input
            type="tel"
            placeholder="Telefone (opcional)"
            value={newUserData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Senha"
            value={newUserData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="input-field"
            required
          />
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={newUserData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
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
};

export default UserModal; 