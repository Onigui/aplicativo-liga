import React, { useRef, useEffect } from 'react';
import { X, Check, Edit } from 'lucide-react';

const SimpleEditModal = ({ company, isOpen, onClose, onSave, isLoading }) => {
  const formRef = useRef(null);

  useEffect(() => {
    if (isOpen && company && formRef.current) {
      // Preencher os campos diretamente via DOM
      const form = formRef.current;
      form.querySelector('#companyName').value = company.companyName || '';
      form.querySelector('#cnpj').value = company.cnpj || '';
      form.querySelector('#address').value = company.address || '';
      form.querySelector('#phone').value = company.phone || '';
      form.querySelector('#email').value = company.email || '';
      form.querySelector('#discount').value = company.discount || '';
      form.querySelector('#description').value = company.description || '';
    }
  }, [isOpen, company]);

  const handleSave = () => {
    if (!formRef.current) return;

    const form = formRef.current;
    const updatedCompany = {
      ...company,
      companyName: form.querySelector('#companyName').value,
      cnpj: form.querySelector('#cnpj').value,
      address: form.querySelector('#address').value,
      phone: form.querySelector('#phone').value,
      email: form.querySelector('#email').value,
      discount: form.querySelector('#discount').value,
      description: form.querySelector('#description').value,
      updatedAt: new Date().toISOString()
    };

    console.log('💾 [SIMPLE-MODAL] Salvando:', updatedCompany);
    onSave(updatedCompany);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="bg-white rounded-lg shadow-2xl max-w-4xl w-full border-2 border-blue-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-br from-white to-blue-50 px-6 pt-6 pb-4">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Edit className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Editar Empresa
                  </h3>
                  <p className="text-sm text-gray-500">
                    Atualize as informações da empresa
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form ref={formRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  id="companyName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  id="cnpj"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  id="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                  Desconto Oferecido
                </label>
                <input
                  type="text"
                  id="discount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 10% em rações premium"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva os produtos e serviços oferecidos..."
                />
              </div>
            </form>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-100 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center font-bold shadow-lg border-2 border-green-800"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEditModal;