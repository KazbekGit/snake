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
import { Teacher } from "../ui/illustrations/Teacher";

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
          </Col>
          <Col spanDesktop={5} spanTablet={5} spanMobile={12}>
            {/* Teacher Illustration */}
            <View style={styles.illustrationContainer}>
              <Teacher />
            </View>
          </Col>
        </Row>

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
              <Col key={section.id} spanDesktop={4} spanTablet={6} spanMobile={12} style={{ marginBottom: ds.spacing.lg }}>
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
    height: 200,
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

});

export default HomeScreen;
