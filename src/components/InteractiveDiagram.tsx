import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../ui/Typography";
import { ds } from "../ui/theme";
import { colors } from "../constants/colors";

const { width } = Dimensions.get("window");

interface DiagramStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface InteractiveDiagramProps {
  title: string;
  steps: DiagramStep[];
  onStepPress?: (step: DiagramStep) => void;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  title,
  steps,
  onStepPress,
}) => {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});

  // Инициализируем анимационные значения
  steps.forEach((step) => {
    if (!animatedValues.current[step.id]) {
      animatedValues.current[step.id] = new Animated.Value(0);
    }
  });

  const handleStepPress = (step: DiagramStep) => {
    // Анимация нажатия
    Animated.sequence([
      Animated.timing(animatedValues.current[step.id], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues.current[step.id], {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setActiveStep(step.id);

    // Отмечаем шаг как завершенный
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(step.id);
    setCompletedSteps(newCompletedSteps);

    onStepPress?.(step);

    // Сбрасываем активный шаг через 2 секунды
    setTimeout(() => setActiveStep(null), 2000);
  };

  const renderStep = (step: DiagramStep, index: number) => {
    const isActive = activeStep === step.id;
    const isCompleted = completedSteps.has(step.id);
    const scale =
      animatedValues.current[step.id]?.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.95],
      }) || 1;

    return (
      <Animated.View
        key={step.id}
        style={[
          styles.stepContainer,
          { transform: [{ scale }] },
          isActive && styles.stepActive,
          isCompleted && styles.stepCompleted,
        ]}
      >
        <TouchableOpacity
          onPress={() => handleStepPress(step)}
          style={[
            styles.stepButton,
            { backgroundColor: step.color },
            isCompleted && styles.stepButtonCompleted,
          ]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isCompleted ? "checkmark" : (step.icon as any)}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <View style={styles.stepContent}>
          <Typography variant="subtitle" style={styles.stepTitle}>
            {step.title}
          </Typography>
          <Typography variant="caption" style={styles.stepDescription}>
            {step.description}
          </Typography>
        </View>

        {/* Соединительная линия (кроме последнего элемента) */}
        {index < steps.length - 1 && (
          <View style={[styles.connector, { backgroundColor: step.color }]} />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={24} color={colors.primary} />
        <Typography variant="subtitle" style={styles.title}>
          {title}
        </Typography>
      </View>

      <View style={styles.diagramContainer}>
        {steps.map((step, index) => renderStep(step, index))}
      </View>

      {activeStep && (
        <View style={styles.activeStepInfo}>
          <Typography variant="body" style={styles.activeStepText}>
            Нажмите на элементы для изучения
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: ds.spacing.lg,
    padding: ds.spacing.md,
    backgroundColor: colors.card,
    borderRadius: ds.radius.lg,
    ...ds.shadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ds.spacing.lg,
  },
  title: {
    marginLeft: ds.spacing.sm,
    color: colors.text,
  },
  diagramContainer: {
    alignItems: "center",
  },
  stepContainer: {
    alignItems: "center",
    marginBottom: ds.spacing.md,
  },
  stepButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: ds.spacing.sm,
    ...ds.shadow.button,
  },
  stepButtonCompleted: {
    backgroundColor: colors.success,
  },
  stepActive: {
    transform: [{ scale: 1.05 }],
  },
  stepCompleted: {
    opacity: 0.8,
  },
  stepContent: {
    alignItems: "center",
    maxWidth: width * 0.7,
  },
  stepTitle: {
    color: colors.text,
    textAlign: "center",
    marginBottom: ds.spacing.xs,
  },
  stepDescription: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  connector: {
    width: 2,
    height: 20,
    marginVertical: ds.spacing.sm,
  },
  activeStepInfo: {
    marginTop: ds.spacing.md,
    padding: ds.spacing.sm,
    backgroundColor: colors.primary + "10",
    borderRadius: ds.radius.sm,
  },
  activeStepText: {
    color: colors.primary,
    textAlign: "center",
    fontStyle: "italic",
  },
});
