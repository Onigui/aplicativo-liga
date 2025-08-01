// Sistema de Gamificação para Liga do Bem
import analyticsService from './analyticsService.js';
import cacheService from './cacheService.js';
import notificationService from './notificationService.js';

class GamificationService {
  constructor() {
    this.userProgress = new Map();
    this.achievements = new Map();
    this.badges = new Map();
    this.levels = new Map();
    this.rewards = new Map();
    
    this.initializeAchievements();
    this.initializeBadges();
    this.initializeLevels();
    this.initializeRewards();
  }

  async init() {
    this.loadUserProgress();
    this.startProgressTracking();
  }

  initializeAchievements() {
    const achievements = {
      // Pagamentos e Doações
      first_donation: {
        id: 'first_donation',
        title: 'Primeira Doação',
        description: 'Faça sua primeira doação',
        icon: '❤️',
        points: 50,
        category: 'donation'
      },
      donation_streak: {
        id: 'donation_streak',
        title: 'Doador Consistente',
        description: 'Faça doações por 3 meses consecutivos',
        icon: '🔥',
        points: 200,
        category: 'donation'
      },
      big_donor: {
        id: 'big_donor',
        title: 'Grande Doador',
        description: 'Doe mais de R$ 100 em um mês',
        icon: '💎',
        points: 300,
        category: 'donation'
      },
      subscription_master: {
        id: 'subscription_master',
        title: 'Mestre da Assinatura',
        description: 'Mantenha assinatura ativa por 6 meses',
        icon: '👑',
        points: 500,
        category: 'subscription'
      },

      // Parceiros e Benefícios
      partner_explorer: {
        id: 'partner_explorer',
        title: 'Explorador de Parceiros',
        description: 'Visite 5 empresas parceiras diferentes',
        icon: '🏢',
        points: 100,
        category: 'partners'
      },
      discount_hunter: {
        id: 'discount_hunter',
        title: 'Caçador de Descontos',
        description: 'Use descontos de 10 empresas diferentes',
        icon: '💰',
        points: 250,
        category: 'partners'
      },

      // Adoção e Proteção Animal
      adoption_supporter: {
        id: 'adoption_supporter',
        title: 'Apoiador da Adoção',
        description: 'Compartilhe 10 posts de adoção',
        icon: '🐾',
        points: 150,
        category: 'adoption'
      },
      animal_advocate: {
        id: 'animal_advocate',
        title: 'Advogado dos Animais',
        description: 'Reporte 5 casos de maus-tratos',
        icon: '🛡️',
        points: 400,
        category: 'adoption'
      },

      // Engajamento
      social_butterfly: {
        id: 'social_butterfly',
        title: 'Borboleta Social',
        description: 'Conecte-se com 20 outros membros',
        icon: '🦋',
        points: 200,
        category: 'social'
      },
      event_participant: {
        id: 'event_participant',
        title: 'Participante de Eventos',
        description: 'Participe de 3 eventos da Liga',
        icon: '🎉',
        points: 300,
        category: 'events'
      },
      knowledge_seeker: {
        id: 'knowledge_seeker',
        title: 'Buscador de Conhecimento',
        description: 'Leia 20 artigos sobre proteção animal',
        icon: '📚',
        points: 150,
        category: 'education'
      }
    };

    Object.values(achievements).forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  initializeBadges() {
    const badges = {
      // Níveis de Doador
      bronze_donor: {
        id: 'bronze_donor',
        title: 'Doador Bronze',
        description: 'Doe entre R$ 50-200',
        icon: '🥉',
        requirement: { type: 'total_donations', value: 50 },
        color: 'bg-amber-500'
      },
      silver_donor: {
        id: 'silver_donor',
        title: 'Doador Prata',
        description: 'Doe entre R$ 200-500',
        icon: '🥈',
        requirement: { type: 'total_donations', value: 200 },
        color: 'bg-gray-400'
      },
      gold_donor: {
        id: 'gold_donor',
        title: 'Doador Ouro',
        description: 'Doe mais de R$ 500',
        icon: '🥇',
        requirement: { type: 'total_donations', value: 500 },
        color: 'bg-yellow-400'
      },

      // Níveis de Assinatura
      loyal_member: {
        id: 'loyal_member',
        title: 'Membro Leal',
        description: '3 meses de assinatura',
        icon: '💙',
        requirement: { type: 'subscription_months', value: 3 },
        color: 'bg-blue-500'
      },
      dedicated_member: {
        id: 'dedicated_member',
        title: 'Membro Dedicado',
        description: '6 meses de assinatura',
        icon: '💜',
        requirement: { type: 'subscription_months', value: 6 },
        color: 'bg-purple-500'
      },
      champion_member: {
        id: 'champion_member',
        title: 'Membro Campeão',
        description: '12 meses de assinatura',
        icon: '💎',
        requirement: { type: 'subscription_months', value: 12 },
        color: 'bg-indigo-500'
      },

      // Especiais
      early_adopter: {
        id: 'early_adopter',
        title: 'Primeiro Adotante',
        description: 'Um dos primeiros 100 membros',
        icon: '⭐',
        requirement: { type: 'member_number', value: 100 },
        color: 'bg-yellow-500'
      },
      community_leader: {
        id: 'community_leader',
        title: 'Líder da Comunidade',
        description: 'Ajude 50 outros membros',
        icon: '👑',
        requirement: { type: 'help_others', value: 50 },
        color: 'bg-red-500'
      }
    };

    Object.values(badges).forEach(badge => {
      this.badges.set(badge.id, badge);
    });
  }

  initializeLevels() {
    const levels = [
      { level: 1, name: 'Iniciante', minPoints: 0, color: 'bg-gray-500' },
      { level: 2, name: 'Aprendiz', minPoints: 100, color: 'bg-green-500' },
      { level: 3, name: 'Ativo', minPoints: 300, color: 'bg-blue-500' },
      { level: 4, name: 'Engajado', minPoints: 600, color: 'bg-purple-500' },
      { level: 5, name: 'Dedicado', minPoints: 1000, color: 'bg-indigo-500' },
      { level: 6, name: 'Especialista', minPoints: 1500, color: 'bg-pink-500' },
      { level: 7, name: 'Mestre', minPoints: 2200, color: 'bg-red-500' },
      { level: 8, name: 'Lenda', minPoints: 3000, color: 'bg-yellow-500' },
      { level: 9, name: 'Ícone', minPoints: 4000, color: 'bg-orange-500' },
      { level: 10, name: 'Lenda Viva', minPoints: 5000, color: 'bg-gradient-to-r from-purple-500 to-pink-500' }
    ];

    levels.forEach(level => {
      this.levels.set(level.level, level);
    });
  }

  initializeRewards() {
    const rewards = {
      // Descontos especiais
      discount_5: {
        id: 'discount_5',
        title: 'Desconto 5% Extra',
        description: '5% de desconto adicional em parceiros selecionados',
        type: 'discount',
        value: 5,
        pointsCost: 100,
        icon: '💰'
      },
      discount_10: {
        id: 'discount_10',
        title: 'Desconto 10% Extra',
        description: '10% de desconto adicional em parceiros selecionados',
        type: 'discount',
        value: 10,
        pointsCost: 250,
        icon: '💎'
      },

      // Benefícios exclusivos
      priority_support: {
        id: 'priority_support',
        title: 'Suporte Prioritário',
        description: 'Atendimento prioritário por 30 dias',
        type: 'benefit',
        duration: 30,
        pointsCost: 150,
        icon: '🎯'
      },
      exclusive_content: {
        id: 'exclusive_content',
        title: 'Conteúdo Exclusivo',
        description: 'Acesso a conteúdo exclusivo por 60 dias',
        type: 'benefit',
        duration: 60,
        pointsCost: 200,
        icon: '📚'
      },

      // Recompensas especiais
      custom_badge: {
        id: 'custom_badge',
        title: 'Badge Personalizado',
        description: 'Crie sua própria badge personalizada',
        type: 'custom',
        pointsCost: 500,
        icon: '🎨'
      },
      meet_team: {
        id: 'meet_team',
        title: 'Conheça a Equipe',
        description: 'Encontro virtual com a equipe da Liga do Bem',
        type: 'experience',
        pointsCost: 1000,
        icon: '👥'
      }
    };

    Object.values(rewards).forEach(reward => {
      this.rewards.set(reward.id, reward);
    });
  }

  // Sistema de Pontos
  async addPoints(userId, points, reason, category = 'general') {
    const userProgress = this.getUserProgress(userId);
    const oldPoints = userProgress.points;
    const oldLevel = userProgress.level;

    userProgress.points += points;
    userProgress.totalPointsEarned += points;
    userProgress.pointHistory.push({
      points,
      reason,
      category,
      timestamp: Date.now()
    });

    // Verificar level up
    const newLevel = this.calculateLevel(userProgress.points);
    if (newLevel > oldLevel) {
      await this.handleLevelUp(userId, oldLevel, newLevel);
    }

    // Verificar achievements
    await this.checkAchievements(userId, category, reason);

    // Verificar badges
    await this.checkBadges(userId);

    this.saveUserProgress(userId, userProgress);

    // Analytics
    analyticsService.track('points_earned', {
      userId,
      points,
      reason,
      category,
      newTotal: userProgress.points,
      level: userProgress.level
    });

    return {
      oldPoints,
      newPoints: userProgress.points,
      pointsGained: points,
      levelUp: newLevel > oldLevel,
      newLevel
    };
  }

  calculateLevel(points) {
    for (let i = this.levels.size; i >= 1; i--) {
      const level = this.levels.get(i);
      if (points >= level.minPoints) {
        return i;
      }
    }
    return 1;
  }

  async handleLevelUp(userId, oldLevel, newLevel) {
    const userProgress = this.getUserProgress(userId);
    userProgress.level = newLevel;
    userProgress.levelUps.push({
      fromLevel: oldLevel,
      toLevel: newLevel,
      timestamp: Date.now()
    });

    // Notificação de level up
    const levelInfo = this.levels.get(newLevel);
    await notificationService.sendCategoryNotification('general', 
      `🎉 Parabéns! Você chegou ao nível ${newLevel}!`,
      `Você agora é um ${levelInfo.name}! Continue assim!`,
      { requireInteraction: true }
    );

    // Recompensa de level up
    const levelUpReward = this.calculateLevelUpReward(newLevel);
    await this.addPoints(userId, levelUpReward, 'Level Up Bonus', 'level_up');

    analyticsService.track('level_up', {
      userId,
      oldLevel,
      newLevel,
      reward: levelUpReward
    });
  }

  calculateLevelUpReward(level) {
    return Math.floor(level * 25); // 25 pontos por nível
  }

  // Sistema de Achievements
  async checkAchievements(userId, category, action) {
    const userProgress = this.getUserProgress(userId);
    const userStats = await this.getUserStats(userId);

    for (const [achievementId, achievement] of this.achievements) {
      if (userProgress.achievements.includes(achievementId)) continue;

      if (this.hasEarnedAchievement(achievement, userStats, category, action)) {
        await this.grantAchievement(userId, achievementId);
      }
    }
  }

  hasEarnedAchievement(achievement, userStats, category, action) {
    switch (achievement.id) {
      case 'first_donation':
        return userStats.totalDonations >= 1;
      case 'donation_streak':
        return userStats.donationStreak >= 3;
      case 'big_donor':
        return userStats.monthlyDonations >= 100;
      case 'subscription_master':
        return userStats.subscriptionMonths >= 6;
      case 'partner_explorer':
        return userStats.uniquePartnersVisited >= 5;
      case 'discount_hunter':
        return userStats.uniquePartnersUsed >= 10;
      case 'adoption_supporter':
        return userStats.adoptionShares >= 10;
      case 'animal_advocate':
        return userStats.reportsSubmitted >= 5;
      case 'social_butterfly':
        return userStats.connections >= 20;
      case 'event_participant':
        return userStats.eventsAttended >= 3;
      case 'knowledge_seeker':
        return userStats.articlesRead >= 20;
      default:
        return false;
    }
  }

  async grantAchievement(userId, achievementId) {
    const achievement = this.achievements.get(achievementId);
    const userProgress = this.getUserProgress(userId);

    userProgress.achievements.push(achievementId);
    userProgress.achievementsEarned.push({
      id: achievementId,
      earnedAt: Date.now()
    });

    // Adicionar pontos do achievement
    await this.addPoints(userId, achievement.points, `Achievement: ${achievement.title}`, 'achievement');

    // Notificação
    await notificationService.sendCategoryNotification('general',
      `🏆 Achievement Desbloqueado!`,
      `${achievement.title}: ${achievement.description}`,
      { requireInteraction: true }
    );

    analyticsService.track('achievement_earned', {
      userId,
      achievementId,
      points: achievement.points
    });
  }

  // Sistema de Badges
  async checkBadges(userId) {
    const userProgress = this.getUserProgress(userId);
    const userStats = await this.getUserStats(userId);

    for (const [badgeId, badge] of this.badges) {
      if (userProgress.badges.includes(badgeId)) continue;

      if (this.hasEarnedBadge(badge, userStats)) {
        await this.grantBadge(userId, badgeId);
      }
    }
  }

  hasEarnedBadge(badge, userStats) {
    switch (badge.requirement.type) {
      case 'total_donations':
        return userStats.totalDonations >= badge.requirement.value;
      case 'subscription_months':
        return userStats.subscriptionMonths >= badge.requirement.value;
      case 'member_number':
        return userStats.memberNumber <= badge.requirement.value;
      case 'help_others':
        return userStats.helpOthers >= badge.requirement.value;
      default:
        return false;
    }
  }

  async grantBadge(userId, badgeId) {
    const badge = this.badges.get(badgeId);
    const userProgress = this.getUserProgress(userId);

    userProgress.badges.push(badgeId);
    userProgress.badgesEarned.push({
      id: badgeId,
      earnedAt: Date.now()
    });

    // Notificação
    await notificationService.sendCategoryNotification('general',
      `🏅 Nova Badge!`,
      `${badge.title}: ${badge.description}`,
      { requireInteraction: true }
    );

    analyticsService.track('badge_earned', {
      userId,
      badgeId
    });
  }

  // Sistema de Recompensas
  async purchaseReward(userId, rewardId) {
    const reward = this.rewards.get(rewardId);
    const userProgress = this.getUserProgress(userId);

    if (userProgress.points < reward.pointsCost) {
      throw new Error('Pontos insuficientes para comprar esta recompensa');
    }

    // Deduzir pontos
    await this.addPoints(userId, -reward.pointsCost, `Compra: ${reward.title}`, 'reward_purchase');

    // Aplicar recompensa
    userProgress.activeRewards.push({
      id: rewardId,
      purchasedAt: Date.now(),
      expiresAt: reward.duration ? Date.now() + (reward.duration * 24 * 60 * 60 * 1000) : null
    });

    this.saveUserProgress(userId, userProgress);

    // Notificação
    await notificationService.sendCategoryNotification('general',
      `🎁 Recompensa Ativada!`,
      `${reward.title}: ${reward.description}`,
      { requireInteraction: true }
    );

    analyticsService.track('reward_purchased', {
      userId,
      rewardId,
      pointsCost: reward.pointsCost
    });

    return reward;
  }

  // Estatísticas do Usuário
  async getUserStats(userId) {
    // Simular dados do usuário (em produção, viria do backend)
    return {
      totalDonations: 150,
      donationStreak: 2,
      monthlyDonations: 75,
      subscriptionMonths: 4,
      uniquePartnersVisited: 8,
      uniquePartnersUsed: 12,
      adoptionShares: 15,
      reportsSubmitted: 3,
      connections: 25,
      eventsAttended: 2,
      articlesRead: 18,
      memberNumber: 85,
      helpOthers: 12
    };
  }

  // Gerenciamento de Progresso
  getUserProgress(userId) {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        points: 0,
        totalPointsEarned: 0,
        level: 1,
        achievements: [],
        badges: [],
        activeRewards: [],
        pointHistory: [],
        achievementsEarned: [],
        badgesEarned: [],
        levelUps: [],
        lastActivity: Date.now()
      });
    }
    return this.userProgress.get(userId);
  }

  saveUserProgress(userId, progress) {
    this.userProgress.set(userId, progress);
    localStorage.setItem(`user_progress_${userId}`, JSON.stringify(progress));
  }

  loadUserProgress() {
    // Carregar progresso salvo
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('user_progress_')) {
        try {
          const userId = key.replace('user_progress_', '');
          const progress = JSON.parse(localStorage.getItem(key));
          this.userProgress.set(userId, progress);
        } catch (error) {
          console.error('Erro ao carregar progresso do usuário:', error);
        }
      }
    }
  }

  startProgressTracking() {
    // Atualizar progresso a cada 5 minutos
    setInterval(() => {
      this.userProgress.forEach((progress, userId) => {
        progress.lastActivity = Date.now();
        this.saveUserProgress(userId, progress);
      });
    }, 300000);
  }

  // Relatórios e Analytics
  getLeaderboard() {
    const users = Array.from(this.userProgress.values());
    return users
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        points: user.points,
        level: user.level,
        achievements: user.achievements.length,
        badges: user.badges.length
      }));
  }

  getUserRank(userId) {
    const users = Array.from(this.userProgress.values());
    const sortedUsers = users.sort((a, b) => b.points - a.points);
    const userIndex = sortedUsers.findIndex(user => user.userId === userId);
    return userIndex + 1;
  }

  getProgressReport(userId) {
    const progress = this.getUserProgress(userId);
    const stats = this.getUserStats(userId);
    const rank = this.getUserRank(userId);

    return {
      progress,
      stats,
      rank,
      nextLevel: this.levels.get(progress.level + 1),
      pointsToNextLevel: this.levels.get(progress.level + 1)?.minPoints - progress.points || 0,
      achievements: progress.achievements.map(id => this.achievements.get(id)),
      badges: progress.badges.map(id => this.badges.get(id)),
      availableRewards: Array.from(this.rewards.values()).filter(reward => 
        progress.points >= reward.pointsCost
      )
    };
  }
}

const gamificationService = new GamificationService();
export default gamificationService; 