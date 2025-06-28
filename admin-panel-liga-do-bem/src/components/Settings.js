import React, { useState, useEffect } from 'react';
import { Save, DollarSign, Shield, Bell, Database, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    monthlyValue: 50.00,
    gracePeriod: 7,
    autoApprove: false,
    notifications: {
      email: true,
      sms: false,
      whatsapp: true
    },
    paymentMethods: ['pix', 'boleto', 'cartao'],
    maxFileSize: 5,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf']
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando configurações...');
      const response = await axios.get('/admin/settings');
      console.log('✅ Configurações recebidas:', response.data);
      setSettings(response.data);
    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      setMessage('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Salvando configurações:', settings);
      await axios.put('/admin/settings', settings);
      setMessage('Configurações salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      setMessage('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Configurações do sistema e preferências</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchSettings}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Recarregar</span>
          </button>
          <button 
            onClick={handleSave} 
            className="btn-primary flex items-center space-x-2"
            disabled={saving}
          >
            <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('sucesso') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Payment Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign className="h-6 w-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">Configurações de Pagamento</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa Mensal (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.monthlyValue}
              onChange={(e) => setSettings({...settings, monthlyValue: parseFloat(e.target.value)})}
              className="input-field"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Carência (dias)
            </label>
            <input
              type="number"
              value={settings.gracePeriod}
              onChange={(e) => setSettings({...settings, gracePeriod: parseInt(e.target.value)})}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamanho Máximo de Arquivo (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
              className="input-field"
              disabled={loading}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.autoApprove}
                onChange={(e) => setSettings({...settings, autoApprove: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Aprovação Automática de Pagamentos PIX
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications?.email || false}
              onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, email: e.target.checked}})}
              className="rounded"
              disabled={loading}
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Notificações por Email</span>
              <p className="text-xs text-gray-500">Enviar emails para novos pagamentos e vencimentos</p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications?.sms || false}
              onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, sms: e.target.checked}})}
              className="rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Notificações Push</span>
              <p className="text-xs text-gray-500">Notificações em tempo real no navegador</p>
            </div>
          </label>
        </div>
      </div>

      {/* File Upload Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="h-6 w-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Upload de Arquivos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamanho Máximo (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipos de Arquivo Permitidos
            </label>
            <input
              type="text"
              value={settings.allowedFileTypes?.join(',') || ''}
              onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value.split(',')})}
              placeholder="jpg,jpeg,png,pdf"
              className="input-field"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Segurança</h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Configurações de Segurança</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Para alterar configurações de segurança, como senhas de administrador e chaves de API,
                  entre em contato com o suporte técnico.
                </p>
                <button className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 font-medium">
                  Contatar Suporte →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="h-6 w-6 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Informações do Sistema</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Versão do Sistema:</span>
              <p className="text-sm text-gray-900">v1.0.0</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Última Atualização:</span>
              <p className="text-sm text-gray-900">26/06/2024</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Status do Banco:</span>
              <p className="text-sm text-green-600">✅ Conectado</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Total de Usuários:</span>
              <p className="text-sm text-gray-900">6 usuários</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Total de Pagamentos:</span>
              <p className="text-sm text-gray-900">24 transações</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Espaço Usado:</span>
              <p className="text-sm text-gray-900">156 MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;