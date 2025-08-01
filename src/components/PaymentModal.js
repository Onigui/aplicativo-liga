import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, Heart, Calendar, Check, AlertCircle, Copy, Download } from 'lucide-react';
import paymentService from '../services/paymentService';
import transparencyService from '../services/transparencyService';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  type = 'subscription', // 'subscription' ou 'donation'
  planId = null,
  donationData = null,
  userData = null 
}) => {
  const [step, setStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });
  const [donationForm, setDonationForm] = useState({
    amount: '',
    category: 'general',
    message: '',
    recurring: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const paymentMethods = paymentService.getAvailablePaymentMethods();
  const subscriptionPlans = paymentService.getSubscriptionPlans();
  const donationCategories = paymentService.getDonationCategories();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPaymentMethod(null);
      setCardData({ number: '', holder: '', expiry: '', cvv: '' });
      setResult(null);
      setError('');
    }
  }, [isOpen]);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setStep(2);
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    switch (field) {
      case 'number':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
        break;
      case 'expiry':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '');
        break;
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleDonationChange = (field, value) => {
    setDonationForm(prev => ({ ...prev, [field]: value }));
  };

  const processPayment = async () => {
    setLoading(true);
    setError('');

    try {
      let paymentResult;

      if (type === 'subscription') {
        const plan = subscriptionPlans.find(p => p.id === planId);
        if (!plan) throw new Error('Plano não encontrado');

        paymentResult = await paymentService.processSubscriptionPayment(
          planId,
          selectedPaymentMethod.id,
          userData,
          selectedPaymentMethod.id.includes('Card') ? cardData : null
        );
      } else {
        paymentResult = await paymentService.processDonationPayment(
          donationForm,
          selectedPaymentMethod.id,
          userData,
          selectedPaymentMethod.id.includes('Card') ? cardData : null
        );
      }

      if (paymentResult.success) {
        // Registrar na transparência financeira
        if (type === 'subscription') {
          await transparencyService.recordIncome({
            category: 'subscriptions',
            amount: paymentResult.payment.amount,
            description: `Assinatura ${paymentResult.payment.planName}`,
            source: 'app',
            paymentMethod: selectedPaymentMethod.id,
            transactionId: paymentResult.payment.transactionId,
            userId: userData.id,
            userData: userData,
            transparencyLevel: 'public'
          });
        } else {
          await transparencyService.recordIncome({
            category: 'donations',
            amount: paymentResult.payment.amount,
            description: `Doação - ${paymentResult.payment.categoryName}`,
            source: 'app',
            paymentMethod: selectedPaymentMethod.id,
            transactionId: paymentResult.payment.transactionId,
            userId: userData.id,
            userData: userData,
            transparencyLevel: 'public'
          });
        }

        setResult(paymentResult);
        setStep(3);
      } else {
        setError(paymentResult.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Mostrar feedback visual
  };

  const downloadReceipt = () => {
    if (!result) return;
    
    const receipt = `
      COMPROVANTE DE PAGAMENTO - LIGA DO BEM
      
      Tipo: ${type === 'subscription' ? 'Assinatura' : 'Doação'}
      ${type === 'subscription' ? `Plano: ${result.payment.planName}` : `Categoria: ${result.payment.categoryName}`}
      Valor: R$ ${result.payment.amount.toFixed(2)}
      Método: ${selectedPaymentMethod.name}
      Data: ${new Date(result.payment.timestamp).toLocaleString('pt-BR')}
      ID: ${result.payment.id}
      ${result.payment.transactionId ? `Transação: ${result.payment.transactionId}` : ''}
      
      Obrigado pelo seu apoio!
    `;
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante_${result.payment.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {type === 'subscription' ? 'Assinatura' : 'Doação'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Seleção do método de pagamento */}
        {step === 1 && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Escolha a forma de pagamento</h3>
              <p className="text-gray-600 text-sm">
                Selecione a opção mais conveniente para você
              </p>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method)}
                  className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{method.name}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Dados do pagamento */}
        {step === 2 && (
          <div className="p-6">
            <div className="mb-6">
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
              >
                ← Voltar
              </button>
              <h3 className="text-lg font-semibold mb-2">
                {selectedPaymentMethod.name}
              </h3>
            </div>

            {/* Dados específicos do tipo de pagamento */}
            {type === 'donation' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor da doação
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <input
                      type="number"
                      value={donationForm.amount}
                      onChange={(e) => handleDonationChange('amount', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0,00"
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={donationForm.category}
                    onChange={(e) => handleDonationChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {donationCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    value={donationForm.message}
                    onChange={(e) => handleDonationChange('message', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Deixe uma mensagem de apoio..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={donationForm.recurring}
                    onChange={(e) => handleDonationChange('recurring', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
                    Fazer doação recorrente mensal
                  </label>
                </div>
              </div>
            )}

            {/* Dados do cartão se necessário */}
            {selectedPaymentMethod.id.includes('Card') && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do cartão
                  </label>
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) => handleCardInputChange('number', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome no cartão
                  </label>
                  <input
                    type="text"
                    value={cardData.holder}
                    onChange={(e) => handleCardInputChange('holder', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome como está no cartão"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Validade
                    </label>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MM/AA"
                      maxLength="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                      maxLength="4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Resumo do pagamento */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Resumo</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <span className="font-medium">
                    R$ {type === 'subscription' 
                      ? subscriptionPlans.find(p => p.id === planId)?.price.toFixed(2)
                      : donationForm.amount || '0,00'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span>{selectedPaymentMethod.name}</span>
                </div>
              </div>
            </div>

            {/* Botão de pagamento */}
            <button
              onClick={processPayment}
              disabled={loading || (type === 'donation' && !donationForm.amount)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Resultado */}
        {step === 3 && result && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Pagamento realizado com sucesso!
              </h3>
              <p className="text-gray-600">
                {result.message}
              </p>
            </div>

            {/* Detalhes do pagamento */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Detalhes do pagamento</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-mono">{result.payment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <span className="font-medium">R$ {result.payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span>{selectedPaymentMethod.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span>{new Date(result.payment.timestamp).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Instruções específicas do método */}
            {selectedPaymentMethod.id === 'pix' && result.payment.pixCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">Código PIX</h4>
                <div className="bg-white p-3 rounded border mb-3">
                  <code className="text-sm break-all">{result.payment.pixCode}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(result.payment.pixCode)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  <Copy className="h-4 w-4 inline mr-2" />
                  Copiar código
                </button>
              </div>
            )}

            {selectedPaymentMethod.id === 'bankTransfer' && result.payment.bankData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">Dados bancários</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Banco:</strong> {result.payment.bankData.bank}</div>
                  <div><strong>Agência:</strong> {result.payment.bankData.agency}</div>
                  <div><strong>Conta:</strong> {result.payment.bankData.account}</div>
                  <div><strong>Favorecido:</strong> {result.payment.bankData.beneficiary}</div>
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  {result.payment.instructions}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="space-y-3">
              <button
                onClick={downloadReceipt}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Baixar comprovante
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal; 