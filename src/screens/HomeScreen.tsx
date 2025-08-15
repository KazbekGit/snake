import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Donut } from "../components/Donut";
import { DashboardCard } from "../components/DashboardCard";
import { SectionCard } from "../ui/SectionCard";
import { Button } from "../ui/Button";
import { colors } from "../constants/colors";
import { t } from "../i18n";
import { getTopicProgress, getUserProgress } from "../utils/progressStorage";
import {
  computeStartBlockIndex,
  getLastStudiedTopicIdFromUserProgress,
} from "../utils/progressHelpers";
import { NavigationProp } from "@react-navigation/native";
import { Section } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SECTIONS, SECTION_COLORS } from "../constants/sections";
import { mockUserProgress, moneyTopic } from "../data";
import { contentLoader } from "../content/loader";
import { getTopicFallback, getTopicsBySection } from "../content/index";
import { Container, Row, Col, useBreakpoint } from "../ui/Grid";
import { TopNav } from "../ui/TopNav";
import { PersonIcon } from "../ui/icons/PersonIcon";
import { Typography } from "../ui/Typography";
import { ds } from "../ui/theme";
import { BankIcon } from "../ui/icons/BankIcon";
import { GroupIcon } from "../ui/icons/GroupIcon";
import { GovernmentIcon } from "../ui/icons/GovernmentIcon";
import { JusticeIcon } from "../ui/icons/JusticeIcon";
import { CultureIcon } from "../ui/icons/CultureIcon";
import { UserIcon } from "../ui/icons/UserIcon";
import { ChartIcon } from "../ui/icons/ChartIcon";
import { SearchIcon } from "../ui/icons/SearchIcon";
import HeroPhoto from "../ui/HeroPhoto";
import { useAdvancedAnalytics } from "../hooks/useAdvancedAnalytics";
import { useAppTheme } from "../theme/ThemeProvider";

interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList, "Home">;
}

