import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Recommendation } from '../analytics/advancedAnalytics';
import { ds } from './theme';
import { Typography } from './Typography';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPress?: () => void;
  style?: any;
}

export function RecommendationCard({ recommendation, onPress, style }: RecommendationCardProps) {
  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'high':
        return ['#EF4444', '#DC2626']; // red gradient
      case 'medium':
        return ['#F59E0B', '#D97706']; // yellow gradient
      case 'low':
        return ['#10B981', '#059669']; // green gradient
      default:
        return ['#6B7280', '#4B5563']; // gray gradient
    }
  };

  const getPriorityIcon = () => {
    switch (recommendation.priority) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚡';
      case 'low':
        return '✨';
      default:
        return '💡';
    }
  };

  const getTypeIcon = () => {
    switch (recommendation.type) {
      case 'review_weak_topic':
        return '📚';
      case 'continue_streak':
        return '🔥';
      case 'try_new_topic':
        return '🆕';
      case 'practice_mistakes':
        return '❌';
      case 'complete_incomplete':
        return '✅';
      default:
        return '💡';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getPriorityColor()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
            </View>
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityIcon}>{getPriorityIcon()}</Text>
              <Text style={styles.priorityText}>
                {recommendation.priority === 'high' ? 'Высокий' :
                 recommendation.priority === 'medium' ? 'Средний' : 'Низкий'}
              </Text>
            </View>
          </View>

          <View style={styles.body}>
            <Typography variant="subtitle" style={styles.title}>
              {recommendation.title}
            </Typography>
            
            <Typography style={styles.description}>
              {recommendation.description}
            </Typography>

            <View style={styles.footer}>
              <View style={styles.reasonContainer}>
                <Text style={styles.reasonLabel}>Причина:</Text>
                <Text style={styles.reasonText}>{recommendation.reason}</Text>
              </View>
              
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>Время:</Text>
                <Text style={styles.timeText}>{recommendation.estimatedTime} мин</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: ds.radius.lg,
    overflow: 'hidden',
    marginBottom: ds.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    padding: 1, // Для создания границы
  },
  content: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg - 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ds.spacing.md,
    paddingTop: ds.spacing.md,
    paddingBottom: ds.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ds.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 20,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ds.colors.background,
    paddingHorizontal: ds.spacing.sm,
    paddingVertical: ds.spacing.xs,
    borderRadius: ds.radius.md,
  },
  priorityIcon: {
    fontSize: 16,
    marginRight: ds.spacing.xs,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: ds.colors.textSecondary,
  },
  body: {
    paddingHorizontal: ds.spacing.md,
    paddingBottom: ds.spacing.md,
  },
  title: {
    color: ds.colors.text,
    marginBottom: ds.spacing.xs,
    fontWeight: '600',
  },
  description: {
    color: ds.colors.textSecondary,
    marginBottom: ds.spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  reasonContainer: {
    flex: 1,
    marginRight: ds.spacing.sm,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ds.colors.textSecondary,
    marginBottom: ds.spacing.xs,
  },
  reasonText: {
    fontSize: 12,
    color: ds.colors.textSecondary,
    lineHeight: 16,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ds.colors.textSecondary,
    marginBottom: ds.spacing.xs,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: ds.colors.primary,
  },
});
