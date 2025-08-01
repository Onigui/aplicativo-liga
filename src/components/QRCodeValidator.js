import React, { useState } from 'react';
import { QrCode, Check, X, Search, RefreshCw, User, Calendar, Shield, AlertTriangle } from 'lucide-react';
import paymentService from '../services/paymentService';
import analyticsService from '../services/analyticsService';

const QRCodeValidator = ({ company, onClose }) => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [validationHistory, setValidationHistory] = useState([]);

  const validateQRCode = async (qrData) => {
    setLoading(true);
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (error) {
        throw new Error('QR Code inválido');
      }

      // Validar dados do QR code
      if (!parsedData.userId || !parsedData.name || !parsedData.cpf) {
        throw new Error('Dados do QR Code incompletos');
      }

      // Verificar assinatura ativa
      const history = paymentService.getPaymentHistory(parsedData.userId);
      const activeSubscription = history.find(payment => 
        payment.type === 'subscription' && 
        payment.status === 'completed' &&
        !payment.cancelledAt
      );

      if (!activeSubscription) {
        throw new Error('Usuário sem assinatura ativa');
      }

      // Verificar validade da assinatura (30 dias)
      const subscriptionDate = new Date(activeSubscription.timestamp);
      const now = new Date();
      const daysSincePayment = Math.floor((now - subscriptionDate) / (1000 * 60 * 60 * 24));
      
      const isValid = daysSincePayment <= 30;
      const daysRemaining = Math.max(0, 30 - daysSincePayment);

      const result = {
        user: {
          id: parsedData.userId,
          name: parsedData.name,
          cpf: parsedData.cpf
        },
        subscription: activeSubscription,
        isValid,
        daysRemaining,
        validatedAt: new Date(),
        validatedBy: company?.name || 'Empresa'
      };

      setScanResult(result);
      
      // Adicionar ao histórico
      setValidationHistory(prev => [result, ...prev.slice(0, 9)]);
      
      // Registrar validação
      // analyticsService.track('qr_code_validated', {
      //   userId: parsedData.userId,
      //   companyId: company?.id,
      //   isValid,
      //   timestamp: new Date().toISOString()
      // });

    } catch (error) {
      setScanResult({
        error: error.message,
        validatedAt: new Date(),
        validatedBy: company?.name || 'Empresa'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualValidation = () => {
    if (manualInput.trim()) {
      validateQRCode(manualInput.trim());
    }
  };

  const simulateQRScan = () => {
    // Simular dados de um QR code válido
    const mockQRData = JSON.stringify({
      userId: 'user_123',
      name: 'João Silva',
      cpf: '123.456.789-00',
      timestamp: Date.now(),
      version: '1.0'
    });
    
    validateQRCode(mockQRData);
  };

  const clearResult = () => {
    setScanResult(null);
    setManualInput('');
  };

  const getStatusColor = (isValid) => {
    return isValid ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isValid) => {
    return isValid ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Validador de QR Code</h2>
              <p className="text-gray-600">
                {company?.name || 'Empresa'} - Liga do Bem
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Área de validação */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-32 h-32 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                Posicione o QR Code da carteirinha do usuário na área acima
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={simulateQRScan}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Validando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Search className="h-4 w-4" />
                      <span>Simular Leitura QR Code</span>
                    </div>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Ou digite manualmente os dados do QR Code..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleManualValidation}
                    disabled={loading || !manualInput.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    Validar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado da validação */}
          {scanResult && (
            <div className="mb-6">
              {scanResult.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <div>
                      <h3 className="font-semibold text-red-800">Validação Falhou</h3>
                      <p className="text-red-700">{scanResult.error}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-red-600">
                    <p>Validado em: {scanResult.validatedAt.toLocaleString('pt-BR')}</p>
                    <p>Por: {scanResult.validatedBy}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Resultado da Validação
                    </h3>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                      scanResult.isValid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusIcon(scanResult.isValid)}
                      <span>{scanResult.isValid ? 'VÁLIDA' : 'INVÁLIDA'}</span>
                    </div>
                  </div>

                  {/* Dados do usuário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nome</p>
                      <p className="text-gray-800">{scanResult.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">CPF</p>
                      <p className="text-gray-800 font-mono">{scanResult.user.cpf}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Plano</p>
                      <p className="text-gray-800">{scanResult.subscription.planName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <p className={`font-medium ${getStatusColor(scanResult.isValid)}`}>
                        {scanResult.isValid 
                          ? `Válida por mais ${scanResult.daysRemaining} dias`
                          : 'Assinatura expirada'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Informações da validação */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Validado em:</p>
                        <p className="text-gray-800">{scanResult.validatedAt.toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Validado por:</p>
                        <p className="text-gray-800">{scanResult.validatedBy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={clearResult}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Nova Validação
                    </button>
                    {scanResult.isValid && (
                      <button
                        onClick={() => {
                          // Implementar ação de desconto
                          alert('Desconto aplicado com sucesso!');
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Aplicar Desconto
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Histórico de validações */}
          {validationHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Histórico de Validações
              </h3>
              <div className="space-y-3">
                {validationHistory.map((validation, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {validation.user?.name || 'Usuário'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {validation.validatedAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        validation.isValid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getStatusIcon(validation.isValid)}
                        <span>{validation.isValid ? 'VÁLIDA' : 'INVÁLIDA'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeValidator; 