import React, { PropsWithChildren } from "react";
import { View, ViewStyle, useWindowDimensions } from "react-native";
import { computeColumnWidthPercent } from "./gridUtils";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export const useBreakpoint = (): Breakpoint => {
  const { width } = useWindowDimensions();
  if (width >= 1200) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
};

// moved to gridUtils for testability without RN env

interface ContainerProps {
  style?: ViewStyle;
  gutter?: number; // px between columns, default 24
}

export const Container: React.FC<PropsWithChildren<ContainerProps>> = ({
  children,
  style,
}) => {
  return (
    <View
      style={[
        {
          width: "100%",
          paddingHorizontal: 24,
          maxWidth: 1200,
          alignSelf: "center",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

interface RowProps {
  style?: ViewStyle;
  gutter?: number;
}

export const Row: React.FC<PropsWithChildren<RowProps>> = ({
  children,
  style,
  gutter = 24,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          marginLeft: -gutter / 2,
          marginRight: -gutter / 2,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as any, { gutter });
      })}
    </View>
  );
};

interface ColProps {
  spanDesktop?: number;
  spanTablet?: number;
  spanMobile?: number;
  style?: ViewStyle;
  gutter?: number; // injected by Row
}

export const Col: React.FC<PropsWithChildren<ColProps>> = ({
  children,
  spanDesktop = 6,
  spanTablet = 6,
  spanMobile = 12,
  style,
  gutter = 24,
}) => {
  const bp = useBreakpoint();
  const span =
    bp === "desktop" ? spanDesktop : bp === "tablet" ? spanTablet : spanMobile;
  const widthPercent = computeColumnWidthPercent(span);
  const horizontalPadding = gutter / 2;
  return (
    <View
      style={[
        {
          width: `${widthPercent}%`,
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
