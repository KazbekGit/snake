import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { Button } from "../ui/Button";
import { ds } from "../ui/theme";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Card } from "../ui/Card";
import { Container, Row, Col } from "../ui/Grid";
import { TopNav } from "../ui/TopNav";
import { CheckIcon } from "../ui/icons/CheckIcon";
import { BookIcon } from "../ui/icons/BookIcon";
import { ChartIcon } from "../ui/icons/ChartIcon";
import { Teacher } from "../ui/illustrations/Teacher";
import { Typography } from "../ui/Typography";
import { useI18n } from "../hooks/useI18n";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

const { width, height } = Dimensions.get("window");

interface WelcomeScreenProps {
  navigation: NavigationProp<RootStackParamList, "Welcome">;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useI18n();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Анимация появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStartLearning = () => {
    navigation.navigate("GradeSelection");
  };

  const handleLogin = () => {
    // TODO: Реализовать вход для существующих пользователей
    console.log("Вход в приложение");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
        <Container>
          <TopNav>
            <LanguageSwitcher />
          </TopNav>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <Row>
              <Col spanDesktop={7} spanTablet={7} spanMobile={12}>
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <Text style={styles.logoEmoji}>📚</Text>
                  </View>
                  <Typography variant="heroTitle" style={{ color: colors.navy, textAlign: "center", marginBottom: 5 }}>
                    {t('appTitle')}
                  </Typography>
                  <Typography variant="subtitle" style={{ color: colors.navy, textAlign: "center" }}>
                    {t('appSubtitle')}
                  </Typography>
                  <View style={styles.descriptionContainer}>
                    <Typography style={{ color: colors.navy, textAlign: "center", paddingHorizontal: 20 }}>
                      {t('appSubtitle')}
                    </Typography>
                  </View>
                  <View style={styles.buttonContainer}>
                    <Button
                      label={t('startButton')}
                      onPress={handleStartLearning}
                    />
                    <View style={{ height: ds.spacing.sm }} />
                    <Button
                      label={t('continueLearning')}
                      onPress={handleLogin}
                      variant="ghost"
                    />
                    <View style={{ height: ds.spacing.xs }} />
                    <Button
                      label={t('testTitle')}
                      onPress={handleLogin}
                      variant="ghost"
                    />
                  </View>
                </View>
              </Col>
              <Col spanDesktop={5} spanTablet={5} spanMobile={12}>
                <View style={styles.illustrationContainer}>
                  <Teacher />
                </View>
              </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
              <Col spanDesktop={4} spanTablet={4} spanMobile={12}>
                <Card style={styles.bottomCard}>
                  <CheckIcon />
                  <Text style={styles.bottomLabel}>{t('testTitle')}</Text>
                </Card>
              </Col>
              <Col spanDesktop={4} spanTablet={4} spanMobile={12}>
                <Card style={styles.bottomCard}>
                  <BookIcon />
                  <Text style={styles.bottomLabel}>{t('topics')}</Text>
                </Card>
              </Col>
              <Col spanDesktop={4} spanTablet={4} spanMobile={12}>
                <Card style={styles.bottomCard}>
                  <ChartIcon />
                  <Text style={styles.bottomLabel}>{t('statistics')}</Text>
                </Card>
              </Col>
            </Row>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Соответствует ФГОС • Бесплатно • Для 8-11 классов
              </Text>
            </View>
          </Animated.View>
        </Container>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingVertical: 32,
  },
  topNav: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoText: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: "800",
  },
  topNavMenu: {
    flexDirection: "row",
    alignItems: "center",
  },
  topNavItem: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 16,
  },
  topNavAvatar: {
    fontSize: 22,
    marginLeft: 8,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.navy,
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "400",
    color: colors.navy,
    textAlign: "center",
    opacity: 0.9,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  illustration: {
    position: "relative",
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  studentEmoji: {
    fontSize: 60,
    position: "absolute",
    top: 20,
  },
  phoneEmoji: {
    fontSize: 40,
    position: "absolute",
    right: 20,
    bottom: 40,
  },
  bookEmoji: {
    fontSize: 40,
    position: "absolute",
    left: 20,
    bottom: 40,
  },
  descriptionContainer: {
    marginBottom: 40,
  },
  description: {
    fontSize: 16,
    color: colors.navy,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 24,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  bottomCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  bottomIcon: {
    fontSize: 22,
    marginBottom: 8,
    color: colors.navy,
    textAlign: "center",
  },
  bottomLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: colors.navy,
    opacity: 0.7,
    textAlign: "center",
  },
});

export default WelcomeScreen;
