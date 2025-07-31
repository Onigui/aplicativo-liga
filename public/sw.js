// Service Worker para Liga do Bem - PWA
const CACHE_NAME = 'liga-do-bem-v2.0.0-fixed';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Service Worker instalado - VERSÃO CORRIGIDA');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [SW] Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  // Força o novo SW a se tornar ativo imediatamente
  self.skipWaiting();
});

// Ativar Service Worker e limpar cache antigo
self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Service Worker ativado - limpando cache antigo');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ [SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Força o controle imediato de todas as abas
  return self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Não interceptar requisições para a API
  if (event.request.url.includes('/api/')) {
    console.log('🚫 [SW] Ignorando requisição da API:', event.request.url);
    return;
  }
  
  // Não interceptar requisições POST/PUT/DELETE
  if (event.request.method !== 'GET') {
    console.log('🚫 [SW] Ignorando requisição não-GET:', event.request.method, event.request.url);
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna cache se disponível, senão faz requisição
        if (response) {
          console.log('📱 [SW] Servindo do cache:', event.request.url);
          return response;
        }
        
        console.log('🌐 [SW] Buscando da rede:', event.request.url);
        return fetch(event.request);
      }
    )
  );
});



// Notificações Push (futuro)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('📢 [SW] Notificação recebida:', data);
    
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});