import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ds } from './theme';
import { Typography } from './Typography';
import { UserProfile } from '../analytics/advancedAnalytics';

interface AdvancedStatsCardProps {
  profile: UserProfile;
  formatStudyTime: (ms: number) => string;
  formatScore: (score: number) => string;
  getStreakEmoji: (streak: number) => string;
  getScoreColor: (score: number) => string;
  style?: any;
}

export function AdvancedStatsCard({ 
  profile, 
  formatStudyTime, 
  formatScore, 
  getStreakEmoji, 
  getScoreColor,
  style 
}: AdvancedStatsCardProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    if (percentage >= 40) return '#F97316';
    return '#EF4444';
  };

  const getLearningTimeInsight = () => {
    const hours = Math.floor(profile.averageSessionDuration / (1000 * 60 * 60));
    const minutes = Math.floor((profile.averageSessionDuration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м в среднем за сессию`;
    }
    return `${minutes} минут в среднем за сессию`;
  };

  const getPreferredTimeText = () => {
    const hour = parseInt(profile.preferredLearningTime.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'Утреннее время';
    if (hour >= 12 && hour < 18) return 'Дневное время';
    if (hour >= 18 && hour < 22) return 'Вечернее время';
    return 'Ночное время';
  };

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Основная статистика */}
      <View style={styles.mainStats}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.mainGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.mainContent}>
            <View style={styles.streakContainer}>
              <Text style={styles.streakEmoji}>{getStreakEmoji(profile.streakDays)}</Text>
              <Typography variant="title" style={styles.streakText}>
                {profile.streakDays} дней подряд
              </Typography>
            </View>
            
            <View style={styles.mainMetrics}>
              <View style={styles.metric}>
                <Typography variant="subtitle" style={styles.metricLabel}>
                  Общее время
                </Typography>
                <Typography variant="title" style={styles.metricValue}>
                  {formatStudyTime(profile.totalStudyTime)}
                </Typography>
              </View>
              
              <View style={styles.metric}>
                <Typography variant="subtitle" style={styles.metricLabel}>
                  Темы изучено
                </Typography>
                <Typography variant="title" style={styles.metricValue}>
                  {profile.topicsCompleted}
                </Typography>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Детальная статистика */}
      <View style={styles.detailedStats}>
        {/* Средний балл */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statIcon}>📊</Text>
            <Typography variant="subtitle" style={styles.statTitle}>
              Средний балл
            </Typography>
          </View>
          <Typography variant="title" style={[styles.statValue, { color: getScoreColor(profile.averageScore) }]}>
            {formatScore(profile.averageScore)}
          </Typography>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${profile.averageScore}%`,
                  backgroundColor: getScoreColor(profile.averageScore)
                }
              ]} 
            />
          </View>
        </View>

        {/* Время изучения */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Typography variant="subtitle" style={styles.statTitle}>
              Время изучения
            </Typography>
          </View>
          <Typography variant="title" style={styles.statValue}>
            {getLearningTimeInsight()}
          </Typography>
          <Typography style={styles.statDescription}>
            Предпочитаемое время: {getPreferredTimeText()}
          </Typography>
        </View>

        {/* Сильные темы */}
        {profile.strongTopics.length > 0 && (
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>💪</Text>
              <Typography variant="subtitle" style={styles.statTitle}>
                Сильные темы
              </Typography>
            </View>
            <View style={styles.topicsList}>
              {profile.strongTopics.map((topic, index) => (
                <View key={index} style={styles.topicItem}>
                  <View style={[styles.topicDot, { backgroundColor: '#10B981' }]} />
                  <Typography style={styles.topicText}>
                    {topic === 'money' ? 'Деньги' :
                     topic === 'market' ? 'Рынок' :
                     topic === 'human-nature' ? 'Природа человека' : topic}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Слабые темы */}
        {profile.weakTopics.length > 0 && (
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>⚠️</Text>
              <Typography variant="subtitle" style={styles.statTitle}>
                Требуют внимания
              </Typography>
            </View>
            <View style={styles.topicsList}>
              {profile.weakTopics.map((topic, index) => (
                <View key={index} style={styles.topicItem}>
                  <View style={[styles.topicDot, { backgroundColor: '#EF4444' }]} />
                  <Typography style={styles.topicText}>
                    {topic === 'money' ? 'Деньги' :
                     topic === 'market' ? 'Рынок' :
                     topic === 'human-nature' ? 'Природа человека' : topic}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Последняя активность */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statIcon}>📅</Text>
            <Typography variant="subtitle" style={styles.statTitle}>
              Последняя активность
            </Typography>
          </View>
          <Typography variant="title" style={styles.statValue}>
            {new Date(profile.lastActiveDate).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Typography>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainStats: {
    marginBottom: ds.spacing.lg,
  },
  mainGradient: {
    borderRadius: ds.radius.lg,
    padding: 1,
  },
  mainContent: {
    backgroundColor: ds.colors.card,
    borderRadius: ds.radius.lg - 1,
    padding: ds.spacing.lg,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: ds.spacing.lg,
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: ds.spacing.sm,
  },
  streakText: {
    color: ds.colors.text,
    textAlign: 'center',
  },
  mainMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: ds.colors.textSecondary,
    marginBottom: ds.spacing.xs,
    textAlign: 'center',
  },
  metricValue: {
    color: ds.colors.text,
    fontWeight: '700',
  },
  detailedStats: {
    gap: ds.spacing.md,
  },
  statCard: {
    backgroundColor: ds.colors.card,
    borderRadius: ds.radius.lg,
    padding: ds.spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ds.spacing.md,
  },
  statIcon: {
    fontSize: 24,
    marginRight: ds.spacing.sm,
  },
  statTitle: {
    color: ds.colors.text,
    fontWeight: '600',
  },
  statValue: {
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.sm,
  },
  statDescription: {
    color: ds.colors.textSecondary,
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: ds.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  topicsList: {
    gap: ds.spacing.sm,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: ds.spacing.sm,
  },
  topicText: {
    color: ds.colors.text,
    fontSize: 14,
  },
});
