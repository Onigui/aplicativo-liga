import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Gift, TrendingUp, Target, Users, Crown, Zap, Heart, Shield, MapPin } from 'lucide-react';
import gamificationService from '../services/gamificationService';

const UserProgress = ({ user, onClose }) => {
  const [progressReport, setProgressReport] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressReport();
    }
  }, [user]);

  const loadProgressReport = async () => {
    setLoading(true);
    try {
      const report = gamificationService.getProgressReport(user.id);
      setProgressReport(report);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!progressReport) return { percentage: 0, pointsToNext: 0 };
    
    const currentLevel = progressReport.progress.level;
    const currentPoints = progressReport.progress.points;
    const nextLevel = progressReport.nextLevel;
    
    if (!nextLevel) return { percentage: 100, pointsToNext: 0 };
    
    const currentLevelMin = gamificationService.levels.get(currentLevel).minPoints;
    const nextLevelMin = nextLevel.minPoints;
    const pointsInCurrentLevel = currentPoints - currentLevelMin;
    const pointsNeededForNextLevel = nextLevelMin - currentLevelMin;
    
    const percentage = Math.min(100, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100);
    
    return {
      percentage: Math.round(percentage),
      pointsToNext: progressReport.pointsToNextLevel
    };
  };

  const getLevelColor = (level) => {
    const levelInfo = gamificationService.levels.get(level);
    return levelInfo?.color || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  if (!progressReport) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-gray-600">Erro ao carregar progresso</p>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Meu Progresso</h2>
              <p className="text-gray-600">Acompanhe suas conquistas e recompensas</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'achievements', label: 'Conquistas', icon: Trophy },
              { id: 'badges', label: 'Badges', icon: Award },
              { id: 'rewards', label: 'Recompensas', icon: Gift },
              { id: 'leaderboard', label: 'Ranking', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Nível e Progresso */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      Nível {progressReport.progress.level} - {progressReport.nextLevel?.name || 'Máximo'}
                    </h3>
                    <p className="text-blue-100">
                      {progressReport.progress.points} pontos totais
                    </p>
                  </div>
                  <div className={`w-16 h-16 rounded-full ${getLevelColor(progressReport.progress.level)} flex items-center justify-center`}>
                    <Crown className="h-8 w-8" />
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso para o próximo nível</span>
                    <span>{levelProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                    <div
                      className="bg-white rounded-full h-3 transition-all duration-300"
                      style={{ width: `${levelProgress.percentage}%` }}
                    ></div>
                  </div>
                  {levelProgress.pointsToNext > 0 && (
                    <p className="text-sm text-blue-100 mt-2">
                      {levelProgress.pointsToNext} pontos para o próximo nível
                    </p>
                  )}
                </div>

                {/* Ranking */}
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Ranking: #{progressReport.rank} de todos os membros</span>
                </div>
              </div>

              {/* Estatísticas Rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-800">
                    {progressReport.achievements.length}
                  </p>
                  <p className="text-sm text-green-600">Conquistas</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-800">
                    {progressReport.badges.length}
                  </p>
                  <p className="text-sm text-purple-600">Badges</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-800">
                    {progressReport.progress.totalPointsEarned}
                  </p>
                  <p className="text-sm text-blue-600">Pontos Ganhos</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <Gift className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-800">
                    {progressReport.availableRewards.length}
                  </p>
                  <p className="text-sm text-orange-600">Recompensas Disponíveis</p>
                </div>
              </div>

              {/* Atividades Recentes */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</h4>
                <div className="space-y-3">
                  {progressReport.progress.pointHistory.slice(-5).reverse().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          entry.points > 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {entry.points > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <Gift className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{entry.reason}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        entry.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.points > 0 ? '+' : ''}{entry.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Conquistas ({progressReport.achievements.length}/{gamificationService.achievements.size})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(gamificationService.achievements.values()).map((achievement) => {
                  const isEarned = progressReport.achievements.some(a => a.id === achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`rounded-lg p-4 border-2 transition-all ${
                        isEarned
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`text-2xl ${isEarned ? 'opacity-100' : 'opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            isEarned ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <p className="text-sm font-medium text-blue-600">
                            {achievement.points} pontos
                          </p>
                        </div>
                        {isEarned && (
                          <div className="text-green-600">
                            <Trophy className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Badges ({progressReport.badges.length}/{gamificationService.badges.size})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(gamificationService.badges.values()).map((badge) => {
                  const isEarned = progressReport.badges.some(b => b.id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-lg p-4 border-2 transition-all ${
                        isEarned
                          ? 'border-purple-200 bg-purple-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`text-2xl ${isEarned ? 'opacity-100' : 'opacity-50'}`}>
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            isEarned ? 'text-purple-800' : 'text-gray-600'
                          }`}>
                            {badge.title}
                          </h4>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                        </div>
                        {isEarned && (
                          <div className="text-purple-600">
                            <Award className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recompensas Disponíveis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(gamificationService.rewards.values()).map((reward) => {
                  const canAfford = progressReport.progress.points >= reward.pointsCost;
                  return (
                    <div
                      key={reward.id}
                      className={`rounded-lg p-4 border-2 transition-all ${
                        canAfford
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{reward.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{reward.title}</h4>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                          <p className="text-sm font-medium text-orange-600">
                            {reward.pointsCost} pontos
                          </p>
                        </div>
                        <button
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            canAfford
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Resgatar' : 'Pontos Insuficientes'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Membros</h3>
              <div className="space-y-3">
                {gamificationService.getLeaderboard().map((user, index) => (
                  <div
                    key={user.userId}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      user.userId === progressReport.progress.userId
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                        {index === 2 && <Award className="h-5 w-5 text-orange-500" />}
                        <span className="font-bold text-gray-600">#{user.rank}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {user.userId === progressReport.progress.userId ? 'Você' : `Membro ${user.userId}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Nível {user.level} • {user.achievements} conquistas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{user.points} pts</p>
                      <p className="text-sm text-gray-600">{user.badges} badges</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProgress; 