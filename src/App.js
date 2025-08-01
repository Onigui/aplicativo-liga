import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Store, Heart, Info, CreditCard, DollarSign, BookOpen, Phone, Calendar, Menu, ArrowLeft, MapPin, Clock, Globe, Check, X, Sparkles, Star, Award, UserPlus, LogIn, Building, Mail, MapPin as Location, Percent, Search, Filter, Tag, Clock3, ChevronDown, ChevronUp } from 'lucide-react';
import AdminApp from './AdminApp';
import apiService from './services/api2';
import './App.css';

console.log('🚀 [DEBUG] App.js carregado - versão com MOCKAPI e sistema de parcerias empresariais');

// Componente para seção de promoções
const PromotionsSection = ({ promotions }) => {
  const [promotionsExpanded, setPromotionsExpanded] = useState(false);

  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="px-6 pb-4">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h4 className="font-bold text-orange-800">Promoções Especiais</h4>
          </div>
          
          {promotions.length > 1 && (
            <button
              onClick={() => setPromotionsExpanded(!promotionsExpanded)}
              className="flex items-center space-x-1 text-orange-600 hover:text-orange-800 transition-colors"
            >
              <span className="text-sm font-medium">
                {promotionsExpanded ? 'Ver menos' : `Ver todas (${promotions.length})`}
              </span>
              {promotionsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        
        {/* Lista de Promoções */}
        <div className="mt-3">
          {promotions.length === 1 ? (
            <div className="bg-white rounded-lg p-3 border border-yellow-200">
              <h5 className="font-bold text-gray-800 text-sm">{promotions[0].title}</h5>
              <p className="text-gray-600 text-sm mt-1">{promotions[0].description}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Primeira promoção sempre visível */}
              <div className="bg-white rounded-lg p-3 border border-yellow-200">
                <h5 className="font-bold text-gray-800 text-sm">{promotions[0].title}</h5>
                <p className="text-gray-600 text-sm mt-1">{promotions[0].description}</p>
              </div>
              
              {/* Promoções adicionais (expansível) */}
              {promotionsExpanded && promotions.slice(1).map((promotion) => (
                <div key={promotion.id} className="bg-white rounded-lg p-3 border border-yellow-200">
                  <h5 className="font-bold text-gray-800 text-sm">{promotion.title}</h5>
                  <p className="text-gray-600 text-sm mt-1">{promotion.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {

  const [currentPage, setCurrentPage] = useState('welcome');
  const [loadingButton, setLoadingButton] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ cpf: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    cpf: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  
  // Estados para reset de senha
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  // Estados para perfil do usuário
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Estados para notificações
  const [notifications, setNotifications] = useState([]);
  
  // Estados para geolocalização
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(10); // km
  const [sortByDistance, setSortByDistance] = useState(false);
  
  // Estados para pesquisa de empresas
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchDiscount, setSearchDiscount] = useState('all');

  // Estados para cadastro de empresas
  const [companyData, setCompanyData] = useState({
    companyName: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    discount: '',
    description: '',
    category: '',
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
  const [companyError, setCompanyError] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySuccess, setCompanySuccess] = useState(false);

  // Estados para empresas parceiras (apenas para exibir na seção partners)
  const [approvedCompanies, setApprovedCompanies] = useState([]);
  
  // Estados para administração
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCompanies, setAdminCompanies] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);



  // Dados mock de doações
  const donations = [
    { date: '2024-06-01', amount: 50.00, method: 'PIX' },
    { date: '2024-05-01', amount: 50.00, method: 'PIX' },
    { date: '2024-04-01', amount: 50.00, method: 'PIX' },
    { date: '2024-03-01', amount: 50.00, method: 'PIX' }
  ];

  // Dados mock de eventos
  const events = [
    {
      id: 1,
      title: 'Feira de Adoção',
      date: '2024-07-15',
      time: '09:00 - 16:00',
      location: 'Praça Rubião Júnior',
      description: 'Venha conhecer nossos animais disponíveis para adoção!'
    },
    {
      id: 2,
      title: 'Campanha de Vacinação',
      date: '2024-07-22',
      time: '08:00 - 17:00',
      location: 'Centro Comunitário Vila Assunção',
      description: 'Vacinação gratuita para cães e gatos da comunidade.'
    },
    {
      id: 3,
      title: 'Bazar Solidário',
      date: '2024-08-05',
      time: '14:00 - 18:00',
      location: 'Sede da Liga do Bem',
      description: 'Roupas, calçados e objetos diversos com preços solidários.'
    }
  ];

  const phoneNumbers = [
    { service: 'Liga do Bem Botucatu', number: '(14) 3815-1234' },
    { service: 'Vigilância Sanitária', number: '(14) 3811-1000' },
    { service: 'Polícia Ambiental', number: '(14) 3815-8900' },
    { service: 'Bombeiros (Emergência)', number: '193' },
    { service: 'Centro de Controle de Zoonoses', number: '(14) 3811-1020' }
  ];

  const makeCall = (number) => {
    window.open(`tel:${number}`, '_self');
  };

  const openWebsite = (url, buttonId = null) => {
    if (buttonId) setLoadingButton(buttonId);
    
    // Handle null/undefined URLs
    if (!url) {
      console.error('URL is null or undefined');
      if (buttonId) {
        setTimeout(() => setLoadingButton(null), 1000);
      }
      return;
    }
    
    try {
      // Ensure URL has protocol - only add https:// if no protocol exists
      const fullUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      const newWindow = window.open(fullUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback if popup is blocked
        window.location.href = fullUrl;
      }
    } catch (error) {
      console.error('Error opening website:', error);
      // Fallback: try to navigate in current tab
      const fullUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      window.location.href = fullUrl;
    }
    
    // Reset loading state after a short delay
    if (buttonId) {
      setTimeout(() => setLoadingButton(null), 1000);
    }
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  // Função para formatar CPF
  const formatCPF = (value) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length <= 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  // Função para validar CPF
  const validateCPF = (cpf) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verificar se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verificar se não são todos iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  // Função para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para validar CNPJ
  const validateCNPJ = (cnpj) => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Validação dos dígitos verificadores
    let length = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, length);
    const digits = cleanCNPJ.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += numbers.charAt(length - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    
    length = length + 1;
    numbers = cleanCNPJ.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += numbers.charAt(length - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
  };

  // Função para adicionar notificação com debounce
  const addNotification = useCallback((message, type = 'info') => {
    // Evitar notificações duplicadas nos últimos 2 segundos
    const now = Date.now();
    const recentNotifications = notifications.filter(n => 
      n.message === message && (now - n.timestamp.getTime()) < 2000
    );
    
    if (recentNotifications.length > 0) {
      console.log('🚫 Notificação duplicada ignorada:', message);
      return;
    }
    
    const id = now;
    const notification = { id, message, type, timestamp: new Date() };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Manter apenas 5 notificações
    
    console.log('📢 Notificação adicionada:', message, type);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, [notifications]);

  // Função para reset de senha
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    if (!resetEmail.trim()) {
      setResetMessage('Email é obrigatório');
      setResetLoading(false);
      return;
    }

    if (!validateEmail(resetEmail)) {
      setResetMessage('Email inválido');
      setResetLoading(false);
      return;
    }

    try {
      // Simular envio de email de reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResetMessage('Se este email estiver cadastrado, você receberá as instruções para redefinir sua senha.');
      addNotification('Email de recuperação enviado!', 'success');
      
      setTimeout(() => {
        setShowResetPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
      
    } catch (error) {
      setResetMessage('Erro ao enviar email. Tente novamente.');
      addNotification('Erro ao enviar email de recuperação', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  // Função para atualizar perfil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      addNotification('Nome é obrigatório', 'error');
      return;
    }

    if (profileData.email && !validateEmail(profileData.email)) {
      addNotification('Email inválido', 'error');
      return;
    }

    try {
      // Simular atualização do perfil
      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      addNotification('Perfil atualizado com sucesso!', 'success');
      setShowProfile(false);
      
    } catch (error) {
      addNotification('Erro ao atualizar perfil', 'error');
    }
  };

  // Função para carregar dados do perfil
  const loadProfileData = () => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  };

  // Função para calcular distância usando fórmula de Haversine
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Função para obter localização do usuário
  const getUserLocation = () => {
    // Prevenir múltiplas chamadas se já estiver carregando
    if (locationLoading) {
      return;
    }
    
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationLoading(false);
      addNotification('Geolocalização não suportada neste dispositivo', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setLocationLoading(false);
        addNotification('📍 Localização obtida! Agora você pode ver as distâncias das empresas.', 'success');
        console.log('📍 Localização do usuário:', location);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite esgotado';
            break;
          default:
            errorMessage = 'Erro desconhecido';
            break;
        }
        setLocationLoading(false);
        addNotification(errorMessage, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  // Função para formatar distância
  const formatDistance = (distance) => {
    // Verificar se a distância é um número válido
    if (distance === null || distance === undefined || isNaN(distance)) {
      return 'Distância não disponível';
    }
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Função para atualizar horários de funcionamento
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

  // Função para verificar se empresa está aberta agora (versão super segura)
  const isCompanyOpen = (workingHours) => {
    try {
      // Sempre retorna null se não houver horários - isso evita quebrar o app
      if (!workingHours || typeof workingHours !== 'object') {
        return null;
      }
      
      const now = new Date();
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const currentTime = now.getHours() * 60 + now.getMinutes(); // em minutos
      
      const todayHours = workingHours[currentDay];
      
      // Se não tem horário para hoje, considera fechado
      if (!todayHours) return false;
      
      // Se é string "Fechado"
      if (todayHours === 'Fechado') return false;
      
      // Se é 24 horas
      if (todayHours === '24 horas') return true;
      
      // Se tem formato de string "08:00 - 18:00" ou "08:00 - 18:00, 19:00 - 23:00"
      if (typeof todayHours === 'string' && todayHours.includes('-')) {
        const periods = todayHours.split(', ');
        
        for (const period of periods) {
          if (!period || typeof period !== 'string') continue;
          
          const parts = period.split(' - ');
          if (parts.length !== 2) continue;
          
          const [openStr, closeStr] = parts;
          if (!openStr || !closeStr || typeof openStr !== 'string' || typeof closeStr !== 'string') continue;
          
          const openParts = openStr.split(':');
          const closeParts = closeStr.split(':');
          
          if (openParts.length === 2 && closeParts.length === 2) {
            const openHour = parseInt(openParts[0]);
            const openMin = parseInt(openParts[1]);
            const closeHour = parseInt(closeParts[0]);
            const closeMin = parseInt(closeParts[1]);
            
            if (isNaN(openHour) || isNaN(openMin) || isNaN(closeHour) || isNaN(closeMin)) continue;
            
            const openTime = openHour * 60 + openMin;
            const closeTime = closeHour * 60 + closeMin;
            
            if (currentTime >= openTime && currentTime <= closeTime) {
              return true;
            }
          }
        }
        return false;
      }
      
      // Se tem formato de objeto { open: "08:00", close: "18:00" }
      if (typeof todayHours === 'object' && todayHours !== null) {
        if (todayHours.closed === true) return false;
        
        if (!todayHours.open || !todayHours.close || 
            typeof todayHours.open !== 'string' || typeof todayHours.close !== 'string') {
          return null;
        }
        
        const openParts = todayHours.open.split(':');
        const closeParts = todayHours.close.split(':');
        
        if (openParts.length === 2 && closeParts.length === 2) {
          const openHour = parseInt(openParts[0]);
          const openMin = parseInt(openParts[1]);
          const closeHour = parseInt(closeParts[0]);
          const closeMin = parseInt(closeParts[1]);
          
          if (isNaN(openHour) || isNaN(openMin) || isNaN(closeHour) || isNaN(closeMin)) {
            return null;
          }
          
          const openTime = openHour * 60 + openMin;
          const closeTime = closeHour * 60 + closeMin;
          
          return currentTime >= openTime && currentTime <= closeTime;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao verificar horário da empresa:', error);
      return null;
    }
  };

  // Função para formatar horários
  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return [];
    
    const days = {
      monday: 'Segunda',
      tuesday: 'Terça', 
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    
    return Object.entries(days).map(([key, name]) => {
      const hours = workingHours[key];
      
      // Se é string (formato "08:00 - 18:00")
      if (typeof hours === 'string') {
        return {
          day: name,
          hours: hours
        };
      }
      
      // Se é objeto { open: "08:00", close: "18:00" }
      return {
        day: name,
        hours: hours?.closed ? 'Fechado' : `${hours?.open || '08:00'} - ${hours?.close || '18:00'}`
      };
    });
  };

  // Função para abrir navegação GPS
  const openNavigation = (company) => {
    if (company.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${company.coordinates.latitude},${company.coordinates.longitude}`;
      window.open(url, '_blank');
    } else if (company.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address + ', Botucatu, SP')}`;
      window.open(url, '_blank');
    }
  };

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    // Remover formatação do CPF para enviar ao backend
    const cleanCPF = loginData.cpf.replace(/\D/g, '');

    // Verificar se é acesso de administrador
    if (cleanCPF === '00000000000' && loginData.password === 'admin123') {
      console.log('🔐 [ADMIN] Acesso de administrador detectado');
      
      try {
        // Fazer login real no backend
        const response = await fetch('https://liga-do-bem-api.onrender.com/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: cleanCPF,
            password: loginData.password
          })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log('✅ [ADMIN] Login admin bem-sucedido no backend');
          
          // Salvar dados do admin com token real
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
          
          // Redirecionar para área administrativa completa
          setCurrentPage('admin');
          return;
        } else {
          console.log('❌ [ADMIN] Erro no login admin:', data.message);
          setLoginError(data.message || 'Erro no login admin');
          return;
        }
      } catch (error) {
        console.error('❌ [ADMIN] Erro ao conectar com backend:', error);
        setLoginError('Erro de conexão com o servidor');
        return;
      }
    }

    try {
      console.log('🔐 [DEBUG] *** VERSÃO CORRIGIDA *** Iniciando login com sistema offline');
      console.log('🔐 [DEBUG] CPF limpo:', cleanCPF);
      console.log('🔐 [DEBUG] Senha fornecida:', loginData.password ? 'SIM' : 'NÃO');
      console.log('🔐 [DEBUG] API Service disponível:', typeof apiService);
      
      const result = await apiService.login(cleanCPF, loginData.password);
      console.log('🔐 [DEBUG] Resultado API Service:', result);

      if (result.success) {
        // Login bem-sucedido
        console.log('✅ Login bem-sucedido!', result.user);
        
        // Verificar se é administrador
        const adminCPFs = ['123.456.789-01', '11111111111']; // CPFs dos administradores
        setIsAdmin(adminCPFs.includes(result.user.cpf));
        
        setUser(result.user);
        setIsAuthenticated(true);
        setCurrentPage('home');
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        addNotification(`Bem-vindo, ${result.user.name}!`, 'success');
      } else {
        // Erro no login
        console.log('❌ Erro no login:', result.message);
        setLoginError(result.message);
        addNotification(result.message || 'CPF ou senha incorretos', 'error');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setLoginError('Erro interno. Tente novamente.');
      addNotification('Erro de conexão. Tente novamente.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Função de logout
  const handleLogout = useCallback(() => {
    const userName = user?.name || 'Usuário';
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('welcome');
    setLoginData({ cpf: '', password: '' });
    setRegisterData({ name: '', cpf: '', password: '', confirmPassword: '' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowMenu(false);
    setShowProfile(false);
    addNotification(`Até logo, ${userName}!`, 'info');
  }, [user, addNotification]);



  // Função de cadastro
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');

    // Validações front-end
    if (!registerData.name || !registerData.name.trim()) {
      setRegisterError('Nome é obrigatório');
      setRegisterLoading(false);
      return;
    }

    if (!registerData.cpf || !registerData.cpf.trim()) {
      setRegisterError('CPF é obrigatório');
      setRegisterLoading(false);
      return;
    }

    // Validar CPF
    if (!validateCPF(registerData.cpf)) {
      setRegisterError('CPF inválido');
      setRegisterLoading(false);
      return;
    }

    if (!registerData.password || !registerData.password.trim()) {
      setRegisterError('Senha é obrigatória');
      setRegisterLoading(false);
      return;
    }

    if (!registerData.confirmPassword || !registerData.confirmPassword.trim()) {
      setRegisterError('Confirmação de senha é obrigatória');
      setRegisterLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('As senhas não coincidem');
      setRegisterLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError('A senha deve ter pelo menos 6 caracteres');
      setRegisterLoading(false);
      return;
    }

    // Remover formatação do CPF para enviar ao backend
    const cleanCPF = registerData.cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) {
      setRegisterError('CPF deve conter 11 dígitos');
      setRegisterLoading(false);
      return;
    }

    try {
      console.log('📋 RegisterData atual:', registerData);
      console.log('📋 CleanCPF:', cleanCPF);

      const requestBody = {
        name: registerData.name.trim(),
        cpf: cleanCPF,
        password: registerData.password.trim()
      };

      console.log('📝 Tentando cadastro:', requestBody);
      const result = await apiService.register(requestBody);
      
      console.log('📦 Register Response:', result);

      if (result.success) {
        // Cadastro bem-sucedido - agora fazer login automaticamente
        try {
          console.log('🔐 Fazendo login automático...');
          const loginResult = await apiService.login(cleanCPF, registerData.password);

          if (loginResult.success) {
            console.log('✅ Login automático bem-sucedido!');
            setUser(loginResult.user);
            setIsAuthenticated(true);
            setCurrentPage('home');
            localStorage.setItem('token', loginResult.token);
            localStorage.setItem('user', JSON.stringify(loginResult.user));
            addNotification(`Conta criada com sucesso! Bem-vindo, ${loginResult.user.name}!`, 'success');
          } else {
            // Cadastro ok, mas erro no login automático - redirecionar para login
            setCurrentPage('login');
            setRegisterError('Conta criada com sucesso! Faça login para continuar.');
            addNotification('Conta criada com sucesso! Faça login para continuar.', 'success');
          }
        } catch (loginError) {
          // Erro no login automático - redirecionar para login
          setCurrentPage('login');
          setRegisterError('Conta criada com sucesso! Faça login para continuar.');
          addNotification('Conta criada com sucesso! Faça login para continuar.', 'success');
        }
      } else {
        // Erro no cadastro - mostrar mensagem específica
        console.log('❌ Erro no cadastro:', result.message);
        setRegisterError(result.message);
        addNotification(result.message || 'Erro no cadastro', 'error');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setRegisterError('Erro de conexão. Tente novamente.');
      addNotification('Erro de conexão. Tente novamente.', 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Função para cadastrar empresa
  const handleCompanyRegister = async (e) => {
    e.preventDefault();
    setCompanyError('');
    setCompanyLoading(true);

    // Validações
    if (!companyData.companyName || !companyData.companyName.trim()) {
      setCompanyError('Nome da empresa é obrigatório');
      setCompanyLoading(false);
      return;
    }

    if (!companyData.cnpj || !companyData.cnpj.trim()) {
      setCompanyError('CNPJ é obrigatório');
      setCompanyLoading(false);
      return;
    }

    if (!validateCNPJ(companyData.cnpj)) {
      setCompanyError('CNPJ inválido');
      setCompanyLoading(false);
      return;
    }

    if (companyData.email && !validateEmail(companyData.email)) {
      setCompanyError('Email inválido');
      setCompanyLoading(false);
      return;
    }

    if (!companyData.category || !companyData.category.trim()) {
      setCompanyError('Categoria é obrigatória');
      setCompanyLoading(false);
      return;
    }

    if (!companyData.discount || !companyData.discount.trim()) {
      setCompanyError('Desconto oferecido é obrigatório');
      setCompanyLoading(false);
      return;
    }

    try {
      const response = await apiService.registerCompany(companyData);
      
      if (response.success) {
        setCompanySuccess(true);
        setCompanyData({
          companyName: '',
          cnpj: '',
          address: '',
          phone: '',
          email: '',
          discount: '',
          description: '',
          category: '',
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
        
        // Mostrar mensagem de sucesso por 3 segundos, depois voltar ao welcome
        setTimeout(() => {
          setCompanySuccess(false);
          setCurrentPage('welcome');
        }, 3000);
      } else {
        setCompanyError(response.message);
      }
    } catch (error) {
      console.error('Erro no cadastro da empresa:', error);
      setCompanyError('Erro interno. Tente novamente.');
    } finally {
      setCompanyLoading(false);
    }
  };



  // Verificar se há login salvo ao carregar a página e validar o token com o backend
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    const validateSession = async () => {
      // Se não há token ou dados do usuário, redirecionar para welcome
      if (!savedToken || !savedUser) {
        console.log('🚪 Nenhum token ou dados de usuário encontrados');
        setUser(null);
        setIsAuthenticated(false);
        setCurrentPage('welcome');
        return;
      }

      try {
        // Tentar parsear os dados do usuário antes de validar o token
        let userData;
        try {
          userData = JSON.parse(savedUser);
        } catch (parseError) {
          console.error('❌ Erro ao parsear dados do usuário:', parseError);
          throw new Error('Dados do usuário corrompidos');
        }

        // Validar o token com o backend (API Service) - NUNCA confiar apenas nos dados locais
        console.log('🔍 Validando sessão...');
        const isValid = await apiService.validateToken(savedToken);
        
        if (isValid) {
          // Token válido - restaurar sessão
          console.log('✅ Sessão válida restaurada para:', userData.name);
          
          // Verificar se é administrador (CPF específico da Liga do Bem)
          const adminCPFs = ['123.456.789-01', '11111111111']; // CPFs dos administradores
          setIsAdmin(adminCPFs.includes(userData.cpf));
          
          setUser(userData);
          setIsAuthenticated(true);
          setCurrentPage('home');
        } else {
          // Token inválido ou expirado - limpar dados e redirecionar
          console.log('❌ Token inválido ou expirado');
          throw new Error('Token inválido');
        }
      } catch (error) {
        console.error('❌ Erro ao validar sessão:', error.message);
        // Sempre limpar dados locais quando a validação falha
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        setCurrentPage('welcome');
      }
    };

    validateSession();
  }, []);

  // Periodicamente validar o token durante o uso da aplicação
  useEffect(() => {
    let tokenCheckInterval;

    if (isAuthenticated && user) {
      // Verificar token a cada 5 minutos
      tokenCheckInterval = setInterval(async () => {
        const savedToken = localStorage.getItem('token');
        
        if (!savedToken) {
          console.log('🚪 Token removido - fazendo logout');
          handleLogout();
          return;
        }

        try {
          const isValid = await apiService.validateToken(savedToken);
          if (!isValid) {
            console.log('🚪 Token expirou durante o uso - fazendo logout');
            handleLogout();
          }
        } catch (error) {
          console.error('❌ Erro na verificação periódica do token:', error);
          handleLogout();
        }
      }, 5 * 60 * 1000); // 5 minutos
    }

    // Limpar o interval quando o componente for desmontado ou o usuário fizer logout
    return () => {
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
      }
    };
  }, [isAuthenticated, user, handleLogout]);

  const renderWelcome = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <div className="glass rounded-full p-8 mx-auto w-fit pulse-glow mb-6">
            <img 
              src="/patinha-logo.png" 
              alt="Logo Liga do Bem" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <div className="mb-4">
            <img 
              src="/nome-liga-do-bem.png" 
              alt="Liga do Bem" 
              className="h-16 mx-auto object-contain"
            />
          </div>
          <p className="text-purple-200 text-xl font-medium mb-2">Botucatu 🐾</p>
          <p className="text-purple-300 text-base">
            Juntos fazemos a diferença na vida dos animais
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Login Button */}
          <button
            onClick={() => setCurrentPage('login')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
          >
            <LogIn className="h-6 w-6" />
            <span>Fazer Login</span>
          </button>

          {/* Register Button */}
          <button
            onClick={() => setCurrentPage('register')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
          >
            <UserPlus className="h-6 w-6" />
            <span>Criar Conta</span>
          </button>

          {/* Company Partnership Button */}
          <button
            onClick={() => setCurrentPage('companyRegister')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
          >
            <Building className="h-6 w-6" />
            <span>Parceiro Empresarial</span>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 glass border border-white/20 rounded-2xl p-6">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Por que fazer parte?</h3>
            <p className="text-purple-200 text-sm leading-relaxed mb-3">
              <strong>Para Membros:</strong> Tenha acesso a descontos exclusivos em petshops, clínicas veterinárias, 
              eventos de adoção e muito mais! Sua contribuição ajuda diretamente os animais de Botucatu.
            </p>
            <p className="text-blue-200 text-sm leading-relaxed">
              <strong>Para Empresas:</strong> Seja uma parceira oficial da Liga do Bem e mostre seu compromisso 
              com a causa animal. Cadastre-se como Parceiro Empresarial e ofereça descontos aos nossos membros!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-300 text-sm">
            Dúvidas? Entre em contato:
          </p>
          <button
            onClick={() => makeCall('(14) 3815-1234')}
            className="text-cyan-300 hover:text-cyan-200 font-semibold text-sm mt-1 hover:underline transition-colors duration-200"
          >
            (14) 3815-1234
          </button>
        </div>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => setCurrentPage('welcome')}
            className="glass rounded-full p-3 hover:bg-white/20 transition-all duration-300 glow-animation flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-purple-200" />
            <span className="text-purple-200 text-sm">Voltar</span>
          </button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="glass rounded-full p-6 mx-auto w-fit pulse-glow mb-4">
            <img 
              src="/patinha-logo.png" 
              alt="Logo Liga do Bem" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="mb-2">
            <img 
              src="/nome-liga-do-bem.png" 
              alt="Liga do Bem" 
              className="h-12 mx-auto object-contain"
            />
          </div>
          <p className="text-purple-200 text-lg font-medium">Botucatu 🐾</p>
        </div>

        {/* Login Form */}
        <div className="glass border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Fazer Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* CPF Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                CPF
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="text"
                  value={loginData.cpf}
                  onChange={(e) => setLoginData({ 
                    ...loginData, 
                    cpf: formatCPF(e.target.value) 
                  })}
                  placeholder="000.000.000-00"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-base font-mono tracking-wide"
                  required
                  maxLength="14"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Senha
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ 
                    ...loginData, 
                    password: e.target.value 
                  })}
                  placeholder="Digite sua senha"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <X className="h-5 w-5 text-red-300" />
                  <p className="text-red-200 font-medium">{loginError}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loginLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-purple-200 text-sm">
              Não tem uma conta ainda?{' '}
              <button
                onClick={() => setCurrentPage('register')}
                className="text-cyan-300 hover:text-cyan-200 font-semibold hover:underline transition-colors duration-200"
              >
                Criar Conta
              </button>
            </p>
            
            {/* Esqueci minha senha */}
            <p className="text-purple-200 text-sm">
              Esqueceu sua senha?{' '}
              <button
                onClick={() => {
                  loadProfileData();
                  setShowResetPassword(true);
                }}
                className="text-yellow-300 hover:text-yellow-200 font-semibold hover:underline transition-colors duration-200"
              >
                Recuperar Senha
              </button>
            </p>
            
            <div className="border-t border-white/10 pt-3">
              <p className="text-purple-200 text-sm">
                Problemas para acessar? Entre em contato:
              </p>
              <button
                onClick={() => makeCall('(14) 3815-1234')}
                className="text-cyan-300 hover:text-cyan-200 font-semibold text-sm mt-1 hover:underline transition-colors duration-200"
              >
                (14) 3815-1234
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-300 text-sm">
            Seja bem-vindo à família Liga do Bem! 💝
          </p>
        </div>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => setCurrentPage('welcome')}
            className="glass rounded-full p-3 hover:bg-white/20 transition-all duration-300 glow-animation flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-purple-200" />
            <span className="text-purple-200 text-sm">Voltar</span>
          </button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="glass rounded-full p-6 mx-auto w-fit pulse-glow mb-4">
            <img 
              src="/patinha-logo.png" 
              alt="Logo Liga do Bem" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="mb-2">
            <img 
              src="/nome-liga-do-bem.png" 
              alt="Liga do Bem" 
              className="h-12 mx-auto object-contain"
            />
          </div>
          <p className="text-purple-200 text-lg font-medium">Botucatu 🐾</p>
        </div>

        {/* Register Form */}
        <div className="glass border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Criar Conta</h2>
          
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ 
                    ...registerData, 
                    name: e.target.value 
                  })}
                  placeholder="Digite seu nome completo"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* CPF Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                CPF
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="text"
                  value={registerData.cpf}
                  onChange={(e) => setRegisterData({ 
                    ...registerData, 
                    cpf: formatCPF(e.target.value) 
                  })}
                  placeholder="000.000.000-00"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-base font-mono tracking-wide"
                  required
                  maxLength="14"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Senha
              </label>
              <div className="relative">
                <Info className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ 
                    ...registerData, 
                    password: e.target.value 
                  })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  required
                  minLength="6"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Check className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ 
                    ...registerData, 
                    confirmPassword: e.target.value 
                  })}
                  placeholder="Digite a senha novamente"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {registerError && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <X className="h-5 w-5 text-red-300" />
                  <p className="text-red-200 font-medium">{registerError}</p>
                </div>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {registerLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Criando conta...</span>
                </div>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-purple-200 text-sm">
              Já tem uma conta?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-cyan-300 hover:text-cyan-200 font-semibold hover:underline transition-colors duration-200"
              >
                Fazer Login
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-300 text-sm">
            Seja bem-vindo à família Liga do Bem! 💝
          </p>
        </div>
      </div>
    </div>
  );

  const renderCompanyRegister = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="glass rounded-full p-6 mx-auto w-fit pulse-glow mb-4">
            <Building className="h-12 w-12 text-blue-300" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent mb-2">
            Parceiro Empresarial
          </h1>
          <p className="text-purple-200">
            Cadastre sua empresa e faça parte da Liga do Bem
          </p>
        </div>

        {/* Success Message */}
        {companySuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-2xl">
            <div className="flex items-center space-x-3">
              <Check className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-green-300 font-semibold">Cadastro enviado com sucesso!</p>
                <p className="text-green-400 text-sm mt-1">
                  Aguarde a aprovação da administração. Você será contactado em breve.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="glass border border-white/20 rounded-3xl p-8 backdrop-blur-xl">
          {/* Error Message */}
          {companyError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl">
              <div className="flex items-center space-x-3">
                <X className="h-5 w-5 text-red-400" />
                <p className="text-red-300 text-sm">{companyError}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleCompanyRegister} className="space-y-6">
            {/* Company Name Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Nome da Empresa *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData({ 
                    ...companyData, 
                    companyName: e.target.value 
                  })}
                  placeholder="Nome da sua empresa"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* CNPJ Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                CNPJ *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="text"
                  value={companyData.cnpj}
                  onChange={(e) => setCompanyData({ 
                    ...companyData, 
                    cnpj: e.target.value 
                  })}
                  placeholder="00.000.000/0000-00"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Endereço Completo *
              </label>
              <div className="relative">
                <Location className="absolute left-3 top-4 h-5 w-5 text-purple-300" />
                <textarea
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ 
                    ...companyData, 
                    address: e.target.value 
                  })}
                  placeholder="Rua, número, bairro, cidade - CEP"
                  rows={3}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 resize-none"
                  required
                />
              </div>
            </div>

            {/* Phone and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-2">
                  Telefone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                  <input
                    type="tel"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ 
                      ...companyData, 
                      phone: e.target.value 
                    })}
                    placeholder="(14) 99999-9999"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-200 mb-2">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                  <input
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ 
                      ...companyData, 
                      email: e.target.value 
                    })}
                    placeholder="contato@empresa.com"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Discount Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Desconto Oferecido *
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="text"
                  value={companyData.discount}
                  onChange={(e) => setCompanyData({ 
                    ...companyData, 
                    discount: e.target.value 
                  })}
                  placeholder="Ex: 15%, 10% em produtos, R$ 20,00 de desconto"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Category Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Categoria *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <select
                  value={companyData.category}
                  onChange={(e) => setCompanyData({ 
                    ...companyData, 
                    category: e.target.value 
                  })}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none"
                  required
                >
                  <option value="" className="bg-gray-800 text-white">Selecione a categoria</option>
                  <option value="pet shop" className="bg-gray-800 text-white">🛒 Pet Shop</option>
                  <option value="veterinária" className="bg-gray-800 text-white">🏥 Veterinária</option>
                  <option value="agropecuária" className="bg-gray-800 text-white">🌾 Agropecuária</option>
                  <option value="farmácia pet" className="bg-gray-800 text-white">💊 Farmácia Pet</option>
                  <option value="estética" className="bg-gray-800 text-white">🛁 Estética</option>
                </select>
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Descrição dos Serviços (opcional)
              </label>
              <div className="relative">
                <Info className="absolute left-3 top-4 h-5 w-5 text-purple-300" />
                <textarea
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ 
                    ...companyData, 
                    description: e.target.value 
                  })}
                  placeholder="Descreva os produtos/serviços que oferece aos membros da Liga do Bem"
                  rows={3}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {/* Working Hours Section */}
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-4">
                <Clock3 className="inline h-4 w-4 mr-2" />
                Horários de Funcionamento *
              </label>
              <div className="bg-white/5 border border-white/20 rounded-2xl p-4 space-y-3">
                {Object.entries({
                  monday: 'Segunda-feira',
                  tuesday: 'Terça-feira', 
                  wednesday: 'Quarta-feira',
                  thursday: 'Quinta-feira',
                  friday: 'Sexta-feira',
                  saturday: 'Sábado',
                  sunday: 'Domingo'
                }).map(([day, dayName]) => (
                  <div key={day} className="flex items-center space-x-3">
                    <div className="w-28 text-sm text-purple-200 font-medium">
                      {dayName}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!companyData.workingHours[day].closed}
                        onChange={(e) => updateWorkingHours(day, 'closed', !e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white/20 border-white/40 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label className="text-sm text-purple-200">Aberto</label>
                    </div>
                    
                    {!companyData.workingHours[day].closed && (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="time"
                          value={companyData.workingHours[day].open}
                          onChange={(e) => updateWorkingHours(day, 'open', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                        <span className="text-purple-200 text-sm">às</span>
                        <input
                          type="time"
                          value={companyData.workingHours[day].close}
                          onChange={(e) => updateWorkingHours(day, 'close', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                      </div>
                    )}
                    
                    {companyData.workingHours[day].closed && (
                      <div className="flex-1 text-sm text-red-300">
                        Fechado
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={companyLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {companyLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Enviando cadastro...</span>
                </div>
              ) : (
                'Enviar Cadastro'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-purple-200 text-sm">
              <button
                onClick={() => setCurrentPage('welcome')}
                className="text-cyan-300 hover:text-cyan-200 font-semibold hover:underline transition-colors duration-200"
              >
                ← Voltar ao início
              </button>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 glass border border-white/20 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-200 text-sm font-semibold mb-1">Processo de Aprovação</p>
              <p className="text-purple-200 text-xs leading-relaxed">
                Após o envio, nossa equipe analisará sua empresa e entrará em contato em até 2 dias úteis. 
                Empresas aprovadas receberão um certificado digital de parceria.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );



  const renderHeader = () => (
    <div className="glass text-white p-6 flex items-center justify-between relative shadow-2xl border-b border-white/10 z-50">
      {currentPage !== 'home' && (
        <button 
          className="glass rounded-full p-3 hover:bg-white/20 transition-all duration-300 glow-animation focus:outline-none focus:ring-2 focus:ring-purple-300"
          onClick={() => setCurrentPage('home')}
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      )}
      <div className="flex items-center space-x-4 flex-1 justify-center">
        <div className="glass rounded-full p-4 pulse-glow">
          <img 
            src="/patinha-logo.png" 
            alt="Logo Liga do Bem" 
            className="h-8 w-8 object-contain"
          />
        </div>
        <div className="text-center">
          <img 
            src="/nome-liga-do-bem.png" 
            alt="Liga do Bem" 
            className="h-6 mx-auto object-contain"
          />
          <p className="text-sm text-purple-200 font-medium">✨ Botucatu ✨</p>
        </div>
      </div>
      {currentPage === 'home' && (
        <div className="menu-container" ref={menuRef}>
          <div className="glass rounded-full p-3 hover:bg-white/20 transition-all duration-300 glow-animation">
            <Menu 
              className="cursor-pointer h-6 w-6" 
              onClick={handleMenuClick}
              aria-label="Abrir menu de opções"
            />
          </div>
          {showMenu && (
            <div className="menu-dropdown right-0 top-full mt-4 rounded-2xl py-4 min-w-64 overflow-hidden slide-up">
              <button 
                className="w-full text-left px-6 py-4 text-white hover:bg-white/10 flex items-center space-x-4 transition-all duration-300"
                onClick={() => {
                  loadProfileData();
                  setShowProfile(true);
                  setShowMenu(false);
                }}
              >
                <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-3 rounded-xl shadow-lg">
                  <img 
                    src="/icone-usuario.png" 
                    alt="Ícone Usuário" 
                    className="h-[18px] w-[18px] object-contain"
                  />
                </div>
                <span className="font-semibold">Meu Perfil</span>
              </button>
              <button 
                className="w-full text-left px-6 py-4 text-white hover:bg-white/10 flex items-center space-x-4 transition-all duration-300"
                onClick={() => {
                  openWebsite('https://ligadobembotucatu.org.br');
                  setShowMenu(false);
                }}
              >
                <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-xl shadow-lg">
                  <Globe size={18} className="text-white" />
                </div>
                <span className="font-semibold">Visitar Site</span>
              </button>
              <button 
                className="w-full text-left px-6 py-4 text-white hover:bg-white/10 flex items-center space-x-4 transition-all duration-300"
                onClick={() => {
                  makeCall('(14) 3815-1234');
                  setShowMenu(false);
                }}
              >
                <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-3 rounded-xl shadow-lg">
                  <Phone size={18} className="text-white" />
                </div>
                <span className="font-semibold">Entrar em Contato</span>
              </button>
              
              {/* Admin Panel - apenas para administradores */}
              {isAdmin && (
                <button 
                  className="w-full text-left px-6 py-4 text-white hover:bg-white/10 flex items-center space-x-4 transition-all duration-300"
                  onClick={() => {
                    setCurrentPage('admin');
                    setShowMenu(false);
                  }}
                >
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-xl shadow-lg">
                    <Building size={18} className="text-white" />
                  </div>
                  <span className="font-semibold">Administração</span>
                </button>
              )}
              
              <div className="border-t border-white/10 my-2"></div>
              <button 
                className="w-full text-left px-6 py-4 text-white hover:bg-red-500/20 flex items-center space-x-4 transition-all duration-300"
                onClick={handleLogout}
              >
                <div className="bg-gradient-to-br from-red-400 to-red-500 p-3 rounded-xl shadow-lg">
                  <ArrowLeft size={18} className="text-white" />
                </div>
                <span className="font-semibold">Sair</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderHome = () => (
    <div className="p-6 space-y-8 slide-up">
      {/* Welcome Card */}
      <div className="glass text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/30 to-purple-600/30 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/30 to-blue-600/30 rounded-full translate-y-4 -translate-x-4"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="glass rounded-full p-4 pulse-glow">
              <Sparkles className="h-10 w-10 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Olá, {user?.name || 'Usuário'}! ✨
              </h2>
              <p className="text-purple-200 text-lg">Membro desde {user?.memberSince || '2024'}</p>
            </div>
          </div>
          
          <p className="text-xl text-purple-100 mb-6 font-medium">Obrigado por fazer parte da nossa família! 🐾💝</p>
          
          {/* Estatísticas do Usuário */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="glass rounded-2xl p-4 text-center">
              <Award className="h-6 w-6 text-green-300 mx-auto mb-2" />
              <p className="text-green-200 font-semibold text-sm">Status</p>
              <p className="text-green-100 text-xs">Membro Ativo</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Star className="h-6 w-6 text-yellow-300 mx-auto mb-2" />
              <p className="text-yellow-200 font-semibold text-sm">Doações</p>
              <p className="text-yellow-100 text-xs">R$ {user?.totalDonated?.toFixed(2) || '0,00'}</p>
            </div>
          </div>
          
          {/* Badge especial para novos usuários */}
          {(!user?.totalDonated || user?.totalDonated === 0) && (
            <div className="glass rounded-2xl p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="text-cyan-200 font-medium text-sm">Bem-vindo! 🎉</p>
                  <p className="text-cyan-300 text-xs">Explore nossos serviços para começar a ajudar!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-6">
        <button 
          onClick={() => {
            loadProfileData();
            setShowProfile(true);
          }}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <img 
              src="/icone-usuario.png" 
              alt="Ícone Usuário" 
              className="h-10 w-10 object-contain"
            />
          </div>
          <span className="text-white font-bold text-lg">Meu Perfil</span>
        </button>

        <button 
          onClick={() => setCurrentPage('partners')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <Store className="h-10 w-10 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Parceiras</span>
        </button>

        <button 
          onClick={() => setCurrentPage('adoption')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <img 
              src="/icone-adocao.png" 
              alt="Ícone Adoção" 
              className="h-10 w-10 object-contain"
            />
          </div>
          <span className="text-white font-bold text-lg">Adoção</span>
        </button>

        <button 
          onClick={() => setCurrentPage('about')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-teal-400 to-cyan-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <Info className="h-10 w-10 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Sobre</span>
        </button>

        <button 
          onClick={() => setCurrentPage('card')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-purple-400 to-violet-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <CreditCard className="h-10 w-10 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Carteirinha</span>
        </button>

        <button 
          onClick={() => setCurrentPage('donations')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <DollarSign className="h-10 w-10 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Doações</span>
        </button>

        <button 
          onClick={() => setCurrentPage('guide')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-orange-400 to-red-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Guia PET</span>
        </button>

        <button 
          onClick={() => setCurrentPage('legislation')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-slate-400 to-gray-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Legislação</span>
        </button>

        <button 
          onClick={() => setCurrentPage('phones')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-red-400 to-pink-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <Phone className="h-10 w-10 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Telefones</span>
        </button>

        <button 
          onClick={() => setCurrentPage('events')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Eventos</span>
        </button>
      </div>

      {/* Seção de Impacto da Liga do Bem */}
      <div className="glass text-white p-6 rounded-3xl shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent mb-2">
            📊 Nosso Impacto
          </h3>
          <p className="text-purple-200 text-sm">Veja como estamos fazendo a diferença juntos</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4 text-center bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30">
            <Heart className="h-8 w-8 text-green-300 mx-auto mb-2" fill="currentColor" />
            <p className="text-green-200 font-bold text-lg">847</p>
            <p className="text-green-300 text-xs">Animais Resgatados</p>
          </div>
          
          <div className="glass rounded-2xl p-4 text-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
            <User className="h-8 w-8 text-blue-300 mx-auto mb-2" />
            <p className="text-blue-200 font-bold text-lg">2.341</p>
            <p className="text-blue-300 text-xs">Membros Ativos</p>
          </div>
          
          <div className="glass rounded-2xl p-4 text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
            <Store className="h-8 w-8 text-purple-300 mx-auto mb-2" />
            <p className="text-purple-200 font-bold text-lg">156</p>
            <p className="text-purple-300 text-xs">Empresas Parceiras</p>
          </div>
          
          <div className="glass rounded-2xl p-4 text-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
            <DollarSign className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
            <p className="text-yellow-200 font-bold text-lg">R$ 89k</p>
            <p className="text-yellow-300 text-xs">Arrecadado em 2024</p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-purple-200 text-xs italic">
            💝 Dados atualizados em tempo real
          </p>
        </div>
      </div>

      {/* Dica do Dia */}
      <div className="glass text-white p-6 rounded-3xl shadow-2xl border border-white/20 bg-gradient-to-r from-teal-500/20 to-cyan-500/20">
        <div className="flex items-center space-x-3 mb-3">
          <div className="glass rounded-full p-2 bg-gradient-to-br from-teal-400 to-cyan-500">
            <Info className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-teal-200">💡 Dica do Dia</h3>
        </div>
        <p className="text-teal-100 text-sm leading-relaxed">
          Mantenha sempre água fresca disponível para seu pet. No verão, adicione cubos de gelo 
          na vasilha para refrescar! 🧊🐕
        </p>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <User className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-emerald-100">Membro Liga do Bem</p>
            <div className="flex items-center space-x-2 mt-2">
              {user.isActive ? (
                <>
                  <Check className="h-5 w-5 text-emerald-200" />
                  <span className="text-emerald-200 font-medium">Ativo</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-red-300" />
                  <span className="text-red-300 font-medium">Inativo</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center space-x-2">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
            <Info className="h-5 w-5 text-white" />
          </div>
          <span>Informações Pessoais</span>
        </h3>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nome Completo</label>
            <p className="text-lg font-medium text-gray-800 mt-1">{user.name}</p>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4 rounded-xl">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">CPF</label>
            <p className="text-lg font-medium text-gray-800 mt-1">{user.cpf}</p>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-xl">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Membro desde</label>
            <p className="text-lg font-medium text-gray-800 mt-1">{user.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Contribution Card */}
      <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold">Contribuição Total</h3>
          </div>
          <p className="text-4xl font-bold mb-2">R$ {user?.totalDonated?.toFixed(2) || '0.00'}</p>
          <p className="text-amber-100 text-lg">Obrigado por sua generosidade!</p>
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-amber-100">
              Sua contribuição ajuda diretamente na causa animal de Botucatu 🐕🐱
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Carregar empresas aprovadas da API real
  const loadApprovedCompanies = async () => {
    console.log('📱 Carregando empresas aprovadas do servidor...');
    
    try {
      const response = await apiService.getCompanies('approved');
      
      if (response.success) {
        console.log('📊 Empresas aprovadas carregadas:', response.companies.length);
        setApprovedCompanies(response.companies);
      } else {
        console.error('❌ Erro ao carregar empresas aprovadas:', response.message);
        setApprovedCompanies([]);
      }
    } catch (error) {
      console.error('❌ Erro de conexão ao carregar empresas aprovadas:', error);
      setApprovedCompanies([]);
    }
  };

  // Carregar empresas aprovadas quando a página partners for aberta
  useEffect(() => {
    if (currentPage === 'partners') {
      loadApprovedCompanies();
      
      // Removemos a geolocalização automática para evitar notificações duplicadas
      // O usuário pode clicar no botão "Usar minha localização" quando quiser
    }
  }, [currentPage, userLocation, addNotification]);

  const renderPartners = () => (
      <div className="p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Store className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Empresas Parceiras</h2>
              </div>
              
              {/* Botão de Localização */}
              <button
                onClick={getUserLocation}
                disabled={locationLoading}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                {locationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span className="text-sm">Localizando...</span>
                  </>
                ) : userLocation ? (
                  <>
                    <MapPin className="h-4 w-4 text-green-300" />
                    <span className="text-sm">📍 Ativo</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Localizar</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-blue-100 text-lg mb-3">Apresente sua carteirinha e ganhe descontos especiais!</p>
            
            {/* Controles de Localização */}
            {userLocation && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-green-200">Localização ativa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-blue-200">Raio:</label>
                    <select
                      value={selectedRadius}
                      onChange={(e) => setSelectedRadius(Number(e.target.value))}
                      className="bg-white/20 text-white text-xs rounded px-2 py-1 border border-white/30"
                    >
                      <option value={1} className="text-gray-800">1km</option>
                      <option value={5} className="text-gray-800">5km</option>
                      <option value={10} className="text-gray-800">10km</option>
                      <option value={20} className="text-gray-800">20km</option>
                    </select>
                    <button
                      onClick={() => setSortByDistance(!sortByDistance)}
                      className={`text-xs px-2 py-1 rounded ${
                        sortByDistance 
                          ? 'bg-green-500/50 text-green-200' 
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {sortByDistance ? '📍 Por distância' : '📋 Por nome'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center">
              <p className="text-sm text-blue-100">
                {approvedCompanies.length} empresa{approvedCompanies.length !== 1 ? 's' : ''} oferecendo benefícios exclusivos
              </p>
              <button
                onClick={loadApprovedCompanies}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
              >
                🔄 Atualizar
              </button>
            </div>
          </div>
        </div>
        
        {/* Barra de Pesquisa e Filtros */}
        {approvedCompanies.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-emerald-800">Pesquisar Empresas</h3>
            </div>
            
            {/* Campo de Pesquisa Principal */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nome, categoria, bairro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-800 placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtro por Categoria */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Categoria
                </label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-800"
                >
                  <option value="all">Todas as categorias</option>
                  <option value="pet shop">🛒 Pet Shop</option>
                  <option value="veterinária">🏥 Veterinária</option>
                  <option value="agropecuária">🌾 Agropecuária</option>
                  <option value="farmácia pet">💊 Farmácia Pet</option>
                  <option value="estética">🛁 Estética</option>
                </select>
              </div>
              
              {/* Filtro por Desconto */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  <Percent className="h-4 w-4 inline mr-1" />
                  Desconto
                </label>
                <select
                  value={searchDiscount}
                  onChange={(e) => setSearchDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-800"
                >
                  <option value="all">Todos os descontos</option>
                  <option value="low">💚 Até 15%</option>
                  <option value="medium">💛 16% - 25%</option>
                  <option value="high">❤️ Acima de 25%</option>
                </select>
              </div>
            </div>
            
            {/* Indicador de Filtros Ativos */}
            {(searchQuery.trim() || searchCategory !== 'all' || searchDiscount !== 'all') && (
              <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">
                    Filtros ativos: 
                    {searchQuery.trim() && <span className="ml-1 bg-blue-100 px-2 py-1 rounded text-xs">"{searchQuery}"</span>}
                    {searchCategory !== 'all' && <span className="ml-1 bg-blue-100 px-2 py-1 rounded text-xs">{searchCategory}</span>}
                    {searchDiscount !== 'all' && (
                      <span className="ml-1 bg-blue-100 px-2 py-1 rounded text-xs">
                        {searchDiscount === 'low' ? 'Até 15%' : searchDiscount === 'medium' ? '16-25%' : 'Acima 25%'}
                      </span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchCategory('all');
                    setSearchDiscount('all');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>
        )}
        
        {approvedCompanies.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-500/20 p-6 rounded-full mx-auto w-fit mb-4">
              <Store className="h-12 w-12 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Em breve!</h3>
            <p className="text-purple-200">
              Estamos trabalhando para trazer mais empresas parceiras com descontos especiais para você.
            </p>
          </div>
        ) : (
          (() => {
            // Calcular distâncias e filtrar empresas
            let companiesWithDistance = approvedCompanies.map(company => {
              let distance = null;
              if (userLocation && company.coordinates) {
                distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  company.coordinates.lat,
                  company.coordinates.lng
                );
              }
              return { ...company, distance };
            });

            // Filtrar por pesquisa de texto
            if (searchQuery.trim()) {
              const searchLower = searchQuery.toLowerCase().trim();
              companiesWithDistance = companiesWithDistance.filter(company => 
                company.companyName.toLowerCase().includes(searchLower) ||
                company.category.toLowerCase().includes(searchLower) ||
                company.address.toLowerCase().includes(searchLower) ||
                company.description.toLowerCase().includes(searchLower)
              );
            }

            // Filtrar por categoria
            if (searchCategory !== 'all') {
              companiesWithDistance = companiesWithDistance.filter(company => 
                company.category.toLowerCase() === searchCategory.toLowerCase()
              );
            }

            // Filtrar por desconto
            if (searchDiscount !== 'all') {
              companiesWithDistance = companiesWithDistance.filter(company => {
                const discount = parseInt(company.discount);
                switch(searchDiscount) {
                  case 'low': return discount <= 15;
                  case 'medium': return discount > 15 && discount <= 25;
                  case 'high': return discount > 25;
                  default: return true;
                }
              });
            }

            // Filtrar por raio se localização ativa
            if (userLocation) {
              companiesWithDistance = companiesWithDistance.filter(company => 
                !company.distance || company.distance <= selectedRadius
              );
            }

            // Ordenar por distância se solicitado
            if (sortByDistance && userLocation) {
              companiesWithDistance.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
              });
            }

            // Mostrar mensagem se não há empresas encontradas
            if (companiesWithDistance.length === 0) {
              const hasFilters = searchQuery.trim() || searchCategory !== 'all' || searchDiscount !== 'all';
              
              return (
                <div className="text-center py-8">
                  <div className="bg-orange-500/20 p-6 rounded-full mx-auto w-fit mb-4">
                    {hasFilters ? 
                      <Search className="h-12 w-12 text-orange-300" /> : 
                      <MapPin className="h-12 w-12 text-orange-300" />
                    }
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {hasFilters ? 'Nenhum resultado encontrado' : 'Nenhuma empresa encontrada'}
                  </h3>
                  <p className="text-purple-200 mb-4">
                    {hasFilters ? 
                      'Tente ajustar os filtros de pesquisa ou limpar a busca.' :
                      userLocation ? 
                        `Não encontramos empresas parceiras em um raio de ${selectedRadius}km da sua localização.` :
                        'Não há empresas parceiras disponíveis no momento.'
                    }
                  </p>
                  <div className="flex justify-center space-x-3">
                    {hasFilters && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSearchCategory('all');
                          setSearchDiscount('all');
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    )}
                    {userLocation && !hasFilters && (
                      <button
                        onClick={() => setSelectedRadius(20)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Expandir para 20km
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return companiesWithDistance.map((company) => {
              // Função para obter cores e ícones baseados na categoria
              const getCategoryStyle = (category) => {
                switch(category?.toLowerCase()) {
                  case 'pet shop':
                    return {
                      gradient: 'from-pink-500 to-purple-600',
                      icon: '🛒',
                      color: 'pink'
                    };
                  case 'veterinária':
                    return {
                      gradient: 'from-emerald-500 to-teal-600',
                      icon: '🏥', 
                      color: 'emerald'
                    };
                  case 'agropecuária':
                    return {
                      gradient: 'from-amber-500 to-orange-600',
                      icon: '🌾',
                      color: 'amber'
                    };
                  case 'farmácia pet':
                    return {
                      gradient: 'from-blue-500 to-indigo-600',
                      icon: '💊',
                      color: 'blue'
                    };
                  case 'estética':
                    return {
                      gradient: 'from-violet-500 to-purple-600',
                      icon: '🛁',
                      color: 'violet'
                    };
                  default:
                    return {
                      gradient: 'from-gray-500 to-slate-600',
                      icon: '🏪',
                      color: 'gray'
                    };
                }
              };

              const categoryStyle = getCategoryStyle(company.category);
              const isOpen = isCompanyOpen(company.workingHours);

              return (
                <div key={company.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden mb-6">
                  
                  {/* Header Section - Logo + Nome */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center space-x-4">
                      
                      {/* Logo da Empresa */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={`Logo ${company.companyName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`bg-gradient-to-r ${categoryStyle.gradient} w-full h-full flex items-center justify-center`}>
                            <span className="text-2xl">{categoryStyle.icon}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Nome da Empresa */}
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-800">{company.companyName}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Promoções Section */}
                  <PromotionsSection promotions={company.promotions} />

                  {/* Categoria e Status Section */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center justify-between">
                      
                      {/* Categoria (Esquerda) */}
                      <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${categoryStyle.gradient} shadow-md`}>
                        <span className="mr-2">{categoryStyle.icon}</span>
                        {company.category}
                      </span>
                      
                      {/* Status + Distância (Direita) */}
                      <div className="flex items-center space-x-3">
                        {/* Distance Badge */}
                        {company.distance !== null && !isNaN(company.distance) && (
                          <span className={`inline-flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium ${
                            company.distance <= 1 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : company.distance <= 5 
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            <MapPin className="h-4 w-4" />
                            <span>{formatDistance(company.distance)}</span>
                          </span>
                        )}
                        
                        {/* Status Badge */}
                        {isOpen !== null && (
                          <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-bold ${
                            isOpen 
                              ? 'bg-green-500 text-white shadow-md' 
                              : 'bg-red-500 text-white shadow-md'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-white animate-pulse' : 'bg-white/70'}`}></div>
                            <span>{isOpen ? 'ABERTO' : 'FECHADO'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resto do Conteúdo (mantém como está) */}
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left Column - Basic Info */}
                      <div className="space-y-3">
                        {/* Address */}
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Endereço</p>
                            <p className="text-gray-700 text-sm">
                              {typeof company.address === 'string' 
                                ? company.address 
                                : `${company.address?.street || ''}, ${company.address?.city || 'Botucatu'}, ${company.address?.state || 'SP'}`
                              }
                            </p>
                          </div>
                        </div>
                        
                        {/* Phone */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Contato</p>
                            <button 
                              onClick={() => makeCall(company.phone)}
                              className="text-gray-800 font-medium hover:text-blue-600 transition-colors duration-200 hover:underline text-sm"
                            >
                              {company.phone}
                            </button>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Info className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Sobre</p>
                            <p className="text-gray-700 text-sm">{company.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Working Hours */}
                      {company.workingHours && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-3">
                            <Clock3 className="h-4 w-4 text-gray-600" />
                            <p className="text-xs font-medium text-gray-500 uppercase">Horário de Funcionamento</p>
                          </div>
                          
                          <div className="space-y-1">
                            {formatWorkingHours(company.workingHours).map((dayInfo, index) => {
                              const today = new Date().getDay();
                              const dayIndex = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].indexOf(dayInfo.day.toLowerCase());
                              const isToday = dayIndex === today;
                              
                              return (
                                <div key={index} className={`flex justify-between items-center py-1 px-2 rounded ${
                                  isToday ? `bg-gradient-to-r ${categoryStyle.gradient} text-white text-xs font-medium` : 'text-xs'
                                }`}>
                                  <span className={isToday ? 'text-white' : 'text-gray-600'}>
                                    {dayInfo.day}
                                  </span>
                                  <span className={`font-medium ${
                                    isToday 
                                      ? 'text-white' 
                                      : dayInfo.hours === 'Fechado' 
                                      ? 'text-red-500' 
                                      : 'text-gray-700'
                                  }`}>
                                    {dayInfo.hours}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-6">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openNavigation(company)}
                        className={`flex-1 bg-gradient-to-r ${categoryStyle.gradient} text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:scale-[1.02]`}
                      >
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">Como Chegar</span>
                      </button>
                      
                      <button
                        onClick={() => makeCall(company.phone)}
                        className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">Ligar</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          })()
        )}
      
      {/* Info Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Info className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-800 mb-2">Como usar os descontos</h4>
            <p className="text-emerald-700 text-sm">
              <strong>1.</strong> Apresente sua carteirinha digital na empresa parceira<br/>
              <strong>2.</strong> Informe que é membro da Liga do Bem<br/>
              <strong>3.</strong> Aproveite o desconto especial!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdoption = () => (
    <div className="p-4 space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-orange-800 mb-4">Adoção Responsável</h3>
        <p className="text-orange-700 mb-4">
          Adotar um animal é um ato de amor que transforma vidas. Antes de adotar, considere:
        </p>
        <ul className="space-y-2 text-orange-700">
          <li>• Você tem tempo para cuidar do animal?</li>
          <li>• Sua família está preparada?</li>
          <li>• Você tem condições financeiras para mantê-lo?</li>
          <li>• Seu espaço é adequado?</li>
        </ul>
      </div>

      <button 
        onClick={() => openWebsite('https://ligadobembotucatu.org.br/adocao')}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        Ver Animais Disponíveis no Site
      </button>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Processo de Adoção</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
            <p>Escolha o animal no nosso site</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
            <p>Preencha o formulário de adoção</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
            <p>Entrevista com nossa equipe</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
            <p>Conhece o animal pessoalmente</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">5</span>
            <p>Finalização da adoção</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="p-4 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Nossa História</h3>
        <p className="text-gray-700 leading-relaxed">
          A Liga do Bem Botucatu foi fundada em 2015 com o objetivo de promover o bem-estar animal 
          e combater o abandono e maus-tratos. Nossa missão é resgatar, cuidar e encontrar lares 
          amorosos para animais em situação de vulnerabilidade.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">347</p>
          <p className="text-sm text-blue-700">Animais Resgatados em 2024</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">892</p>
          <p className="text-sm text-purple-700">Castrações em 2024</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">156</p>
          <p className="text-sm text-orange-700">Animais Chipados em 2024</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">234</p>
          <p className="text-sm text-green-700">Adoções Realizadas em 2024</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Certificados e Reconhecimentos</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• CNPJ: 12.345.678/0001-90</li>
          <li>• Certificado de Utilidade Pública Municipal</li>
          <li>• Registro no CMDCA - Botucatu</li>
          <li>• Parceria com Prefeitura Municipal</li>
        </ul>
      </div>
    </div>
  );

  const renderCard = () => (
    <div className="p-4">
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold">CARTEIRINHA</h3>
            <p className="text-sm opacity-90">Amigo da Liga</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Status</p>
            <div className="flex items-center space-x-1">
              {user.isActive ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-bold">ATIVO</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  <span className="text-sm font-bold">INATIVO</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm opacity-75">Nome</p>
            <p className="text-lg font-bold">{user.name}</p>
          </div>
          
          <div>
            <p className="text-sm opacity-75">CPF</p>
            <p className="font-mono">{user.cpf}</p>
          </div>
          
          <div>
            <p className="text-sm opacity-75">Membro desde</p>
            <p>{user.memberSince}</p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-green-500">
          <p className="text-xs text-center opacity-75">
            Apresente esta carteirinha nas empresas parceiras para receber seu desconto
          </p>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Como usar:</strong> Apresente esta tela para o vendedor no momento da compra 
          para validar seu desconto como contribuinte ativo da Liga do Bem.
        </p>
      </div>
    </div>
  );

  const renderDonations = () => (
    <div className="p-4 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Suas Doações</h3>
        <div className="space-y-3">
          {donations.map((donation, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium">R$ {donation.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{donation.method}</p>
              </div>
              <p className="text-sm text-gray-600">{new Date(donation.date).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-green-800 mb-4">Fazer uma Doação PIX</h3>
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Chave PIX (CNPJ)</p>
          <p className="font-mono text-lg">12.345.678/0001-90</p>
          <p className="text-sm text-gray-600 mt-2">Liga do Bem Botucatu</p>
        </div>
        <button 
          className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          onClick={() => {
            navigator.clipboard.writeText('12.345.678/0001-90').then(() => {
              alert('Chave PIX copiada para a área de transferência!');
            }).catch(() => {
              alert('Erro ao copiar. Chave PIX: 12.345.678/0001-90');
            });
          }}
        >
          Copiar Chave PIX
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-4">Doe seu Cupom Fiscal</h3>
        <p className="text-blue-700 mb-4">
          Você pode doar seus cupons fiscais para a Liga do Bem! É simples e ajuda muito nossa causa.
        </p>
        <button 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg mb-2 hover:bg-blue-700 transition-colors"
          onClick={() => openWebsite('https://www.youtube.com/watch?v=exemplo-cupom-fiscal', 'video-tutorial')}
        >
          Ver Vídeo Tutorial
        </button>
        <p className="text-xs text-blue-600">
          Assista ao vídeo e aprenda como doar seus cupons em poucos passos.
        </p>
      </div>
    </div>
  );

  const renderGuide = () => (
    <div className="p-4 space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-blue-600">💉 Vacinação</h3>
        <p className="text-gray-700 leading-relaxed">
          A vacinação é essencial para proteger seu pet contra doenças graves. Cães devem receber 
          a vacina V8 ou V10, e gatos a tríplice felina. Mantenha sempre o cartão de vacinação atualizado.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-purple-600">✂️ Importância da Castração</h3>
        <p className="text-gray-700 leading-relaxed">
          A castração previne doenças, reduz o abandono e controla a população de animais. 
          É um procedimento seguro que traz benefícios para a saúde e comportamento do seu pet.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-green-600">🔍 Microchipagem</h3>
        <p className="text-gray-700 leading-relaxed">
          O microchip é a forma mais segura de identificação. Em caso de perda, facilita 
          o reencontro com o tutor. É obrigatório em muitas cidades e ajuda a combater o abandono.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-orange-600">🏠 Cuidados Básicos</h3>
        <p className="text-gray-700 leading-relaxed">
          Alimentação balanceada, água sempre disponível, exercícios regulares, higiene dental, 
          escovação do pelo e ambiente seguro são fundamentais para o bem-estar do seu animal.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-red-600">🛡️ Prevenção de Doenças</h3>
        <p className="text-gray-700 leading-relaxed">
          Use antipulgas e vermífugos regularmente. Observe mudanças no comportamento, 
          apetite ou disposição. Consultas veterinárias preventivas são essenciais.
        </p>
      </div>
    </div>
  );

  const renderLegislation = () => (
    <div className="p-4 space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3">Lei Federal 9.605/98</h3>
        <p className="text-gray-700 mb-3">
          Lei de Crimes Ambientais - Estabelece sanções penais para condutas lesivas aos animais.
        </p>
        <button 
          onClick={() => openWebsite('https://www.planalto.gov.br/ccivil_03/leis/l9605.htm')}
          className="text-blue-600 text-sm hover:underline cursor-pointer"
        >
          Ver legislação completa →
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3">Lei Federal 14.064/20</h3>
        <p className="text-gray-700 mb-3">
          Aumenta as penas para crimes de maus-tratos contra cães e gatos.
        </p>
        <button 
          onClick={() => openWebsite('https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l14064.htm')}
          className="text-blue-600 text-sm hover:underline cursor-pointer"
        >
          Ver legislação completa →
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3">Decreto Federal 6.514/08</h3>
        <p className="text-gray-700 mb-3">
          Regulamenta infrações e sanções administrativas ao meio ambiente, incluindo fauna.
        </p>
        <button 
          onClick={() => openWebsite('https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/decreto/d6514.htm')}
          className="text-blue-600 text-sm hover:underline cursor-pointer"
        >
          Ver legislação completa →
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3">Lei Municipal de Botucatu</h3>
        <p className="text-gray-700 mb-3">
          Legislação municipal específica sobre proteção animal e controle populacional.
        </p>
        <button 
          onClick={() => openWebsite('https://www.botucatu.sp.gov.br/legislacao')}
          className="text-blue-600 text-sm hover:underline cursor-pointer"
        >
          Ver legislação completa →
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Importante:</strong> Maus-tratos contra animais é crime! Denuncie pelos 
          telefones úteis disponíveis no app.
        </p>
      </div>
    </div>
  );

  const renderPhones = () => (
    <div className="p-4 space-y-4">
      {phoneNumbers.map((item, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{item.service}</h3>
              <p className="text-gray-600">{item.number}</p>
            </div>
            <button 
              onClick={() => makeCall(item.number)}
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-bold text-red-800 mb-2">Em caso de emergência:</h3>
        <p className="text-red-700 text-sm">
          Para situações de maus-tratos ou abandono, ligue imediatamente para a Polícia Ambiental 
          ou Bombeiros. Sua denúncia pode salvar uma vida!
        </p>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="p-4 space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-lg">{event.title}</h3>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {new Date(event.date).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 mt-0.5" />
              <span>{event.location}</span>
            </div>
          </div>
          
          <p className="text-gray-700">{event.description}</p>
          
          <button 
            onClick={() => openWebsite('https://ligadobembotucatu.org.br/eventos', `event-${event.id}`)}
            disabled={loadingButton === `event-${event.id}`}
            className={`mt-4 w-full py-2 px-4 rounded-lg transition-colors ${
              loadingButton === `event-${event.id}`
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
            } text-white`}
          >
            {loadingButton === `event-${event.id}` ? 'Abrindo...' : 'Mais Informações'}
          </button>
        </div>
      ))}
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 text-sm">
          <strong>Fique por dentro!</strong> Acompanhe nossos eventos e seja parte da mudança 
          na vida dos animais de Botucatu.
        </p>
      </div>
    </div>
  );

  // Funções de administração
  const loadAdminCompanies = async () => {
    setAdminLoading(true);
    try {
      const response = await apiService.getCompanies(); // Buscar todas as empresas
      if (response.success) {
        setAdminCompanies(response.companies);
        console.log('📊 Empresas carregadas para admin:', response.companies.length);
      } else {
        addNotification('Erro ao carregar empresas', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      addNotification('Erro de conexão', 'error');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleApproveCompany = async (companyId) => {
    try {
      const response = await apiService.approveCompany(companyId);
      if (response.success) {
        addNotification('Empresa aprovada com sucesso!', 'success');
        loadAdminCompanies(); // Recarregar lista
      } else {
        addNotification('Erro ao aprovar empresa', 'error');
      }
    } catch (error) {
      console.error('Erro ao aprovar empresa:', error);
      addNotification('Erro de conexão', 'error');
    }
  };

  const handleRejectCompany = async (companyId) => {
    try {
      const response = await apiService.rejectCompany(companyId);
      if (response.success) {
        addNotification('Empresa rejeitada', 'info');
        loadAdminCompanies(); // Recarregar lista
      } else {
        addNotification('Erro ao rejeitar empresa', 'error');
      }
    } catch (error) {
      console.error('Erro ao rejeitar empresa:', error);
      addNotification('Erro de conexão', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Aprovada';
      case 'rejected':
        return 'Rejeitada';
      case 'pending':
      default:
        return 'Pendente';
    }
  };

  // Renderizar painel de administração
  const renderAdmin = () => (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 p-4 rounded-2xl mx-auto w-fit mb-4 shadow-lg">
          <Building className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Administração</h2>
        <p className="text-purple-200">Gerencie empresas parceiras e suas informações</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={loadAdminCompanies}
          disabled={adminLoading}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {adminLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Carregando...</span>
            </div>
          ) : (
            'Atualizar Lista'
          )}
        </button>
      </div>

      {/* Lista de Empresas */}
      {adminCompanies.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">
            Empresas Cadastradas ({adminCompanies.length})
          </h3>
          
          {adminCompanies.map((company) => (
            <div key={company.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              {/* Header da Empresa */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{company.companyName}</h4>
                    <p className="text-purple-200 text-sm">CNPJ: {company.cnpj}</p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(company.status)}`}>
                  {getStatusText(company.status)}
                </span>
              </div>

              {/* Informações da Empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-purple-200 text-sm mb-1">📍 Endereço</p>
                  <p className="text-white text-sm">
                    {typeof company.address === 'string' 
                      ? company.address 
                      : `${company.address?.street || ''}, ${company.address?.city || 'Botucatu'}, ${company.address?.state || 'SP'}`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">📞 Telefone</p>
                  <p className="text-white text-sm">{company.phone}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">📧 Email</p>
                  <p className="text-white text-sm">{company.email}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">🏷️ Categoria</p>
                  <p className="text-white text-sm">{company.category}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm mb-1">💰 Desconto</p>
                  <p className="text-white text-sm">{company.discount}%</p>
                </div>
              </div>

              {/* Ações */}
              {company.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleApproveCompany(company.id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    onClick={() => handleRejectCompany(company.id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    ❌ Rejeitar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowAdminModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    ✏️ Editar
                  </button>
                </div>
              )}

              {company.status === 'approved' && (
                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowAdminModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    ✏️ Editar Informações
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !adminLoading && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-purple-200 mb-4">Clique em "Atualizar Lista" para carregar as empresas cadastradas.</p>
          </div>
        )
      )}
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'welcome': return renderWelcome();
      case 'login': return renderLogin();
      case 'register': return renderRegister();
      case 'companyRegister': return renderCompanyRegister();

      case 'home': return renderHome();
      case 'profile': return renderProfile();
      case 'partners': return renderPartners();
      case 'adoption': return renderAdoption();
      case 'about': return renderAbout();
      case 'card': return renderCard();
      case 'donations': return renderDonations();
      case 'guide': return renderGuide();
      case 'legislation': return renderLegislation();
      case 'phones': return renderPhones();
      case 'events': return renderEvents();
      case 'admin': return <AdminApp />;
      default: return renderWelcome();
    }
  };

  // Se não estiver autenticado, mostrar páginas de welcome/login/register
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">
        {/* Background animado */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 float-animation"></div>
          <div className="absolute top-32 right-8 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full opacity-30 float-animation" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-20 left-6 w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full opacity-25 float-animation" style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {renderCurrentPage()}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">
      {/* Background animado */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 float-animation"></div>
        <div className="absolute top-32 right-8 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full opacity-30 float-animation" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-20 left-6 w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full opacity-25 float-animation" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Sistema de Notificações Aprimorado */}
      <div className="fixed top-6 right-6 z-50 space-y-4 max-w-sm w-full notification-container sm:max-w-sm">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`
              notification-card notification-hover relative overflow-hidden rounded-2xl shadow-2xl 
              transform transition-all duration-500 ease-out backdrop-blur-md
              ${index === 0 ? 'animate-slideInRight' : ''}
              ${notification.type === 'success' 
                ? 'bg-gradient-to-br from-green-50/95 via-emerald-50/95 to-green-100/95 border border-green-200/70 notification-success' 
                : notification.type === 'error' 
                ? 'bg-gradient-to-br from-red-50/95 via-pink-50/95 to-red-100/95 border border-red-200/70 notification-error' 
                : notification.type === 'warning' 
                ? 'bg-gradient-to-br from-amber-50/95 via-yellow-50/95 to-amber-100/95 border border-amber-200/70 notification-warning' 
                : 'bg-gradient-to-br from-blue-50/95 via-indigo-50/95 to-blue-100/95 border border-blue-200/70 notification-info'
              }
              cursor-pointer hover:shadow-3xl
            `}
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          >
            {/* Barra de Progresso */}
            <div 
              className={`
                absolute top-0 left-0 h-1 animate-shrink
                ${notification.type === 'success' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                  notification.type === 'error' ? 'bg-gradient-to-r from-red-400 to-pink-500' :
                  notification.type === 'warning' ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                  'bg-gradient-to-r from-blue-400 to-indigo-500'
                }
              `}
              style={{
                width: '100%',
                animation: 'shrink 5s linear forwards'
              }}
            />

            {/* Conteúdo da Notificação */}
            <div className="p-4">
              <div className="flex items-start space-x-3">
                {/* Ícone com Background Colorido */}
                <div className={`
                  flex-shrink-0 p-2 rounded-full
                  ${notification.type === 'success' ? 'bg-green-100' :
                    notification.type === 'error' ? 'bg-red-100' :
                    notification.type === 'warning' ? 'bg-amber-100' :
                    'bg-blue-100'
                  }
                `}>
                  {notification.type === 'success' && <Check className="h-5 w-5 text-green-600" />}
                  {notification.type === 'error' && <X className="h-5 w-5 text-red-600" />}
                  {notification.type === 'warning' && <Info className="h-5 w-5 text-amber-600" />}
                  {notification.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                </div>

                {/* Mensagem */}
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm font-medium leading-relaxed notification-text
                    ${notification.type === 'success' ? 'text-green-800' :
                      notification.type === 'error' ? 'text-red-800' :
                      notification.type === 'warning' ? 'text-amber-800' :
                      'text-blue-800'
                    }
                  `}>
                    {notification.message}
                  </p>
                </div>

                {/* Botão de Fechar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                  }}
                  className={`
                    notification-close flex-shrink-0 p-1.5 rounded-full transition-colors duration-200
                    ${notification.type === 'success' ? 'text-green-400 hover:text-green-600 hover:bg-green-100/80' :
                      notification.type === 'error' ? 'text-red-400 hover:text-red-600 hover:bg-red-100/80' :
                      notification.type === 'warning' ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-100/80' :
                      'text-blue-400 hover:text-blue-600 hover:bg-blue-100/80'
                    }
                  `}
                  aria-label="Fechar notificação"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Efeito de Brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full animate-shine"></div>
          </div>
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {renderHeader()}
        <div className="pb-6">
          {renderCurrentPage()}
        </div>
      </div>

      {/* Modal de Reset de Senha */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Recuperar Senha</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email cadastrado
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              {resetMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  resetMessage.includes('receberá') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {resetMessage}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {resetLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail('');
                    setResetMessage('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Perfil */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Meu Perfil</h3>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={user?.cpf || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">CPF não pode ser alterado</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(14) 99999-9999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rua, número, bairro"
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfile(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Empresa - Admin */}
      {showAdminModal && selectedCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* BANNER DE TESTE */}
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
            <strong>🆕 MODAL DE EDIÇÃO EMPRESAS - VERSÃO INTEGRADA v2.0</strong>
          </div>
          
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-80" onClick={() => setShowAdminModal(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border-2 border-blue-200"
                 onClick={(e) => e.stopPropagation()}>
              
              <div className="bg-gradient-to-br from-white to-blue-50 px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Building className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        🆕 NOVO Modal de Edição Empresas v2.0
                      </h3>
                      <p className="text-sm text-red-600 font-bold">
                        ✅ Modal integrado com upload de logo e horários!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAdminModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedCompany.companyName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedCompany.cnpj}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedCompany.address}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedCompany.phone}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={selectedCompany.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desconto Oferecido
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedCompany.discount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 10% em rações premium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      defaultValue={selectedCompany.description}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva os produtos e serviços oferecidos..."
                    />
                  </div>

                  {/* NOVA SEÇÃO: UPLOAD DE LOGO */}
                  <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="inline h-4 w-4 mr-2" />
                      🆕 Logo da Empresa (NOVO!)
                    </label>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-20 w-20 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                          <Building className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Building className="h-4 w-4 mr-2" />
                          Escolher Logo
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          JPG, PNG ou SVG. Máximo 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* NOVA SEÇÃO: HORÁRIOS DE FUNCIONAMENTO */}
                  <div className="md:col-span-2 bg-green-50 border border-green-200 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Clock className="inline h-4 w-4 mr-2" />
                      🆕 Horários de Funcionamento (NOVO!)
                    </label>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      {[
                        { day: 'Segunda-feira', key: 'monday' },
                        { day: 'Terça-feira', key: 'tuesday' },
                        { day: 'Quarta-feira', key: 'wednesday' },
                        { day: 'Quinta-feira', key: 'thursday' },
                        { day: 'Sexta-feira', key: 'friday' },
                        { day: 'Sábado', key: 'saturday' },
                        { day: 'Domingo', key: 'sunday' }
                      ].map(({ day, key }) => (
                        <div key={key} className="flex items-center space-x-4">
                          <div className="w-24 text-sm font-medium text-gray-700">
                            {day}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              defaultChecked={key !== 'sunday'}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-600">Aberto</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">De:</span>
                            <input
                              type="time"
                              defaultValue="08:00"
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Até:</span>
                            <input
                              type="time"
                              defaultValue={key === 'saturday' || key === 'sunday' ? '12:00' : '18:00'}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    alert('💾 Funcionalidade de salvar será implementada aqui!');
                    setShowAdminModal(false);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;