// Используем данные из централизованного источника

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { getProfile, getHighPriorityRecommendations } = useAdvancedAnalytics();
  const { mode } = useAppTheme();
  const bp = useBreakpoint();
  const heroSize = bp === "desktop" ? 400 : bp === "tablet" ? 320 : 260;

  const [sections] = useState<Section[]>([
    {
      id: "person-society",
      title: t("sectionsList.personSociety"),
      description: t("sectionDescriptions.personSociety"),
      icon: "👤",
      order: 1,
      topics: [],
      isCompleted: false,
      progress: 60,
    },
    {
      id: "economy",
      title: t("sectionsList.economy"),
      description: t("sectionDescriptions.economy"),
      icon: "💰",
      order: 2,
      topics: [],
      isCompleted: true,
      progress: 100,
    },
    {
      id: "social-relations",
      title: t("sectionsList.socialRelations"),
      description: t("sectionDescriptions.socialRelations"),
      icon: "👥",
      order: 3,
      topics: [],
      isCompleted: false,
      progress: 30,
    },
    {
      id: "politics",
      title: t("sectionsList.politics"),
      description: t("sectionDescriptions.politics"),
      icon: "🏛️",
      order: 4,
      topics: [],
      isCompleted: false,
      progress: 0,
    },
    {
      id: "law",
      title: t("sectionsList.law"),
      description: t("sectionDescriptions.law"),
      icon: "⚖️",
      order: 5,
      topics: [],
      isCompleted: false,
      progress: 0,
    },
    {
      id: "spiritual-culture",
      title: t("sectionsList.culture"),
      description: t("sectionDescriptions.culture"),
      icon: "🎨",
      order: 6,
      topics: [],
      isCompleted: false,
      progress: 0,
    },
  ]);

  const handleSectionPress = async (section: Section) => {
    // Получаем первую доступную тему для секции
    const sectionTopics = getTopicsBySection(section.id);
    const topicId = sectionTopics.length > 0 ? sectionTopics[0].id : "money";

    try {
      const loaded = await contentLoader.loadTopic(topicId);
      navigation.navigate("Topic", { topic: loaded as any });
    } catch (error) {
      console.error("Failed to load topic:", error);
      // Fallback на тему "Деньги"
      const fallback = getTopicFallback("money");
      if (fallback) {
        navigation.navigate("Topic", { topic: fallback as any });
      }
    }
  };

  const handleProfilePress = () => {
    (navigation as any).navigate("Profile");
  };

  const handleStatisticsPress = () => {
    navigation.navigate("Statistics");
  };

  const handleSearchPress = () => {
    (navigation as any).navigate("Search");
  };

  const handleContinuePress = async () => {
    const userProgress = await getUserProgress();
    const lastTopicId =
      getLastStudiedTopicIdFromUserProgress(userProgress) || "money";
    const progress = await getTopicProgress(lastTopicId);
    const blockIndex = computeStartBlockIndex(progress);

    try {
      const loaded = await contentLoader.loadTopic(lastTopicId);
      navigation.navigate("TheoryBlock", { topic: loaded as any, blockIndex });
    } catch (error) {
      console.error("Failed to load topic:", error);
      // Fallback на тему "Деньги"
      const fallback = getTopicFallback("money");
      if (fallback) {
        navigation.navigate("TheoryBlock", {
          topic: fallback as any,
          blockIndex,
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <Container>
        <TopNav />
        <Row style={{ marginTop: ds.spacing.xl }}>
          <Col spanDesktop={7} spanTablet={7} spanMobile={12}>
            <DashboardCard
              title={t("continueStudy")}
              right={
                <View style={styles.chipsRow}>
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <Ionicons
                      name="book-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.chipText}>
                      {t("sectionsList.economy")}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.chipText}>~20 мин</Text>
                  </View>
                </View>
              }
            >
              <View style={styles.continueBody}>
                <Donut progress={65} />
                <View style={{ flex: 1 }}>
                  <View style={styles.bigCtaRow}>
                    <Button
                      label={t("continue")}
                      onPress={handleContinuePress}
                      testID="home_continue_btn"
                    />
                    <Button
                      label={t("repeat")}
                      variant="secondary"
                      testID="home_repeat_btn"
                      onPress={() =>
                        navigation.navigate("Topic", {
                          topic: {
                            id: "money",
                            title: t("money"),
                          } as unknown as any,
                        })
                      }
                    />
                    <Button
                      label={t("start")}
                      variant="danger"
                      testID="home_start_btn"
                      onPress={() =>
                        handleSectionPress({
                          id: "economy",
                          title: t("sectionsList.economy"),
                          description: "",
                          icon: "💰",
                          order: 0,
                          topics: [],
                          isCompleted: false,
                          progress: 0,
                        })
                      }
                    />
                  </View>
                </View>
              </View>
            </DashboardCard>
          </Col>
          <Col spanDesktop={5} spanTablet={5} spanMobile={12}>
            {/* Hero Photo (Social studies themed) */}
            <View style={styles.illustrationContainer}>
              <HeroPhoto
                uri={require("../../assets/images/hero.png")}
                width={heroSize}
                height={heroSize}
              />
            </View>
          </Col>
        </Row>

        {/* Recommendations */}
        {(() => {
          const highPriorityRecs = getHighPriorityRecommendations();
          if (highPriorityRecs.length > 0) {
            return (
              <Row style={{ marginTop: ds.spacing.xl }}>
                <Col spanDesktop={12} spanTablet={12} spanMobile={12}>
                  <View style={styles.sectionsHeader}>
                    <Typography variant="title">🔥 Рекомендации</Typography>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("AdvancedAnalytics" as any)
                      }
                    >
                      <ChartIcon size={ds.spacing.xxl} color={colors.navy} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.recommendationsContainer}
                  >
                    {highPriorityRecs.slice(0, 3).map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <View style={styles.recommendationCard}>
                          <Text style={styles.recommendationIcon}>
                            {rec.type === "review_weak_topic"
                              ? "📚"
                              : rec.type === "continue_streak"
                              ? "🔥"
                              : rec.type === "try_new_topic"
                              ? "🆕"
                              : rec.type === "practice_mistakes"
                              ? "❌"
                              : "💡"}
                          </Text>
                          <Typography
                            variant="subtitle"
                            style={styles.recommendationTitle}
                          >
                            {rec.title}
                          </Typography>
                          <Typography style={styles.recommendationDescription}>
                            {rec.description}
                          </Typography>
                          <View style={styles.recommendationFooter}>
                            <Text style={styles.recommendationTime}>
                              {rec.estimatedTime} мин
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </Col>
              </Row>
            );
          }
          return null;
        })()}

        {/* Sections */}
        <Row style={{ marginTop: ds.spacing.xl }}>
          <Col spanDesktop={12} spanTablet={12} spanMobile={12}>
            <View style={styles.sectionsHeader}>
              <Typography variant="title">{t("sectionsTitle")}</Typography>
              <TouchableOpacity onPress={handleSearchPress}>
                <SearchIcon size={ds.spacing.xxl} color={colors.navy} />
              </TouchableOpacity>
            </View>
          </Col>
          {sections.map((section) => {
            const iconMap: Record<string, JSX.Element> = {
              "person-society": <PersonIcon size={28} color="#FFFFFF" />,
              economy: <BankIcon size={28} color="#FFFFFF" />,
              "social-relations": <GroupIcon size={28} color="#FFFFFF" />,
              politics: <GovernmentIcon size={28} color="#FFFFFF" />,
              law: <JusticeIcon size={28} color="#FFFFFF" />,
              "spiritual-culture": <CultureIcon size={28} color="#FFFFFF" />,
            };
            return (
              <Col
                key={section.id}
                spanDesktop={4}
                spanTablet={6}
                spanMobile={12}
                style={{ marginBottom: ds.spacing.lg }}
              >
                <SectionCard
                  iconNode={iconMap[section.id]}
                  title={section.title}
                  description={section.description}
                  colorFrom={
                    SECTION_COLORS[section.id as keyof typeof SECTION_COLORS]
                  }
                  progress={section.progress}
                  onPress={() => handleSectionPress(section)}
                />
              </Col>
            );
          })}
        </Row>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  sectionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ds.spacing.lg,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  chipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  continueBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  donutWrapper: {
    width: 110,
    alignItems: "center",
  },
  donutOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  donutInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  donutText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  donutCaption: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bigCtaRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  recommendationsContainer: {
    marginBottom: ds.spacing.lg,
  },
  recommendationItem: {
    marginRight: ds.spacing.md,
    width: 280,
  },
  recommendationCard: {
    backgroundColor: ds.colors.card,
    borderRadius: ds.radius.lg,
    padding: ds.spacing.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recommendationIcon: {
    fontSize: 24,
    marginBottom: ds.spacing.sm,
  },
  recommendationTitle: {
    color: ds.colors.text,
    marginBottom: ds.spacing.xs,
    fontWeight: "600",
  },
  recommendationDescription: {
    color: ds.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: ds.spacing.md,
  },
  recommendationFooter: {
    alignItems: "flex-end",
  },
  recommendationTime: {
    fontSize: 12,
    fontWeight: "600",
    color: ds.colors.primary,
  },
});

export default HomeScreen;
