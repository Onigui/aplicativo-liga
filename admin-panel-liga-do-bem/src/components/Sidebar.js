import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Visão Geral'
    },
    {
      path: '/users',
      icon: Users,
      label: 'Usuários',
      description: 'Gerenciar Membros'
    },
    {
      path: '/payments',
      icon: CreditCard,
      label: 'Pagamentos',
      description: 'Aprovar/Rejeitar'
    },
    {
      path: '/reports',
      icon: BarChart3,
      label: 'Relatórios',
      description: 'Analytics'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Configurações',
      description: 'Sistema'
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-admin-600 rounded-lg p-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Liga do Bem</h1>
                <p className="text-xs text-gray-500">Painel Admin</p>
              </div>
            </div>
          )}
          
          {!isOpen && (
            <div className="mx-auto">
              <div className="bg-gradient-to-br from-primary-500 to-admin-600 rounded-lg p-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-admin-50 text-admin-700 border-l-4 border-admin-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
                  
                  {isOpen && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {!isOpen && (
                    <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      {isOpen && (
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-primary-50 to-admin-50 rounded-lg p-4 border border-primary-200">
            <div className="text-center">
              <Heart className="h-8 w-8 text-primary-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Liga do Bem
              </h3>
              <p className="text-xs text-gray-600">
                Fazendo a diferença na vida dos animais de Botucatu! 🐾
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;