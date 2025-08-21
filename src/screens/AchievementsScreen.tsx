import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import { useAppTheme } from "../theme/ThemeProvider";
import { AchievementCard } from "../components/AchievementCard";
import { gamificationManager } from "../utils/gamification";
import { Achievement, getRarityColor } from "../constants/achievements";
import { colors } from "../constants/colors";
import { ds } from "../ui/theme";

export const AchievementsScreen: React.FC = () => {
  const { mode } = useAppTheme();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    loadAchievements();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      const progress = await gamificationManager.getUserProgress();
      const statsData = await gamificationManager.getStats();

      setAchievements(progress.achievements);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load achievements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredAchievements = () => {
    let filtered = achievements;

    // Фильтр по категории
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (achievement) => achievement.category === selectedCategory
      );
    }

    // Фильтр по редкости
    if (selectedRarity !== "all") {
      filtered = filtered.filter(
        (achievement) => achievement.rarity === selectedRarity
      );
    }

    // Фильтр по статусу
    if (showUnlockedOnly) {
      filtered = filtered.filter((achievement) => achievement.isUnlocked);
    }

    return filtered;
  };

  const handleAchievementPress = (achievement: Achievement) => {
    // Здесь можно добавить детальное представление достижения
    console.log("Achievement pressed:", achievement.title);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "study":
        return "book";
      case "quiz":
        return "help-circle";
      case "streak":
        return "calendar";
      case "exploration":
        return "compass";
      case "mastery":
        return "trophy";
      default:
        return "star";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "study":
        return "Изучение";
      case "quiz":
        return "Тесты";
      case "streak":
        return "Серии";
      case "exploration":
        return "Исследование";
      case "mastery":
        return "Мастерство";
      default:
        return "Все";
    }
  };

  const categories = [
    { id: "all", name: "Все", icon: "apps" },
    { id: "study", name: "Изучение", icon: "book" },
    { id: "quiz", name: "Тесты", icon: "help-circle" },
    { id: "streak", name: "Серии", icon: "calendar" },
    { id: "exploration", name: "Исследование", icon: "compass" },
    { id: "mastery", name: "Мастерство", icon: "trophy" },
  ];

  const rarities = [
    { id: "all", name: "Все", color: colors.textSecondary },
    { id: "common", name: "Обычные", color: getRarityColor("common") },
    { id: "rare", name: "Редкие", color: getRarityColor("rare") },
    { id: "epic", name: "Эпические", color: getRarityColor("epic") },
    {
      id: "legendary",
      name: "Легендарные",
      color: getRarityColor("legendary"),
    },
  ];

  const filteredAchievements = getFilteredAchievements();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[...colors.gradients.primary]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="heroTitle" style={styles.title}>
            Достижения
          </Typography>
          {stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={20} color="white" />
                <Typography variant="caption" style={styles.statText}>
                  {stats.achievementsUnlocked}/{stats.totalAchievements}
                </Typography>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color="white" />
                <Typography variant="caption" style={styles.statText}>
                  {stats.totalPoints} очков
                </Typography>
              </View>
            </View>
          )}
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Фильтры */}
          <View style={styles.filtersContainer}>
            {/* Категории */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id &&
                      styles.categoryButtonActive,
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={
                      selectedCategory === category.id
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Typography
                    variant="caption"
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category.name}
                  </Typography>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Редкость */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.raritiesScroll}
              contentContainerStyle={styles.raritiesContainer}
            >
              {rarities.map((rarity) => (
                <TouchableOpacity
                  key={rarity.id}
                  onPress={() => setSelectedRarity(rarity.id)}
                  style={[
                    styles.rarityButton,
                    selectedRarity === rarity.id && styles.rarityButtonActive,
                    { borderColor: rarity.color },
                  ]}
                >
                  <View
                    style={[
                      styles.rarityIndicator,
                      { backgroundColor: rarity.color },
                    ]}
                  />
                  <Typography
                    variant="caption"
                    style={[
                      styles.rarityText,
                      { color: rarity.color },
                      selectedRarity === rarity.id && styles.rarityTextActive,
                    ]}
                  >
                    {rarity.name}
                  </Typography>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Переключатель статуса */}
            <TouchableOpacity
              onPress={() => setShowUnlockedOnly(!showUnlockedOnly)}
              style={[
                styles.statusToggle,
                showUnlockedOnly && styles.statusToggleActive,
              ]}
            >
              <Ionicons
                name={showUnlockedOnly ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={showUnlockedOnly ? colors.success : colors.textSecondary}
              />
              <Typography
                variant="caption"
                style={[
                  styles.statusToggleText,
                  showUnlockedOnly && styles.statusToggleTextActive,
                ]}
              >
                Только разблокированные
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Список достижений */}
          <ScrollView
            style={styles.achievementsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.achievementsContainer}
          >
            {filteredAchievements.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="trophy-outline"
                  size={64}
                  color={colors.textSecondary}
                />
                <Typography variant="subtitle" style={styles.emptyTitle}>
                  Достижения не найдены
                </Typography>
                <Typography variant="body" style={styles.emptyText}>
                  Попробуйте изменить фильтры или продолжайте изучать, чтобы
                  разблокировать новые достижения
                </Typography>
              </View>
            ) : (
              filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onPress={handleAchievementPress}
                  showDetails={true}
                />
              ))
            )}
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
  },
  header: {
    paddingHorizontal: ds.spacing.lg,
    paddingVertical: ds.spacing.md,
  },
  title: {
    color: "white",
    textAlign: "center",
    marginBottom: ds.spacing.sm,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: ds.spacing.lg,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: ds.spacing.xs,
  },
  statText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: ds.radius.xl,
    borderTopRightRadius: ds.radius.xl,
  },
  filtersContainer: {
    padding: ds.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesScroll: {
    marginBottom: ds.spacing.sm,
  },
  categoriesContainer: {
    gap: ds.spacing.sm,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ds.spacing.md,
    paddingVertical: ds.spacing.sm,
    borderRadius: ds.radius.pill,
    backgroundColor: colors.background,
    gap: ds.spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary + "20",
  },
  categoryText: {
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
  raritiesScroll: {
    marginBottom: ds.spacing.sm,
  },
  raritiesContainer: {
    gap: ds.spacing.sm,
  },
  rarityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ds.spacing.md,
    paddingVertical: ds.spacing.sm,
    borderRadius: ds.radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    gap: ds.spacing.xs,
  },
  rarityButtonActive: {
    backgroundColor: colors.background,
  },
  rarityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rarityText: {
    fontWeight: "bold",
  },
  rarityTextActive: {
    fontWeight: "bold",
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ds.spacing.sm,
    gap: ds.spacing.xs,
  },
  statusToggleActive: {
    // Стили для активного состояния
  },
  statusToggleText: {
    color: colors.textSecondary,
  },
  statusToggleTextActive: {
    color: colors.success,
    fontWeight: "bold",
  },
  achievementsList: {
    flex: 1,
  },
  achievementsContainer: {
    padding: ds.spacing.md,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ds.spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    marginTop: ds.spacing.md,
    marginBottom: ds.spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: ds.spacing.lg,
  },
});
