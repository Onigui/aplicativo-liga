import React, { useState, useEffect } from 'react';
import { QrCode, Check, X, RefreshCw, Download, Share2, Crown, Star, Shield } from 'lucide-react';
import paymentService from '../services/paymentService';

const DigitalCard = ({ user, onClose }) => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    generateQRCode();
    checkSubscriptionStatus();
  }, [user]);

  const generateQRCode = () => {
    if (!user) return;

    const cardData = {
      userId: user.id,
      name: user.name,
      cpf: user.cpf,
      timestamp: Date.now(),
      version: '1.0'
    };

    // Gerar QR code com dados da carteirinha
    const qrString = JSON.stringify(cardData);
    setQrCodeData(qrString);
  };

  const checkSubscriptionStatus = () => {
    if (!user) return;

    const history = paymentService.getPaymentHistory(user.id);
    const activeSubscription = history.find(payment => 
      payment.type === 'subscription' && 
      payment.status === 'completed' &&
      !payment.cancelledAt
    );

    if (activeSubscription) {
      // Verificar se a assinatura ainda é válida (30 dias após o pagamento)
      const subscriptionDate = new Date(activeSubscription.timestamp);
      const now = new Date();
      const daysSincePayment = Math.floor((now - subscriptionDate) / (1000 * 60 * 60 * 24));
      
      const isValidSubscription = daysSincePayment <= 30;
      
      setSubscriptionStatus({
        ...activeSubscription,
        isValid: isValidSubscription,
        daysRemaining: Math.max(0, 30 - daysSincePayment)
      });
      
      setIsValid(isValidSubscription);
    } else {
      setSubscriptionStatus(null);
      setIsValid(false);
    }
    
    setLoading(false);
  };

  const refreshCard = () => {
    setLoading(true);
    setTimeout(() => {
      generateQRCode();
      checkSubscriptionStatus();
      setLastUpdate(new Date());
    }, 1000);
  };

  const downloadCard = () => {
    // Implementar download da carteirinha como imagem
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Criar imagem da carteirinha
    canvas.width = 400;
    canvas.height = 250;
    
    // Desenhar fundo
    ctx.fillStyle = isValid ? '#10B981' : '#EF4444';
    ctx.fillRect(0, 0, 400, 250);
    
    // Desenhar texto
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Liga do Bem', 20, 40);
    
    ctx.font = '16px Arial';
    ctx.fillText(`Nome: ${user?.name}`, 20, 80);
    ctx.fillText(`CPF: ${user?.cpf}`, 20, 110);
    ctx.fillText(`Status: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`, 20, 140);
    ctx.fillText(`Atualizado: ${lastUpdate.toLocaleString('pt-BR')}`, 20, 170);
    
    // Converter para blob e download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carteirinha_${user?.name}_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const shareCard = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Minha Carteirinha - Liga do Bem',
        text: `Carteirinha digital de ${user?.name}`,
        url: window.location.href
      });
    } else {
      // Fallback: copiar para clipboard
      navigator.clipboard.writeText(`Carteirinha digital de ${user?.name} - Liga do Bem`);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando carteirinha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Carteirinha Digital</h2>
              <p className="text-gray-600">Liga do Bem</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carteirinha */}
        <div className="p-6">
          <div className={`relative rounded-xl p-6 text-white ${
            isValid 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-red-500 to-pink-600'
          }`}>
            
            {/* Status badge */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>{isValid ? 'VÁLIDA' : 'INVÁLIDA'}</span>
              </div>
            </div>

            {/* Logo e título */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Liga do Bem</h3>
                <p className="text-sm opacity-90">Proteção Animal</p>
              </div>
            </div>

            {/* Dados do usuário */}
            <div className="space-y-2 mb-6">
              <div>
                <p className="text-xs opacity-80">Nome</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs opacity-80">CPF</p>
                <p className="font-mono text-sm">{user?.cpf}</p>
              </div>
              {subscriptionStatus && (
                <div>
                  <p className="text-xs opacity-80">Plano</p>
                  <p className="font-semibold">{subscriptionStatus.planName}</p>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="bg-white bg-opacity-20 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mx-auto mb-2">
                  <QrCode className="h-16 w-16 text-gray-800" />
                </div>
                <p className="text-xs opacity-90">QR Code para validação</p>
              </div>
            </div>

            {/* Informações de validade */}
            {subscriptionStatus && (
              <div className="mt-4 text-center">
                <p className="text-xs opacity-80">
                  {isValid 
                    ? `Válida por mais ${subscriptionStatus.daysRemaining} dias`
                    : 'Assinatura expirada'
                  }
                </p>
                <p className="text-xs opacity-80">
                  Última atualização: {lastUpdate.toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="mt-6 space-y-3">
            <button
              onClick={refreshCard}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar Carteirinha</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={downloadCard}
                className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Baixar</span>
              </button>

              <button
                onClick={shareCard}
                className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>

          {/* Status da assinatura */}
          {!subscriptionStatus && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Assinatura Necessária</p>
                  <p className="text-sm text-yellow-700">
                    Para ter uma carteirinha válida, você precisa de uma assinatura ativa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {subscriptionStatus && !isValid && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <X className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Assinatura Expirada</p>
                  <p className="text-sm text-red-700">
                    Sua assinatura expirou. Renove para manter sua carteirinha válida.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalCard; 