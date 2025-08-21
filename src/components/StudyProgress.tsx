import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../ui/Typography";
import { ds } from "../ui/theme";
import { colors } from "../constants/colors";

interface StudyProgressProps {
  currentBlock: number;
  totalBlocks: number;
  timeSpent: number; // в минутах
  onBlockPress?: (blockIndex: number) => void;
  showDetails?: boolean;
}

export const StudyProgress: React.FC<StudyProgressProps> = ({
  currentBlock,
  totalBlocks,
  timeSpent,
  onBlockPress,
  showDetails = false,
}) => {
  const [expanded, setExpanded] = useState(showDetails);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const progressAnimation = React.useRef(new Animated.Value(0)).current;
  const expandAnimation = React.useRef(
    new Animated.Value(showDetails ? 1 : 0)
  ).current;

  const progress = (currentBlock / totalBlocks) * 100;
  const timeSpentHours = Math.floor(timeSpent / 60);
  const timeSpentMinutes = timeSpent % 60;

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    Animated.timing(expandAnimation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const handleBlockPress = (blockIndex: number) => {
    setSelectedBlock(blockIndex);
    onBlockPress?.(blockIndex);

    // Сбрасываем выделение через 1 секунду
    setTimeout(() => setSelectedBlock(null), 1000);
  };

  const getBlockStatus = (blockIndex: number) => {
    if (blockIndex < currentBlock) return "completed";
    if (blockIndex === currentBlock) return "current";
    return "pending";
  };

  const getBlockIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "current":
        return "play-circle";
      default:
        return "ellipse-outline";
    }
  };

  const getBlockColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "current":
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const renderBlock = (blockIndex: number) => {
    const status = getBlockStatus(blockIndex);
    const icon = getBlockIcon(status);
    const color = getBlockColor(status);
    const isSelected = selectedBlock === blockIndex;

    return (
      <TouchableOpacity
        key={blockIndex}
        onPress={() => handleBlockPress(blockIndex)}
        style={[styles.blockItem, isSelected && styles.blockSelected]}
        activeOpacity={0.7}
      >
        <View style={[styles.blockIcon, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.blockInfo}>
          <Typography variant="caption" style={[styles.blockTitle, { color }]}>
            Блок {blockIndex + 1}
          </Typography>
          {expanded && (
            <Typography variant="caption" style={styles.blockStatus}>
              {status === "completed" && "Завершен"}
              {status === "current" && "Изучается"}
              {status === "pending" && "Ожидает"}
            </Typography>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Typography variant="subtitle" style={styles.title}>
            Прогресс изучения
          </Typography>
        </View>
        <View style={styles.headerRight}>
          <Typography variant="caption" style={styles.progressText}>
            {Math.round(progress)}%
          </Typography>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons
            name="book-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Typography variant="caption" style={styles.statText}>
            {currentBlock} из {totalBlocks} блоков
          </Typography>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Typography variant="caption" style={styles.statText}>
            {timeSpentHours > 0 && `${timeSpentHours}ч `}
            {timeSpentMinutes}мин
          </Typography>
        </View>
      </View>

      <Animated.View
        style={[
          styles.detailsContainer,
          {
            maxHeight: expandAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
            opacity: expandAnimation,
          },
        ]}
      >
        <View style={styles.blocksContainer}>
          {Array.from({ length: totalBlocks }, (_, i) => renderBlock(i))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: ds.radius.lg,
    padding: ds.spacing.md,
    marginVertical: ds.spacing.sm,
    ...ds.shadow.card,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ds.spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: ds.spacing.sm,
    color: colors.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    color: colors.primary,
    fontWeight: "bold",
    marginRight: ds.spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: ds.radius.pill,
    overflow: "hidden",
    marginBottom: ds.spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: ds.radius.pill,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: ds.spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: ds.spacing.xs,
    color: colors.textSecondary,
  },
  detailsContainer: {
    overflow: "hidden",
  },
  blocksContainer: {
    gap: ds.spacing.sm,
  },
  blockItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: ds.spacing.sm,
    borderRadius: ds.radius.sm,
    backgroundColor: colors.background,
  },
  blockSelected: {
    backgroundColor: colors.primary + "10",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  blockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: ds.spacing.sm,
  },
  blockInfo: {
    flex: 1,
  },
  blockTitle: {
    fontWeight: "bold",
  },
  blockStatus: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});
