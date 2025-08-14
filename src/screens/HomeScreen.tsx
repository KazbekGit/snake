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
import { getTopicWithCache } from "../content/loader";
import { getTopicFallback } from "../content/index";
import { Container, Row, Col } from "../ui/Grid";
import { TopNav } from "../ui/TopNav";

interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList, "Home">;
}

// Используем данные из централизованного источника

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [sections] = useState<Section[]>([
    {
      id: "person-society",
      title: "Человек и общество",
      description:
        "Изучаем природу человека, его место в обществе и основные социальные процессы",
      icon: "👤",
      order: 1,
      topics: [],
      isCompleted: false,
      progress: 60,
    },
    {
      id: "economy",
      title: "Экономика",
      description:
        "Основы экономической теории, рынок, деньги, банки и государственная экономическая политика",
      icon: "💰",
      order: 2,
      topics: [],
      isCompleted: true,
      progress: 100,
    },
    {
      id: "social-relations",
      title: "Социальные отношения",
      description:
        "Социальная структура, группы, семья, конфликты и социальная политика",
      icon: "👥",
      order: 3,
      topics: [],
      isCompleted: false,
      progress: 30,
    },
    {
      id: "politics",
      title: "Политика",
      description:
        "Политическая система, государство, выборы, партии и гражданское общество",
      icon: "🏛️",
      order: 4,
      topics: [],
      isCompleted: false,
      progress: 0,
    },
    {
      id: "law",
      title: "Право",
      description:
        "Правовая система, Конституция РФ, права человека и судебная система",
      icon: "⚖️",
      order: 5,
      topics: [],
      isCompleted: false,
      progress: 0,
    },
    {
      id: "spiritual-culture",
      title: "Духовная культура",
      description: "Культура, мораль, религия, образование, наука и искусство",
      icon: "🎨",
      order: 6,
      topics: [],
      isCompleted: false,
      progress: 0,
    },
  ]);

  const handleSectionPress = async (section: Section) => {
    // Для демо-версии используем тему "Деньги"
    const fallback = getTopicFallback("money") || {
      id: "money",
      sectionId: section.id,
      title: "Деньги",
      description: "Изучаем природу денег, их функции и роль в экономике",
      coverImage:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
      order: 1,
      gradeLevel: 9,
      isPremium: false,
      contentBlocks: moneyTopic.contentBlocks,
      quiz: moneyTopic.quiz,
      isCompleted: false,
      progress: 0,
      bestScore: 0,
      totalBlocks: moneyTopic.contentBlocks.length,
      completedBlocks: 0,
      estimatedTime: 20,
      difficulty: "medium",
      learningObjectives: [
        "Понять что такое деньги и их роль в экономике",
        "Изучить 5 основных функций денег",
        "Различать виды денег и их особенности",
      ],
    };

    const loaded = await getTopicWithCache("money", fallback as any);

    navigation.navigate("Topic", { topic: loaded as any });
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
    const fallback = getTopicFallback(lastTopicId) || {
      id: lastTopicId,
      sectionId: "economy",
      title: "Деньги",
      description: "Изучаем природу денег, их функции и роль в экономике",
      coverImage:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
      order: 1,
      gradeLevel: 9,
      isPremium: false,
      contentBlocks: moneyTopic.contentBlocks,
      quiz: moneyTopic.quiz,
      isCompleted: false,
      progress: 0,
      bestScore: 0,
      totalBlocks: moneyTopic.contentBlocks.length,
      completedBlocks: 0,
      estimatedTime: 20,
      difficulty: "medium",
      learningObjectives: [
        "Понять что такое деньги и их роль в экономике",
        "Изучить 5 основных функций денег",
        "Различать виды денег и их особенности",
      ],
    };
    const loaded = await getTopicWithCache(lastTopicId, fallback as any);
    navigation.navigate("TheoryBlock", { topic: loaded as any, blockIndex });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Container>
        <TopNav />

        {/* Верхняя панель с прогрессом */}
        <View style={styles.header}>
          {/* Заголовок страницы */}
          <Text style={styles.pageTitle}>{t("dashboard")}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("Welcome")}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <LinearGradient
              colors={[...colors.gradients.primary]}
              style={styles.progressCard}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>{t("yourProgress")}</Text>
                <View style={styles.headerButtons}>
                  <TouchableOpacity
                    onPress={handleStatisticsPress}
                    style={styles.headerButton}
                  >
                    <Text style={styles.headerButtonText}>📊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleProfilePress}
                    style={styles.headerButton}
                  >
                    <Text style={styles.headerButtonText}>👤</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {mockUserProgress.completedSections}
                  </Text>
                  <Text style={styles.statLabel}>
                    из {mockUserProgress.totalSections} разделов
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{mockUserProgress.xp}</Text>
                  <Text style={styles.statLabel}>XP</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{mockUserProgress.streak}</Text>
                  <Text style={styles.statLabel}>дней подряд</Text>
                </View>
              </View>
              {/* CTA Continue */}
              <TouchableOpacity
                onPress={handleContinuePress}
                style={{
                  marginTop: 12,
                  alignSelf: "flex-end",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {t("continue")} ▶
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        <Row>
          <Col spanDesktop={12} spanTablet={12} spanMobile={12}>
            <View style={{ marginTop: 10 }}>
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
                      <Text style={styles.chipText}>Экономика</Text>
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
                      <Button label={t("continue")} onPress={handleContinuePress} />
                      <Button
                        label={t("repeat")}
                        variant="secondary"
                        onPress={() =>
                          navigation.navigate("Topic", {
                            topic: { id: "money", title: "Деньги" } as unknown as any,
                          })
                        }
                      />
                      <Button
                        label={t("start")}
                        variant="danger"
                        onPress={() =>
                          handleSectionPress({
                            id: "economy",
                            title: "Экономика",
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
            </View>
          </Col>
        </Row>

        {/* Основной контент */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionsContainer}>
            <View style={styles.sectionsHeader}>
              <Text style={styles.sectionsTitle}>Разделы обществознания</Text>
              <TouchableOpacity onPress={handleSearchPress}>
                <Text style={styles.searchButton}>🔍</Text>
              </TouchableOpacity>
            </View>

            {sections.map((section) => (
              <View key={section.id} style={{ marginBottom: 12 }}>
                <SectionCard
                  iconNode={<Text style={{ fontSize: 28 }}>⬤</Text>}
                  title={section.title}
                  description={section.description}
                  colorFrom={
                    SECTION_COLORS[section.id as keyof typeof SECTION_COLORS]
                  }
                  progress={section.progress}
                  onPress={() => handleSectionPress(section)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  progressCard: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textLight,
  },
  profileButton: {
    fontSize: 24,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textLight,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.8,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionsContainer: {
    gap: 16,
  },
  sectionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  searchButton: {
    fontSize: 24,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionGradient: {
    padding: 20,
  },
  sectionContent: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textLight,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
    lineHeight: 20,
  },
  completedIcon: {
    fontSize: 20,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textLight,
    minWidth: 35,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
    zIndex: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  headerButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerButtonText: {
    fontSize: 24,
    color: colors.textLight,
  },
  continueCard: {
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  continueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
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
  bigCta: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bigCtaText: {
    color: "white",
    fontWeight: "700",
  },
});

export default HomeScreen;
