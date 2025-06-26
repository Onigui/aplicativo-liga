import React, { useState, useEffect, useRef } from 'react';
import { User, Store, Heart, Info, CreditCard, DollarSign, BookOpen, Phone, Calendar, Menu, ArrowLeft, MapPin, Clock, Instagram, Globe, Check, X, Sparkles, Star, Award } from 'lucide-react';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [loadingButton, setLoadingButton] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [user] = useState({
    name: 'João Silva',
    cpf: '123.456.789-00',
    isActive: true,
    memberSince: '2023',
    totalDonated: 850.50
  });

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

  // Dados mock das empresas parceiras
  const partnerCompanies = [
    {
      id: 1,
      name: 'Pet Shop Amigo Fiel',
      discount: '15%',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(14) 3322-1234',
      hours: 'Seg-Sex: 8h-18h | Sáb: 8h-12h',
      instagram: '@petshopamigofiel',
      website: 'www.amigofiel.com.br'
    },
    {
      id: 2,
      name: 'Clínica Veterinária VidaPet',
      discount: '20%',
      address: 'Av. Dom Lúcio, 456 - Vila Assunção',
      phone: '(14) 3333-5678',
      hours: 'Seg-Sex: 7h-19h | Sáb: 8h-16h',
      instagram: '@clinicavidapet',
      website: null
    },
    {
      id: 3,
      name: 'Ração & Cia',
      discount: '10%',
      address: 'Rua Amando de Barros, 789 - Vila Independência',
      phone: '(14) 3344-9012',
      hours: 'Seg-Sáb: 8h-17h',
      instagram: '@racaoecia',
      website: 'www.racaoecia.com.br'
    }
  ];

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

  const renderHeader = () => (
    <div className="glass text-white p-6 flex items-center justify-between relative shadow-2xl border-b border-white/10">
      {currentPage !== 'home' && (
        <div className="glass rounded-full p-3 hover:bg-white/20 transition-all duration-300 glow-animation">
          <ArrowLeft 
            className="cursor-pointer h-6 w-6" 
            onClick={() => setCurrentPage('home')}
            aria-label="Voltar para página inicial"
          />
        </div>
      )}
      <div className="flex items-center space-x-4 flex-1 justify-center">
        <div className="glass rounded-full p-4 pulse-glow">
          <Heart className="h-8 w-8 text-pink-300" fill="currentColor" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            Liga do Bem
          </h1>
          <p className="text-sm text-purple-200 font-medium">✨ Botucatu ✨</p>
        </div>
      </div>
      {currentPage === 'home' && (
        <div className="relative" ref={menuRef}>
          <div className="glass rounded-full p-3 hover:bg-white/20 transition-all duration-300 glow-animation">
            <Menu 
              className="cursor-pointer h-6 w-6" 
              onClick={handleMenuClick}
              aria-label="Abrir menu de opções"
            />
          </div>
          {showMenu && (
            <div className="absolute right-0 top-full mt-4 glass rounded-2xl shadow-2xl py-4 min-w-64 z-50 overflow-hidden border border-white/20 slide-up">
              <button 
                className="w-full text-left px-6 py-4 text-white hover:bg-white/10 flex items-center space-x-4 transition-all duration-300"
                onClick={() => {
                  setCurrentPage('profile');
                  setShowMenu(false);
                }}
              >
                <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-3 rounded-xl shadow-lg">
                  <User size={18} className="text-white" />
                </div>
                <span className="font-semibold">Ver Perfil</span>
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
                Olá, {user.name}! ✨
              </h2>
              <p className="text-purple-200 text-lg">Membro desde {user.memberSince}</p>
            </div>
          </div>
          
          <p className="text-xl text-purple-100 mb-6 font-medium">Obrigado por fazer parte da nossa família! 🐾💝</p>
          
          <div className="flex items-center space-x-4">
            <div className="glass rounded-2xl px-4 py-3 flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-300" />
              <span className="text-green-200 font-medium">Status: Ativo</span>
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-300" />
              <span className="text-yellow-200 font-medium">R$ {user.totalDonated.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-6">
        <button 
          onClick={() => setCurrentPage('profile')}
          className="group glass p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-white/20 border border-white/20 glow-animation"
        >
          <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-125 transition-transform duration-500 shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Perfil</span>
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
            <Heart className="h-10 w-10 text-white" fill="currentColor" />
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
          <p className="text-4xl font-bold mb-2">R$ {user.totalDonated.toFixed(2)}</p>
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

  const renderPartners = () => (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Empresas Parceiras</h2>
          </div>
          <p className="text-blue-100 text-lg">Apresente sua carteirinha e ganhe descontos especiais!</p>
        </div>
      </div>
      
      {partnerCompanies.map((company) => (
        <div key={company.id} className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl">
                <Store className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-800">{company.name}</h3>
            </div>
            <div className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-4 py-2 rounded-full shadow-lg">
              <span className="text-sm font-bold">{company.discount} OFF</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Endereço</label>
                <p className="text-gray-800 font-medium">{company.address}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-xl flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Telefone</label>
                <button 
                  type="button"
                  className="block text-green-600 font-medium hover:text-green-700 hover:underline bg-transparent border-none p-0 font-inherit cursor-pointer transition-colors duration-200" 
                  onClick={() => makeCall(company.phone)}
                >
                  {company.phone}
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4 rounded-xl flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Horário</label>
                <p className="text-gray-800 font-medium">{company.hours}</p>
              </div>
            </div>
            
            {(company.instagram || company.website) && (
              <div className="flex items-center space-x-4 pt-2">
                {company.instagram && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 px-3 py-2 rounded-xl">
                    <div className="bg-pink-100 p-1 rounded-lg">
                      <Instagram className="h-4 w-4 text-pink-600" />
                    </div>
                    <span className="text-pink-700 text-sm font-medium">{company.instagram}</span>
                  </div>
                )}
                
                {company.website && (
                  <button 
                    type="button"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                    onClick={() => openWebsite(company.website)}
                  >
                    <div className="bg-blue-100 p-1 rounded-lg">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-blue-700 text-sm font-medium hover:underline">{company.website}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      
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

  const renderCurrentPage = () => {
    switch (currentPage) {
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
      default: return renderHome();
    }
  };

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
        {renderHeader()}
        <div className="pb-6">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
};

export default App;