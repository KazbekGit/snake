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

export type RootStackParamList = {
  Welcome: undefined;
  GradeSelection: undefined;
  GoalSelection: { grade: number };
  Home: undefined;
  Topic: { topic: any };
  TheoryBlock: { topic: any; blockIndex: number };
  MiniTest: { topic: any; blockId: string };
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
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="GradeSelection" component={GradeSelectionScreen} />
        <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Topic" component={TopicHeaderScreen} />
        <Stack.Screen name="TheoryBlock" component={TheoryBlockScreen} />
        <Stack.Screen name="MiniTest" component={MiniTestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
