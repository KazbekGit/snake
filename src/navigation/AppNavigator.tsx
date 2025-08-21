import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { WelcomeScreen } from "../screens/WelcomeScreen";
import { GradeSelectionScreen } from "../screens/GradeSelectionScreen";
import { GoalSelectionScreen } from "../screens/GoalSelectionScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { TopicHeaderScreen } from "../screens/TopicHeaderScreen";
import { TheoryBlockScreen } from "../screens/TheoryBlockScreen";
import { MiniTestScreen } from "../screens/MiniTestScreen";
import { StatisticsScreen } from "../screens/StatisticsScreen";
import { AdvancedAnalyticsScreen } from "../screens/AdvancedAnalyticsScreen";
import { ExamModeScreen } from "../screens/ExamModeScreen";
import { ExamResultsScreen } from "../screens/ExamResultsScreen";

export type RootStackParamList = {
  Welcome: undefined;
  GradeSelection: undefined;
  GoalSelection: { grade: number };
  Home: undefined;
  Topic: { topic: any };
  TheoryBlock: { topic: any; blockIndex: number };
  MiniTest: { topic: any; blockId?: string };
  Statistics: undefined;
  AdvancedAnalytics: undefined;
  ExamMode: { sectionId: string; examType: "oge" | "ege" };
  ExamResults: {
    sectionId: string;
    examType: "oge" | "ege";
    score: number;
    totalQuestions: number;
    answers: Record<number, string | string[]>;
    questions: any[];
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen as any} />
        <Stack.Screen
          name="GradeSelection"
          component={GradeSelectionScreen as any}
        />
        <Stack.Screen
          name="GoalSelection"
          component={GoalSelectionScreen as any}
        />
        <Stack.Screen name="Home" component={HomeScreen as any} />
        <Stack.Screen name="Topic" component={TopicHeaderScreen as any} />
        <Stack.Screen name="TheoryBlock" component={TheoryBlockScreen as any} />
        <Stack.Screen name="MiniTest" component={MiniTestScreen as any} />
        <Stack.Screen name="Statistics" component={StatisticsScreen as any} />
        <Stack.Screen
          name="AdvancedAnalytics"
          component={AdvancedAnalyticsScreen as any}
        />
        <Stack.Screen name="ExamMode" component={ExamModeScreen as any} />
        <Stack.Screen name="ExamResults" component={ExamResultsScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
