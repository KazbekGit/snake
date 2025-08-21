import React, { useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../ui/Typography";
import { ds } from "../ui/theme";
import { colors } from "../constants/colors";
import {
  Achievement,
  getRarityColor,
  getRarityName,
} from "../constants/achievements";

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: (achievement: Achievement) => void;
  showDetails?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onPress,
  showDetails = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const rarityColor = getRarityColor(achievement.rarity);
  const rarityName = getRarityName(achievement.rarity);
  const progress = Math.min(
    (achievement.condition.value / achievement.condition.target) * 100,
    100
  );

  useEffect(() => {
    // Анимация прогресса
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Эффект свечения для разблокированных достижений
    if (achievement.isUnlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [achievement.isUnlocked, progress]);

  const handlePress = () => {
    // Анимация нажатия
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(achievement);
  };

  const getRewardText = () => {
    switch (achievement.reward.type) {
      case "points":
        return `+${achievement.reward.value} очков`;
      case "badge":
        return "Новый бейдж";
      case "unlock":
        return "Разблокировано";
      case "special":
        return "Особая награда";
      default:
        return "";
    }
  };

  const getConditionText = () => {
    const { type, value, target } = achievement.condition;
    switch (type) {
      case "topics_completed":
        return `Изучено тем: ${value}/${target}`;
      case "questions_answered":
        return `Ответов: ${value}/${target}`;
      case "streak_days":
        return `Дней подряд: ${value}/${target}`;
      case "perfect_scores":
        return `Отличных результатов: ${value}/${target}`;
      case "time_spent":
        return `Время изучения: ${Math.floor(value / 60)}ч ${
          value % 60
        }мин / ${Math.floor(target / 60)}ч ${target % 60}мин`;
      case "sections_explored":
        return `Разделов изучено: ${value}/${target}`;
      default:
        return `${value}/${target}`;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          borderColor: achievement.isUnlocked ? rarityColor : colors.border,
          backgroundColor: achievement.isUnlocked
            ? `${rarityColor}10`
            : colors.card,
        },
      ]}
    >
      {/* Эффект свечения для разблокированных достижений */}
      {achievement.isUnlocked && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              backgroundColor: rarityColor,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
            },
          ]}
        />
      )}

      <TouchableOpacity
        onPress={handlePress}
        style={styles.content}
        activeOpacity={0.8}
        disabled={!achievement.isUnlocked}
      >
        {/* Иконка и статус */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: achievement.isUnlocked
                  ? rarityColor
                  : colors.background,
              },
            ]}
          >
            <Ionicons
              name={
                achievement.isUnlocked
                  ? (achievement.icon as any)
                  : "lock-closed"
              }
              size={24}
              color={achievement.isUnlocked ? "white" : colors.textSecondary}
            />
          </View>

          <View style={styles.headerInfo}>
            <Typography variant="subtitle" style={styles.title}>
              {achievement.title}
            </Typography>
            <View style={styles.rarityContainer}>
              <View
                style={[
                  styles.rarityIndicator,
                  { backgroundColor: rarityColor },
                ]}
              />
              <Typography
                variant="caption"
                style={[styles.rarityText, { color: rarityColor }]}
              >
                {rarityName}
              </Typography>
            </View>
          </View>

          {achievement.isUnlocked && (
            <View style={styles.unlockedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
            </View>
          )}
        </View>

        {/* Описание */}
        <Typography variant="body" style={styles.description}>
          {achievement.description}
        </Typography>

        {/* Прогресс */}
        {!achievement.isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: rarityColor,
                  },
                ]}
              />
            </View>
            <Typography variant="caption" style={styles.progressText}>
              {getConditionText()}
            </Typography>
          </View>
        )}

        {/* Награда */}
        {achievement.isUnlocked && (
          <View style={styles.rewardContainer}>
            <Ionicons name="gift-outline" size={16} color={rarityColor} />
            <Typography
              variant="caption"
              style={[styles.rewardText, { color: rarityColor }]}
            >
              {getRewardText()}
            </Typography>
          </View>
        )}

        {/* Дополнительная информация */}
        {showDetails && achievement.isUnlocked && achievement.unlockedAt && (
          <View style={styles.detailsContainer}>
            <Typography variant="caption" style={styles.unlockedDate}>
              Разблокировано:{" "}
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: ds.radius.lg,
    borderWidth: 2,
    marginVertical: ds.spacing.sm,
    overflow: "hidden",
    ...ds.shadow.card,
  },
  glowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: ds.radius.lg,
  },
  content: {
    padding: ds.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ds.spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: ds.spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    color: colors.text,
    marginBottom: ds.spacing.xs,
  },
  rarityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rarityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: ds.spacing.xs,
  },
  rarityText: {
    fontWeight: "bold",
  },
  unlockedBadge: {
    marginLeft: ds.spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    marginBottom: ds.spacing.sm,
  },
  progressContainer: {
    marginBottom: ds.spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background,
    borderRadius: ds.radius.pill,
    overflow: "hidden",
    marginBottom: ds.spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: ds.radius.pill,
  },
  progressText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ds.spacing.xs,
    backgroundColor: colors.background,
    borderRadius: ds.radius.sm,
  },
  rewardText: {
    marginLeft: ds.spacing.xs,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginTop: ds.spacing.sm,
    paddingTop: ds.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  unlockedDate: {
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});
