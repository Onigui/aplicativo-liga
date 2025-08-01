// Configuração da API - Liga do Bem 
// Este arquivo centraliza todas as URLs da API 
 
// Detectar se está rodando no app móvel ou no navegador 
const isApp = window.location.protocol === 'file:' || 
              window.location.protocol === 'capacitor:' || 
              window.location.protocol === 'ionic:' || 
              window.Capacitor?.isNativePlatform(); 
 
// IP local detectado automaticamente 
const getLocalIP = () => { 
  return '192.168.0.21'; // IP detectado automaticamente 
}; 
 
// URLs da API para diferentes ambientes 
const API_URLS = { 
  // Desenvolvimento local (navegador) 
  development: 'http://localhost:3001', 
  
  // Produção online (Render) - Backend real
  production: 'https://liga-do-bem-api.onrender.com', 
  
  // Rede local (para testes na mesma rede) 
  local_network: `http://${getLocalIP()}:3001`, 
  
  // App móvel (APK/PWA) - Usa servidor online gratuito temporário
  app: 'https://my-json-server.typicode.com/typicode/demo' 
}; 
 
// Determinar qual URL usar baseado no ambiente
let baseURL;

// Forçar uso da API de produção para garantir que funcione no deploy
if (process.env.REACT_APP_API_URL) {
  baseURL = process.env.REACT_APP_API_URL;
  console.log('🔧 Override: Usando variável de ambiente');
} else if (isApp) {
  baseURL = API_URLS.app;
  console.log('🔧 Detectado: App móvel');
} else if (process.env.NODE_ENV === 'production') {
  baseURL = API_URLS.production;
  console.log('🔧 Detectado: Produção');
} else if (process.env.REACT_APP_USE_NETWORK) {
  baseURL = API_URLS.local_network;
  console.log('🔧 Detectado: Rede local');
} else {
  // Forçar produção mesmo em desenvolvimento para testar o deploy
  baseURL = API_URLS.production;
  console.log('🔧 Forçado: Usando API de produção para teste');
} 
 
// Permitir override via variável de ambiente 
if (process.env.REACT_APP_API_URL) { 
  baseURL = process.env.REACT_APP_API_URL; 
  console.log('🔧 Override: Usando variável de ambiente'); 
} 
 
export const API_BASE_URL = baseURL; 
 
// Logs para debug 
console.log('🌐 API configurada para:', baseURL); 
console.log('📱 É app móvel:', isApp); 
console.log('🏠 Ambiente:', process.env.NODE_ENV); 
 
// Função auxiliar para construir URLs da API 
export const buildApiUrl = (endpoint) => { 
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`; 
  return `${API_BASE_URL}${cleanEndpoint}`; 
}; 
 
// Função para testar conectividade com a API 
export const testApiConnection = async () => { 
  try { 
    const response = await fetch(`${API_BASE_URL}/api/health`); 
    if (response.ok) { 
      console.log('✅ Conexão com API estabelecida'); 
      return true; 
    } else { 
      console.log('❌ API respondeu com erro:', response.status); 
      return false; 
    } 
  } catch (error) { 
    console.log('❌ Erro ao conectar com API:', error); 
    return false; 
  } 
}; 
 
// Exportar configurações para uso em outros módulos 
const apiConfig = { 
  API_BASE_URL, 
  API_URLS, 
  buildApiUrl, 
  testApiConnection, 
  isApp 
};

export default apiConfig; 
