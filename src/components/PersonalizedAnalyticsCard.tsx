import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../ui/Typography";
import { Card } from "../ui/Card";
import { colors } from "../constants/colors";
import { ds } from "../ui/theme";

interface PersonalizedAnalyticsCardProps {
  behaviorProfile: any;
  predictiveInsights: any;
  onPress: () => void;
}

export const PersonalizedAnalyticsCard: React.FC<PersonalizedAnalyticsCardProps> =
  React.memo(({ behaviorProfile, predictiveInsights, onPress }) => {
    if (!behaviorProfile) {
      return null;
    }

    const getMotivationColor = (level: string) => {
      switch (level) {
        case "high":
          return colors.success;
        case "medium":
          return colors.warning;
        case "low":
          return colors.error;
        default:
          return colors.text;
      }
    };

    const getMotivationIcon = (level: string) => {
      switch (level) {
        case "high":
          return "trending-up";
        case "medium":
          return "trending-up-outline";
        case "low":
          return "trending-down";
        default:
          return "help-outline";
      }
    };

    return (
      <TouchableOpacity onPress={onPress}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Typography variant="h6" style={styles.title}>
              🧠 Ваша аналитика
            </Typography>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>

          <View style={styles.metricsContainer}>
            <View style={styles.metric}>
              <Typography variant="body2" style={styles.metricLabel}>
                Вовлеченность
              </Typography>
              <Typography variant="h4" style={styles.metricValue}>
                {behaviorProfile.engagementMetrics.engagementScore.toFixed(0)}%
              </Typography>
            </View>

            <View style={styles.metric}>
              <Typography variant="body2" style={styles.metricLabel}>
                Мотивация
              </Typography>
              <View style={styles.motivationContainer}>
                <Ionicons
                  name={getMotivationIcon(
                    behaviorProfile.engagementMetrics.motivationLevel
                  )}
                  size={16}
                  color={getMotivationColor(
                    behaviorProfile.engagementMetrics.motivationLevel
                  )}
                />
                <Typography
                  variant="body2"
                  style={[
                    styles.motivationText,
                    {
                      color: getMotivationColor(
                        behaviorProfile.engagementMetrics.motivationLevel
                      ),
                    },
                  ]}
                >
                  {behaviorProfile.engagementMetrics.motivationLevel}
                </Typography>
              </View>
            </View>
          </View>

          {predictiveInsights && predictiveInsights.predictions.length > 0 && (
            <View style={styles.insightsContainer}>
              <Typography variant="body2" style={styles.insightsTitle}>
                Предиктивные инсайты:
              </Typography>
              {predictiveInsights.predictions
                .slice(0, 2)
                .map((prediction: any, index: number) => (
                  <View key={index} style={styles.insightItem}>
                    <Typography variant="caption" style={styles.insightType}>
                      {prediction.type === "completion_probability"
                        ? "Вероятность завершения"
                        : prediction.type === "dropout_risk"
                        ? "Риск оттока"
                        : prediction.type === "performance_forecast"
                        ? "Прогноз успеваемости"
                        : "Тренд вовлеченности"}
                    </Typography>
                    <Typography variant="body2" style={styles.insightValue}>
                      {(prediction.value * 100).toFixed(0)}%
                    </Typography>
                  </View>
                ))}
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  });

const styles = StyleSheet.create({
  card: {
    marginBottom: ds.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ds.spacing.md,
  },
  title: {
    flex: 1,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: ds.spacing.md,
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    marginBottom: ds.spacing.xs,
    textAlign: "center",
  },
  metricValue: {
    color: colors.primary,
    fontWeight: "bold",
  },
  motivationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: ds.spacing.xs,
  },
  motivationText: {
    fontWeight: "500",
  },
  insightsContainer: {
    paddingTop: ds.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  insightsTitle: {
    marginBottom: 8,
    fontWeight: "500",
  },
  insightItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ds.spacing.xs,
  },
  insightType: {
    flex: 1,
    color: colors.textSecondary,
  },
  insightValue: {
    fontWeight: "600",
    color: colors.primary,
  },
});
