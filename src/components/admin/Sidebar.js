import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Heart,
  Building
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const menuItems = [
    {
      path: '/admin/dashboard', // rota do frontend, não precisa mudar
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Visão Geral'
    },
    {
      path: '/admin/users', // rota do frontend, não precisa mudar
      icon: Users,
      label: 'Usuários',
      description: 'Gerenciar Membros'
    },
    {
      path: '/admin/payments', // rota do frontend, não precisa mudar
      icon: CreditCard,
      label: 'Pagamentos',
      description: 'Aprovar/Rejeitar'
    },
    {
      path: '/admin/companies', // rota do frontend, não precisa mudar
      icon: Building,
      label: 'Empresas',
      description: 'Gerenciar Parceiras'
    },
    {
      path: '/admin/reports', // rota do frontend, não precisa mudar
      icon: BarChart3,
      label: 'Relatórios',
      description: 'Analytics'
    },
    {
      path: '/admin/settings', // rota do frontend, não precisa mudar
      icon: Settings,
      label: 'Configurações',
      description: 'Sistema'
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-screen bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 w-64">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary-500 to-admin-600 rounded-lg p-2">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Liga do Bem</h1>
            <p className="text-xs text-gray-500">Painel Admin</p>
          </div>
        </div>
      </div>

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
                  <Icon className="h-5 w-5 flex-shrink-0 mr-3" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.description}
                    </p>
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>


    </div>
  );
};

export default Sidebar;