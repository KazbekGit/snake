import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useOfflineFirst } from "../hooks/useOfflineFirst";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Container, Row, Col } from "../ui/Grid";
import { TopNav } from "../ui/TopNav";
import { ds } from "../ui/theme";
import { colors } from "../constants/colors";
import { useAppTheme } from "../theme/ThemeProvider";

interface CacheManagementScreenProps {
  navigation: any;
}

export const CacheManagementScreen: React.FC<CacheManagementScreenProps> = ({
  navigation,
}) => {
  const { mode } = useAppTheme();
  const {
    cacheStats,
    syncStatus,
    syncProgress,
    isInitialized,
    forceSync,
    clearCache,
    cleanupExpiredCache,
    checkConnectivity,
  } = useOfflineFirst();

  const [isLoading, setIsLoading] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Б";
    const k = 1024;
    const sizes = ["Б", "КБ", "МБ", "ГБ"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    if (timestamp === 0) return "Никогда";
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU");
  };

  const handleForceSync = async () => {
    setIsLoading(true);
    try {
      await forceSync();
      Alert.alert("Успешно", "Синхронизация завершена");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось выполнить синхронизацию");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Очистить кэш",
      "Вы уверены, что хотите очистить весь кэш? Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Очистить",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await clearCache();
              Alert.alert("Успешно", "Кэш очищен");
            } catch (error) {
              Alert.alert("Ошибка", "Не удалось очистить кэш");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCleanupExpired = async () => {
    setIsLoading(true);
    try {
      await cleanupExpiredCache();
      Alert.alert("Успешно", "Устаревшие данные очищены");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось очистить устаревшие данные");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckConnectivity = async () => {
    const isOnline = await checkConnectivity();
    Alert.alert(
      "Подключение к интернету",
      isOnline ? "Подключение активно" : "Нет подключения к интернету"
    );
  };

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={mode === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <TopNav />
        <Container>
          <View style={styles.loadingContainer}>
            <Typography variant="title">Загрузка...</Typography>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <TopNav />
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Заголовок */}
          <Row style={{ marginBottom: ds.spacing.lg }}>
            <Col spanDesktop={12} spanTablet={12} spanMobile={12}>
              <Typography variant="heroTitle" style={styles.title}>
                Управление кэшем
              </Typography>
              <Typography variant="body" style={styles.subtitle}>
                Управление офлайн-данными и синхронизацией
              </Typography>
            </Col>
          </Row>

          {/* Статус синхронизации */}
          <Row style={{ marginBottom: ds.spacing.lg }}>
            <Col spanDesktop={12} spanTablet={12} spanMobile={12}>
              <Card>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name={syncStatus.isOnline ? "wifi" : "wifi-outline"}
                    size={24}
                    color={syncStatus.isOnline ? colors.success : colors.error}
                  />
                  <Typography variant="subtitle" style={styles.sectionTitle}>
                    Статус синхронизации
                  </Typography>
                </View>

                <View style={styles.statusGrid}>
                  <View style={styles.statusItem}>
                    <Typography variant="caption" style={styles.statusLabel}>
                      Подключение
                    </Typography>
                    <Typography
                      variant="button"
                      style={[
                        styles.statusValue,
                        {
                          color: syncStatus.isOnline
                            ? colors.success
                            : colors.error,
                        },
                      ]}
                    >
                      {syncStatus.isOnline ? "Онлайн" : "Офлайн"}
                    </Typography>
                  </View>

                  <View style={styles.statusItem}>
                    <Typography variant="caption" style={styles.statusLabel}>
                      Синхронизация
                    </Typography>
                    <Typography
                      variant="button"
                      style={[
                        styles.statusValue,
                        {
                          color: syncStatus.isSyncing
                            ? colors.warning
                            : colors.text,
                        },
                      ]}
                    >
                      {syncStatus.isSyncing ? "В процессе" : "Готово"}
                    </Typography>
                  </View>

                  <View style={styles.statusItem}>
                    <Typography variant="caption" style={styles.statusLabel}>
                      Ожидающие изменения
                    </Typography>
                    <Typography variant="button" style={styles.statusValue}>
                      {syncStatus.pendingChanges}
                    </Typography>
                  </View>

                  <View style={styles.statusItem}>
                    <Typography variant="caption" style={styles.statusLabel}>
                      Последняя синхронизация
                    </Typography>
                    <Typography variant="button" style={styles.statusValue}>
                      {formatDate(syncStatus.lastSync)}
                    </Typography>
                  </View>
                </View>

                {syncProgress && (
                  <View style={styles.progressContainer}>
                    <Typography variant="caption" style={styles.progressText}>
                      {syncProgress.message}
                    </Typography>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              (syncProgress.current / syncProgress.total) * 100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <Button
                    label="Принудительная синхронизация"
                    onPress={handleForceSync}
                    disabled={isLoading || !syncStatus.isOnline}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <TouchableOpacity
                    onPress={handleCheckConnectivity}
                    style={styles.iconButton}
                  >
                    <Ionicons name="refresh" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            </Col>
          </Row>

          {/* Статистика кэша */}
          <Row style={{ marginBottom: ds.spacing.lg }}>
            <Col spanDesktop={12} spanTablet={12} spanMobile={12}>
              <Card>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="stats-chart"
                    size={24}
                    color={colors.primary}
                  />
                  <Typography variant="subtitle" style={styles.sectionTitle}>
                    Статистика кэша
                  </Typography>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Typography variant="heroTitle" style={styles.statValue}>
                      {cacheStats.topicsCount}
                    </Typography>
                    <Typography variant="caption" style={styles.statLabel}>
                      Тем в кэше
                    </Typography>
                  </View>

                  <View style={styles.statItem}>
                    <Typography variant="heroTitle" style={styles.statValue}>
                      {cacheStats.imagesCount}
                    </Typography>
                    <Typography variant="caption" style={styles.statLabel}>
                      Изображений
                    </Typography>
                  </View>

                  <View style={styles.statItem}>
                    <Typography variant="heroTitle" style={styles.statValue}>
                      {formatBytes(cacheStats.totalSize)}
                    </Typography>
                    <Typography variant="caption" style={styles.statLabel}>
                      Общий размер
                    </Typography>
                  </View>

                  <View style={styles.statItem}>
                    <Typography variant="heroTitle" style={styles.statValue}>
                      {cacheStats.version}
                    </Typography>
                    <Typography variant="caption" style={styles.statLabel}>
                      Версия кэша
                    </Typography>
                  </View>
                </View>
              </Card>
            </Col>
          </Row>

          {/* Действия */}
          <Row style={{ marginBottom: ds.spacing.lg }}>
            <Col spanDesktop={12} spanTablet={12} spanMobile={12}>
              <Card>
                <View style={styles.sectionHeader}>
                  <Ionicons name="settings" size={24} color={colors.primary} />
                  <Typography variant="subtitle" style={styles.sectionTitle}>
                    Действия
                  </Typography>
                </View>

                <View style={styles.actionButtons}>
                  <Button
                    label="Очистить устаревшие данные"
                    onPress={handleCleanupExpired}
                    disabled={isLoading}
                    variant="secondary"
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    label="Очистить весь кэш"
                    onPress={handleClearCache}
                    disabled={isLoading}
                    variant="danger"
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            </Col>
          </Row>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: ds.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ds.spacing.lg,
  },
  sectionTitle: {
    marginLeft: 8,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: ds.spacing.lg,
  },
  statusItem: {
    width: "50%",
    marginBottom: ds.spacing.md,
  },
  statusLabel: {
    color: colors.textSecondary,
    marginBottom: ds.spacing.xs,
  },
  statusValue: {
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: ds.spacing.lg,
  },
  progressText: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: ds.radius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statItem: {
    width: "50%",
    alignItems: "center",
    marginBottom: ds.spacing.lg,
  },
  statValue: {
    color: colors.primary,
    marginBottom: ds.spacing.xs,
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: "center",
  },
});
