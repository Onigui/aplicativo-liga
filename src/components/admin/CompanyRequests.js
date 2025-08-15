import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Eye,
  AlertCircle
} from 'lucide-react';

const CompanyRequests = ({ companyRequests, onApprove, onReject, onUpdateRequests }) => {
  console.log('🔍 [CompanyRequests] Props recebidas:', { companyRequests, onApprove, onReject });
  console.log('🔍 [CompanyRequests] companyRequests:', companyRequests);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleApprove = async (request) => {
    try {
      await onApprove(request);
      setShowDetails(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Erro ao aprovar empresa:', error);
    }
  };

  const handleReject = async (request) => {
    try {
      await onReject(request);
      setShowDetails(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Erro ao rejeitar empresa:', error);
    }
  };

  const openDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const pendingRequests = companyRequests.filter(req => req.status === 'pending');
  const approvedRequests = companyRequests.filter(req => req.status === 'approved');
  const rejectedRequests = companyRequests.filter(req => req.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Solicitações de Empresas</h2>
            <p className="text-gray-600">Gerencie as solicitações de cadastro de empresas</p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingRequests.length}</div>
              <div className="text-sm text-gray-500">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
              <div className="text-sm text-gray-500">Aprovadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
              <div className="text-sm text-gray-500">Rejeitadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Solicitações Pendentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            Solicitações Pendentes ({pendingRequests.length})
          </h3>
        </div>
        
        {pendingRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhuma solicitação pendente
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Building className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{request.name}</h4>
                        <p className="text-sm text-gray-600">CNPJ: {request.cnpj}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {request.city}, {request.state}
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {request.phone}
                          </span>
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {request.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openDetails(request)}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleApprove(request)}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Detalhes da Solicitação</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.cnpj}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade/Estado</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.city}, {selectedRequest.state}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Desconto</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.discount}%</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Horário de Funcionamento</label>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedRequest.workingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize">{day}:</span>
                      <span>{hours.isOpen ? `${hours.open} - ${hours.close}` : 'Fechado'}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar Empresa
                </button>
                <button
                  onClick={() => handleReject(selectedRequest)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar Solicitação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyRequests;
