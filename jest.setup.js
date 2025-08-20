import "@testing-library/jest-native/extend-expect";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
  FontAwesome: "FontAwesome",
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {});

// Mock react-native-screens
jest.mock("react-native-screens", () => ({
  enableScreens: jest.fn(),
}));

// Mock react-native-svg with JSX-compatible mocks
jest.mock("react-native-svg", () => {
  const React = require("react");
  const MockSvg = (props) => React.createElement("svg", props);
  return {
    __esModule: true,
    default: MockSvg,
    Svg: MockSvg,
    Path: (props) => React.createElement("path", props),
    Circle: (props) => React.createElement("circle", props),
    Rect: (props) => React.createElement("rect", props),
    G: (props) => React.createElement("g", props),
    Defs: (props) => React.createElement("defs", props),
    LinearGradient: (props) => React.createElement("linearGradient", props),
    Stop: (props) => React.createElement("stop", props),
  };
});

// Mock NetInfo (virtual module)
jest.mock(
  "@react-native-community/netinfo",
  () => ({
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(),
  }),
  { virtual: true }
);

// Global test setup
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
