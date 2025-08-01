import React, { useState } from 'react';
import { Check, Star, Crown, Zap, Shield, Gift, Calendar, CreditCard, X } from 'lucide-react';
import paymentService from '../services/paymentService';

const SubscriptionPlans = ({ user, onSelectPlan, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const plans = paymentService.getSubscriptionPlans();

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'monthly':
        return <Calendar className="h-8 w-8" />;
      case 'quarterly':
        return <Zap className="h-8 w-8" />;
      case 'yearly':
        return <Crown className="h-8 w-8" />;
      default:
        return <CreditCard className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'monthly':
        return 'from-blue-500 to-indigo-600';
      case 'quarterly':
        return 'from-purple-500 to-pink-600';
      case 'yearly':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    onSelectPlan(plan);
  };

  const getCurrentSubscription = () => {
    const history = paymentService.getPaymentHistory(user?.id);
    return history.find(payment => 
      payment.type === 'subscription' && 
      payment.status === 'completed' &&
      !payment.cancelledAt
    );
  };

  const currentSubscription = getCurrentSubscription();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Planos de Assinatura</h2>
              <p className="text-gray-600">Escolha o plano ideal para você</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status atual */}
        {currentSubscription && (
          <div className="p-6 bg-green-50 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">
                  Assinatura Ativa: {currentSubscription.planName}
                </h3>
                <p className="text-sm text-green-600">
                  Válida até: {new Date(currentSubscription.timestamp).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Planos */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = currentSubscription?.planId === plan.id;
              const isPopular = plan.id === 'monthly';
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    isCurrentPlan 
                      ? 'border-green-500 bg-green-50' 
                      : selectedPlan?.id === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Badge popular */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Mais Popular
                      </span>
                    </div>
                  )}

                  {/* Badge atual */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Atual
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header do plano */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getPlanColor(plan.id)} text-white mb-4`}>
                        {getPlanIcon(plan.id)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-800">
                          R$ {plan.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-gray-600">/{plan.period === 'month' ? 'mês' : plan.period === 'quarter' ? 'trimestre' : 'ano'}</span>
                      </div>
                      {plan.discount && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                          {plan.discount}% de desconto
                        </div>
                      )}
                    </div>

                    {/* Benefícios */}
                    <div className="space-y-3 mb-6">
                      {plan.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Botão de ação */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrentPlan}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedPlan?.id === plan.id
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isCurrentPlan ? 'Plano Atual' : 'Escolher Plano'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Informações adicionais */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Informações Importantes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Pagamento Seguro</p>
                  <p>Todos os pagamentos são processados com segurança</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Gift className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Benefícios Imediatos</p>
                  <p>Acesso instantâneo a todos os benefícios</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Cancelamento Flexível</p>
                  <p>Cancele a qualquer momento sem multas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Suporte Prioritário</p>
                  <p>Atendimento exclusivo para assinantes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans; 