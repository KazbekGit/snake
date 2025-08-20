import React from "react";
import { render, screen } from "@testing-library/react-native";
import { PersonalizedAnalyticsCard } from "../PersonalizedAnalyticsCard";

const mockBehaviorProfile = {
  userId: "test-user",
  engagementMetrics: {
    engagementScore: 75,
    motivationLevel: "high",
  },
  learningPatterns: [],
  performanceTrends: [],
  contentPreferences: {
    favoriteTopics: ["topic1"],
    avoidedTopics: [],
    preferredDifficulty: 0.7,
    preferredContentType: "text",
    learningStyle: "visual",
    pacePreference: "normal",
  },
  timePatterns: {
    preferredStudyTimes: [],
    weeklyPattern: [],
    sessionGaps: [],
    optimalSessionDuration: 30,
    breakPatterns: [],
  },
  socialPatterns: {
    comparisonGroup: "default",
    percentileRank: 50,
    competitiveSpirit: "medium",
    socialMotivation: 0.5,
    peerInfluence: 0.5,
  },
  lastUpdated: Date.now(),
};

const mockPredictiveInsights = {
  userId: "test-user",
  predictions: [
    {
      type: "completion_probability",
      value: 0.8,
      confidence: 0.7,
      timeframe: 30,
      factors: ["стабильный прогресс"],
    },
  ],
  recommendations: [],
  riskFactors: [],
  opportunities: [],
  lastUpdated: Date.now(),
};

describe("PersonalizedAnalyticsCard", () => {
  it("должен рендериться с данными профиля", () => {
    const mockOnPress = jest.fn();

    render(
      <PersonalizedAnalyticsCard
        behaviorProfile={mockBehaviorProfile}
        predictiveInsights={mockPredictiveInsights}
        onPress={mockOnPress}
      />
    );

    expect(screen.getByText("🧠 Ваша аналитика")).toBeTruthy();
    expect(screen.getByText("Вовлеченность")).toBeTruthy();
    expect(screen.getByText("75%")).toBeTruthy();
    expect(screen.getByText("Мотивация")).toBeTruthy();
    expect(screen.getByText("high")).toBeTruthy();
  });

  it("не должен рендериться без профиля", () => {
    const mockOnPress = jest.fn();

    const { UNSAFE_root } = render(
      <PersonalizedAnalyticsCard
        behaviorProfile={null}
        predictiveInsights={mockPredictiveInsights}
        onPress={mockOnPress}
      />
    );

    // Компонент должен возвращать null, поэтому не должно быть дочерних элементов
    expect(UNSAFE_root.children).toHaveLength(0);
  });
});
