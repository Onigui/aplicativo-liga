import React, { useState } from 'react';
import { 
  Building, 
  Settings, 
  QrCode, 
  Clock, 
  Percent, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Save, 
  X,
  Camera,
  Check,
  AlertTriangle,
  User,
  Calendar,
  Shield
} from 'lucide-react';

const CompanyDashboard = ({ company, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState(company);
  const [showQRValidator, setShowQRValidator] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      console.log('Dados da empresa salvos:', companyData);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCompanyData(company);
    setIsEditing(false);
  };

  const updateWorkingHours = (day, field, value) => {
    setCompanyData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Validações Hoje</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Desconto Atual</p>
              <p className="text-2xl font-bold text-gray-900">{companyData.discount}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Percent className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-bold text-green-600">Ativo</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Informações da empresa */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Informações da Empresa</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
            >
              <Edit className="h-4 w-4" />
              <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{companyData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
              <p className="text-gray-900 font-mono">{companyData.cnpj}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{companyData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{companyData.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.address}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{companyData.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cidade/Estado</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={companyData.city}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={companyData.state}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Estado"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <p className="text-gray-900">{companyData.city}, {companyData.state}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Configurações de desconto */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Configurações de Desconto</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Desconto oferecido:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={companyData.discount}
              onChange={(e) => setCompanyData(prev => ({ ...prev, discount: parseInt(e.target.value) }))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-600">%</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Este desconto será aplicado automaticamente para clientes com carteirinha válida.
          </p>
        </div>
      </div>

      {/* Horários de funcionamento */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Horários de Funcionamento</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(companyData.workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {day === 'monday' ? 'Segunda' :
                     day === 'tuesday' ? 'Terça' :
                     day === 'wednesday' ? 'Quarta' :
                     day === 'thursday' ? 'Quinta' :
                     day === 'friday' ? 'Sexta' :
                     day === 'saturday' ? 'Sábado' : 'Domingo'}
                  </span>
                </div>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hours.isOpen}
                    onChange={(e) => updateWorkingHours(day, 'isOpen', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Aberto</span>
                </label>

                {hours.isOpen && (
                  <>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => updateWorkingHours(day, 'open', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-600">às</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => updateWorkingHours(day, 'close', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderQRValidator = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Validador de QR Code</h3>
          <p className="text-sm text-gray-600 mt-1">
            Use a câmera para escanear o QR code da carteirinha do cliente
          </p>
        </div>
        <div className="p-6">
          <div className="text-center">
            <div className="w-64 h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-6">
              <div className="text-center">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Área da câmera</p>
                <p className="text-sm text-gray-500">Posicione o QR code aqui</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowQRValidator(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <QrCode className="h-5 w-5" />
                <span>Iniciar Validação</span>
              </button>
              
              <p className="text-sm text-gray-600">
                Clique no botão acima para abrir o validador de QR code
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de validações */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Histórico de Validações</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Validação exemplo */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">João Silva</p>
                  <p className="text-sm text-gray-600">CPF: 123.456.789-00</p>
                  <p className="text-xs text-gray-500">Hoje às 14:30</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  VÁLIDA
                </span>
                <p className="text-sm text-gray-600 mt-1">15% desconto</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Maria Santos</p>
                  <p className="text-sm text-gray-600">CPF: 987.654.321-00</p>
                  <p className="text-xs text-gray-500">Ontem às 16:45</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  INVÁLIDA
                </span>
                <p className="text-sm text-gray-600 mt-1">Assinatura expirada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Área Empresarial</h1>
                <p className="text-sm text-gray-600">{companyData.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Visão Geral', icon: Building },
              { id: 'settings', name: 'Configurações', icon: Settings },
              { id: 'qr-validator', name: 'Validador QR', icon: QrCode }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'qr-validator' && renderQRValidator()}
      </div>

      {/* QR Code Validator Modal */}
      {showQRValidator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Validador de QR Code</h2>
                  <p className="text-gray-600">
                    {companyData.name} - Liga do Bem
                  </p>
                </div>
                <button
                  onClick={() => setShowQRValidator(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-64 h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-gray-600">
                  Posicione o QR Code da carteirinha do cliente na área acima
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    // Simular validação
                    alert('Funcionalidade de câmera será implementada em produção');
                    setShowQRValidator(false);
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Ativar Câmera</span>
                </button>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ou digite manualmente os dados do QR Code..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Validar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard; 