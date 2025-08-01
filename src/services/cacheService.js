// Sistema de Cache Inteligente para Liga do Bem
class CacheService {
  constructor() {
    this.cache = new Map();
    this.maxAge = 5 * 60 * 1000; // 5 minutos
    this.maxSize = 100; // Máximo 100 itens no cache
  }

  // Gerar chave única para cache
  generateKey(key, params = {}) {
    const paramsString = Object.keys(params)
      .sort()
      .map(k => `${k}:${params[k]}`)
      .join('|');
    return `${key}${paramsString ? `|${paramsString}` : ''}`;
  }

  // Verificar se item está em cache e ainda é válido
  isValid(cacheItem) {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < this.maxAge;
  }

  // Obter item do cache
  get(key, params = {}) {
    const cacheKey = this.generateKey(key, params);
    const item = this.cache.get(cacheKey);
    
    if (this.isValid(item)) {
      console.log('📦 [CACHE] Hit:', cacheKey);
      return item.data;
    }
    
    if (item) {
      console.log('📦 [CACHE] Expired:', cacheKey);
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  // Armazenar item no cache
  set(key, data, params = {}) {
    const cacheKey = this.generateKey(key, params);
    
    // Limpar cache se estiver muito grande
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log('📦 [CACHE] Stored:', cacheKey);
  }

  // Limpar cache expirado
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
    
    // Se ainda estiver muito grande, remover itens mais antigos
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize / 2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Limpar cache específico
  clear(key, params = {}) {
    const cacheKey = this.generateKey(key, params);
    this.cache.delete(cacheKey);
    console.log('📦 [CACHE] Cleared:', cacheKey);
  }

  // Limpar todo o cache
  clearAll() {
    this.cache.clear();
    console.log('📦 [CACHE] All cleared');
  }

  // Obter estatísticas do cache
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;
    
    for (const item of this.cache.values()) {
      if (this.isValid(item)) {
        valid++;
      } else {
        expired++;
      }
    }
    
    return {
      total: this.cache.size,
      valid,
      expired,
      hitRate: valid / this.cache.size || 0
    };
  }
}

// Instância singleton
const cacheService = new CacheService();

export default cacheService; 