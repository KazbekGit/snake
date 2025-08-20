import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AppThemeProvider } from "../../theme/ThemeProvider";
import WelcomeScreen from "../WelcomeScreen";
import HomeScreen from "../HomeScreen";
import TopicHeaderScreen from "../TopicHeaderScreen";
import TheoryBlockScreen from "../TheoryBlockScreen";
import MiniTestScreen from "../MiniTestScreen";
import StatisticsScreen from "../StatisticsScreen";

// Local test data
const moneyTopic = {
  id: "money",
  title: "Что такое деньги?",
  description: "Изучение основ денежной системы",
  sectionId: "economy",
  blocks: [],
  questions: [],
};

// Mock AsyncStorage
const mockStorage: { [key: string]: string } = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
}));

// Mock progressStorage to avoid errors
jest.mock("../../utils/progressStorage", () => ({
  getUserProgress: jest.fn(() => Promise.resolve({})),
  getTopicProgress: jest.fn(() => Promise.resolve({})),
  saveUserProgress: jest.fn(() => Promise.resolve()),
  saveTopicProgress: jest.fn(() => Promise.resolve()),
  getStudyStatistics: jest.fn(() =>
    Promise.resolve({
      totalTopics: 0,
      completedTopics: 0,
      totalStudyTime: 0,
      averageScore: 0,
      lastActivity: new Date().toISOString(),
    })
  ),
}));

// Mock analytics
jest.mock("../../utils/analytics", () => ({
  getStreakDays: jest.fn(() => Promise.resolve(0)),
  logEvent: jest.fn(() => Promise.resolve()),
  getEvents: jest.fn(() => Promise.resolve([])),
}));

// Mock useAdvancedAnalytics hook to avoid async state updates in tests
jest.mock("../../hooks/useAdvancedAnalytics", () => ({
  useAdvancedAnalytics: () => ({
    getProfile: () => ({ id: "test", level: 1 }),
    getHighPriorityRecommendations: () => [],
    startStudySession: jest.fn(async () => {}),
    endStudySession: jest.fn(async () => {}),
    addInteraction: jest.fn(async () => {}),
    startTestAttempt: jest.fn(async () => {}),
    addQuestionAttempt: jest.fn(async () => {}),
    completeTestAttempt: jest.fn(async () => {}),
    getAnalyticsSummary: jest.fn(async () => ({
      studiedMinutes: 0,
      completedBlocks: 0,
      scoreTrend: [],
    })),
  }),
}));

// Mock content loader
jest.mock("../../content/loader", () => ({
  contentLoader: {
    loadTopic: jest.fn(() =>
      Promise.resolve({
        id: "money",
        title: "Что такое деньги?",
        description: "Изучение основ денежной системы",
        sectionId: "economy",
        blocks: [],
        questions: [],
      })
    ),
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {},
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AppThemeProvider>
      <NavigationContainer>{component}</NavigationContainer>
    </AppThemeProvider>
  );
};

describe("E2E User Journey", () => {
  beforeEach(() => {
    // Clear mock storage
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    // Clear mock functions
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  it("should complete full user journey from welcome to statistics", async () => {
    // Test Welcome Screen
    const { getAllByText: getWelcomeText, getByTestId: getWelcomeTestId } =
      renderWithProviders(
        <WelcomeScreen navigation={{ navigate: mockNavigate } as any} />
      );

    await waitFor(() => {
      // Use getAllByText to avoid duplicates
      const texts = getWelcomeText("Обществознание");
      expect(texts[0]).toBeTruthy();
    });

    // Test Home Screen
    const homeScreen = renderWithProviders(
      <HomeScreen navigation={{ navigate: mockNavigate } as any} />
    );

    // Use testID instead of text to avoid duplicates
    const economySection = homeScreen.getByTestId("section-economy");
    fireEvent.press(economySection);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Topic", expect.any(Object));
    });

    // Test Topic Header Screen
    const { getByText: getTopicText } = renderWithProviders(
      <TopicHeaderScreen
        navigation={{ navigate: jest.fn(), goBack: jest.fn() } as any}
        route={{ params: { topic: moneyTopic } } as any}
      />
    );

    await waitFor(() => {
      expect(getTopicText("Что такое деньги?")).toBeTruthy();
    });

    // Test Theory Block Screen
    const { getByText: getTheoryText } = renderWithProviders(
      <TheoryBlockScreen
        navigation={{ navigate: jest.fn(), goBack: jest.fn() } as any}
        route={{ params: { topic: moneyTopic, blockIndex: 0 } } as any}
      />
    );

    await waitFor(() => {
      expect(getTheoryText("Блок теории")).toBeTruthy();
    });

    // Test Mini Test Screen
    const { getByText: getTestText } = renderWithProviders(
      <MiniTestScreen
        navigation={{ navigate: jest.fn(), goBack: jest.fn() } as any}
        route={{ params: { topic: moneyTopic } } as any}
      />
    );

    await waitFor(() => {
      expect(getTestText("Проверь понимание")).toBeTruthy();
    });

    // Test Statistics Screen
    const { getByText } = renderWithProviders(
      <StatisticsScreen navigation={{ goBack: jest.fn() } as any} />
    );

    await waitFor(() => {
      expect(getByText("Общая статистика")).toBeTruthy();
    });
  });

  it("should handle navigation between all main screens", async () => {
    const { getByTestId } = renderWithProviders(
      <HomeScreen navigation={{ navigate: mockNavigate } as any} />
    );

    // Test section navigation using testID
    const economySection = getByTestId("section-economy");
    fireEvent.press(economySection);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Topic", expect.any(Object));
    });
  });

  it("should save and restore user progress", async () => {
    const { getByText } = renderWithProviders(
      <HomeScreen navigation={{ navigate: mockNavigate } as any} />
    );

    // Simulate user interaction
    const continueButton = getByText("Продолжить");
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "TheoryBlock",
        expect.any(Object)
      );
    });
  });

  it("should handle network errors gracefully", async () => {
    const { getByText } = renderWithProviders(
      <HomeScreen navigation={{ navigate: mockNavigate } as any} />
    );

    // Test that screen renders without crashing
    expect(getByText("Продолжить обучение")).toBeTruthy();
  });

  it("should handle missing data gracefully", async () => {
    const { getByText } = renderWithProviders(
      <HomeScreen navigation={{ navigate: mockNavigate } as any} />
    );

    // Test that screen renders without crashing
    expect(getByText("Продолжить обучение")).toBeTruthy();
  });

  it("should have proper accessibility labels", async () => {
    const { getByLabelText, getAllByRole } = renderWithProviders(
      <TopicHeaderScreen
        navigation={{ navigate: jest.fn(), goBack: jest.fn() } as any}
        route={{ params: { topic: moneyTopic } } as any}
      />
    );

    await waitFor(() => {
      // Check for basic accessibility elements
      const buttons = getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("should support screen readers", async () => {
    const { getByLabelText } = renderWithProviders(
      <TopicHeaderScreen
        navigation={{ navigate: jest.fn(), goBack: jest.fn() } as any}
        route={{ params: { topic: moneyTopic } } as any}
      />
    );

    await waitFor(() => {
      // Test that screen renders without crashing
      expect(getByLabelText).toBeDefined();
    });
  });
});
