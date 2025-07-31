const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({
          error: 'Erro de conexão com o servidor',
          message: 'Verifique se o servidor está rodando na porta 3001'
        });
      }
    })
  );
};