import React, { useState, useEffect } from 'react';
import { X, Check, Edit, Upload, Clock, Image } from 'lucide-react';

const EditCompanyModal = ({ company, isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    discount: '',
    description: '',
    logo: '',
    workingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '14:00', closed: false },
      sunday: { open: '08:00', close: '12:00', closed: true }
    }
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const [logoPreview, setLogoPreview] = useState(null);

  // Inicializar dados quando o modal abrir
  useEffect(() => {
    if (isOpen && company) {
      console.log('🔧 [MODAL] Inicializando dados:', company);
      setFormData({
        companyName: company.companyName || '',
        cnpj: company.cnpj || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        discount: company.discount || '',
        description: company.description || '',
        logo: company.logo || '',
        workingHours: company.workingHours || {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '08:00', close: '14:00', closed: false },
          sunday: { open: '08:00', close: '12:00', closed: true }
        }
      });
      
      // Configurar preview do logo se existir
      if (company.logo) {
        setLogoPreview(company.logo);
      }
    }
  }, [isOpen, company]);

  const handleInputChange = (field, value) => {
    console.log(`🔧 [MODAL] Alterando ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkingHoursChange = (day, field, value) => {
    console.log(`🕒 [MODAL] Alterando horário ${day}.${field}:`, value);
    setFormData(prev => ({
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

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('❌ Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Verificar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ O arquivo deve ter no máximo 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoDataUrl = e.target.result;
        setLogoPreview(logoDataUrl);
        handleInputChange('logo', logoDataUrl);
        console.log('📸 [MODAL] Logo carregado com sucesso');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    handleInputChange('logo', '');
    console.log('🗑️ [MODAL] Logo removido');
  };

  const handleSave = () => {
    console.log('💾 [MODAL] Salvando alterações:', formData);
    const updatedCompany = {
      ...company,
      // Mapear campos do frontend para o backend
      company_name: formData.companyName,
      cnpj: formData.cnpj,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      discount: formData.discount,
      description: formData.description,
      working_hours: formData.workingHours,
      updatedAt: new Date().toISOString()
    };
    console.log('💾 [MODAL] Dados mapeados para backend:', updatedCompany);
    onSave(updatedCompany);
  };

  const handleClose = () => {
    console.log('🔧 [MODAL] Fechando modal');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900 opacity-80" onClick={handleClose}></div>
        </div>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border-2 border-blue-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-br from-white to-blue-50 px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Edit className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Editar Empresa - Versão 2.0.0
                  </h3>
                  <p className="text-sm text-gray-500">
                    Atualize dados básicos, logo e horários de funcionamento
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Abas de Navegação */}
            <div className="mt-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'basic'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📋 Dados Básicos
                  </button>
                  <button
                    onClick={() => setActiveTab('logo')}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'logo'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🖼️ Logo da Empresa
                  </button>
                  <button
                    onClick={() => setActiveTab('hours')}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'hours'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🕒 Horários de Funcionamento
                  </button>
                </nav>
              </div>
            </div>

            {/* Conteúdo das Abas */}
            <div className="mt-6">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desconto Oferecido
                </label>
                <input
                  type="text"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 10% em rações premium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva os produtos e serviços oferecidos..."
                />
              </div>
                </div>
              )}

              {activeTab === 'logo' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                      {logoPreview ? (
                        <div className="space-y-4">
                          <img
                            src={logoPreview}
                            alt="Logo Preview"
                            className="mx-auto h-32 w-32 object-contain rounded-lg shadow-md"
                          />
                          <button
                            onClick={removeLogo}
                            className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remover Logo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Image className="mx-auto h-12 w-12 text-gray-400" />
                          <div>
                            <label className="cursor-pointer">
                              <span className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <Upload className="h-4 w-4 mr-2" />
                                Fazer Upload do Logo
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                              />
                            </label>
                          </div>
                          <p className="text-sm text-gray-500">
                            PNG, JPG ou GIF até 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hours' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-blue-900">
                        Configure os horários de funcionamento da empresa
                      </h4>
                    </div>
                  </div>
                  
                  {Object.entries(formData.workingHours).map(([day, hours]) => {
                    const dayNames = {
                      monday: 'Segunda-feira',
                      tuesday: 'Terça-feira',
                      wednesday: 'Quarta-feira',
                      thursday: 'Quinta-feira',
                      friday: 'Sexta-feira',
                      saturday: 'Sábado',
                      sunday: 'Domingo'
                    };
                    
                    return (
                      <div key={day} className="flex items-center space-x-4 py-3 border-b border-gray-200">
                        <div className="w-32">
                          <span className="text-sm font-medium text-gray-700">
                            {dayNames[day]}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => handleWorkingHoursChange(day, 'closed', !e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600">Aberto</span>
                        </div>
                        
                        {!hours.closed && (
                          <>
                            <div>
                              <label className="text-xs text-gray-500">Abertura</label>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                                className="block w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="text-xs text-gray-500">Fechamento</label>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                                className="block w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </>
                        )}
                        
                        {hours.closed && (
                          <span className="text-sm text-red-600 font-medium">Fechado</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </button>
            
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyModal;