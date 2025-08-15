import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';
import { useI18n } from '../hooks/useI18n';
import { ds } from '../ui/theme';
import { Typography } from '../ui/Typography';
import { TopNav } from '../ui/TopNav';
import { Container, Row, Col } from '../ui/Grid';
import { RecommendationCard } from '../ui/RecommendationCard';
import { AdvancedStatsCard } from '../ui/AdvancedStatsCard';
import { Button } from '../ui/Button';
import { ChartIcon } from '../ui/icons/ChartIcon';
import { LightbulbIcon } from '../ui/icons/LightbulbIcon';
import { SettingsIcon } from '../ui/icons/SettingsIcon';

export const AdvancedAnalyticsScreen: React.FC = () => {
  const { t } = useI18n();
  const {
    isLoading,
    getProfile,
    getRecommendations,
    getHighPriorityRecommendations,
    getMediumPriorityRecommendations,
    formatStudyTime,
    formatScore,
    getStreakEmoji,
    getScoreColor,
    clearAllData,
    loadAnalyticsData
  } = useAdvancedAnalytics();

  const [activeTab, setActiveTab] = useState<'stats' | 'recommendations'>('stats');

  const profile = getProfile();
  const recommendations = getRecommendations();
  const highPriorityRecs = getHighPriorityRecommendations();
  const mediumPriorityRecs = getMediumPriorityRecommendations();

  const handleClearData = () => {
    Alert.alert(
      'Очистить данные',
      'Вы уверены, что хотите удалить все данные аналитики? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Успешно', 'Все данные аналитики удалены');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить данные');
            }
          }
        }
      ]
    );
  };

  const handleRecommendationPress = (recommendation: any) => {
    // TODO: Навигация к соответствующей теме или действию
    Alert.alert(
      recommendation.title,
      recommendation.description,
      [{ text: 'Понятно', style: 'default' }]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopNav />
        <Container>
          <View style={styles.loadingContainer}>
            <Typography variant="title">Загрузка аналитики...</Typography>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopNav />
      <Container>
        <Row>
          <Col spanDesktop={12} spanTablet={12} spanMobile={12}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <ChartIcon size={32} color={ds.colors.primary} />
                <Typography variant="heroTitle" style={styles.title}>
                  Продвинутая аналитика
                </Typography>
              </View>
              
              <TouchableOpacity onPress={handleClearData} style={styles.settingsButton}>
                <SettingsIcon size={24} color={ds.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Табы */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
                onPress={() => setActiveTab('stats')}
              >
                <ChartIcon size={20} color={activeTab === 'stats' ? ds.colors.primary : ds.colors.textSecondary} />
                <Typography 
                  variant="subtitle" 
                  style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}
                >
                  Статистика
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
                onPress={() => setActiveTab('recommendations')}
              >
                <LightbulbIcon size={20} color={activeTab === 'recommendations' ? ds.colors.primary : ds.colors.textSecondary} />
                <Typography 
                  variant="subtitle" 
                  style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}
                >
                  Рекомендации ({recommendations.length})
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Контент */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {activeTab === 'stats' ? (
                // Вкладка статистики
                <View>
                  {profile ? (
                    <AdvancedStatsCard
                      profile={profile}
                      formatStudyTime={formatStudyTime}
                      formatScore={formatScore}
                      getStreakEmoji={getStreakEmoji}
                      getScoreColor={getScoreColor}
                    />
                  ) : (
                    <View style={styles.emptyState}>
                      <Typography variant="title" style={styles.emptyTitle}>
                        Нет данных
                      </Typography>
                      <Typography style={styles.emptyDescription}>
                        Начните изучение тем, чтобы увидеть статистику
                      </Typography>
                      <Button
                        label="Обновить"
                        onPress={loadAnalyticsData}
                        variant="primary"
                        style={styles.refreshButton}
                      />
                    </View>
                  )}
                </View>
              ) : (
                // Вкладка рекомендаций
                <View>
                  {recommendations.length > 0 ? (
                    <View>
                      {/* Высокий приоритет */}
                      {highPriorityRecs.length > 0 && (
                        <View style={styles.section}>
                          <Typography variant="title" style={styles.sectionTitle}>
                            🔥 Высокий приоритет
                          </Typography>
                          {highPriorityRecs.map((recommendation, index) => (
                            <RecommendationCard
                              key={index}
                              recommendation={recommendation}
                              onPress={() => handleRecommendationPress(recommendation)}
                            />
                          ))}
                        </View>
                      )}

                      {/* Средний приоритет */}
                      {mediumPriorityRecs.length > 0 && (
                        <View style={styles.section}>
                          <Typography variant="title" style={styles.sectionTitle}>
                            ⚡ Средний приоритет
                          </Typography>
                          {mediumPriorityRecs.map((recommendation, index) => (
                            <RecommendationCard
                              key={index}
                              recommendation={recommendation}
                              onPress={() => handleRecommendationPress(recommendation)}
                            />
                          ))}
                        </View>
                      )}

                      {/* Низкий приоритет */}
                      {recommendations.filter(r => r.priority === 'low').length > 0 && (
                        <View style={styles.section}>
                          <Typography variant="title" style={styles.sectionTitle}>
                            ✨ Низкий приоритет
                          </Typography>
                          {recommendations
                            .filter(r => r.priority === 'low')
                            .map((recommendation, index) => (
                              <RecommendationCard
                                key={index}
                                recommendation={recommendation}
                                onPress={() => handleRecommendationPress(recommendation)}
                              />
                            ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.emptyState}>
                      <Typography variant="title" style={styles.emptyTitle}>
                        Нет рекомендаций
                      </Typography>
                      <Typography style={styles.emptyDescription}>
                        Продолжайте обучение, чтобы получить персонализированные рекомендации
                      </Typography>
                      <Button
                        label="Обновить"
                        onPress={loadAnalyticsData}
                        variant="primary"
                        style={styles.refreshButton}
                      />
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </Col>
        </Row>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ds.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ds.spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: ds.spacing.sm,
    color: ds.colors.text,
  },
  settingsButton: {
    padding: ds.spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: ds.colors.card,
    borderRadius: ds.radius.lg,
    padding: ds.spacing.xs,
    marginBottom: ds.spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ds.spacing.sm,
    paddingHorizontal: ds.spacing.md,
    borderRadius: ds.radius.md,
  },
  activeTab: {
    backgroundColor: ds.colors.background,
  },
  tabText: {
    marginLeft: ds.spacing.xs,
    color: ds.colors.textSecondary,
  },
  activeTabText: {
    color: ds.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: ds.spacing.xl,
  },
  sectionTitle: {
    color: ds.colors.text,
    marginBottom: ds.spacing.md,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ds.spacing.xl * 2,
  },
  emptyTitle: {
    color: ds.colors.text,
    marginBottom: ds.spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    color: ds.colors.textSecondary,
    textAlign: 'center',
    marginBottom: ds.spacing.lg,
    paddingHorizontal: ds.spacing.lg,
  },
  refreshButton: {
    minWidth: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
