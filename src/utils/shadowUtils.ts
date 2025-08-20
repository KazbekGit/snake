// Утилита для создания boxShadow стилей
// Заменяет deprecated shadow* props на boxShadow

export const createBoxShadow = (
  color: string = "#000",
  offsetX: number = 0,
  offsetY: number = 0,
  blurRadius: number = 0,
  spreadRadius: number = 0
): string => {
  return `${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${color}`;
};

// Предустановленные тени
export const shadows = {
  soft: createBoxShadow("#000", 0, 2, 8, 0),
  medium: createBoxShadow("#000", 0, 4, 10, 0),
  strong: createBoxShadow("#000", 0, 6, 12, 0),
  card: createBoxShadow("#000", 0, 4, 10, 0),
  button: createBoxShadow("#000", 0, 4, 10, 0),
  small: createBoxShadow("#000", 0, 1, 2, 0),
};

// Конвертер для старых shadow стилей
export const convertShadowToBoxShadow = (shadowStyle: {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}): string => {
  const {
    shadowColor = "#000",
    shadowOffset = { width: 0, height: 0 },
    shadowOpacity = 0,
    shadowRadius = 0,
  } = shadowStyle;

  // Конвертируем opacity в rgba
  const rgbaColor =
    shadowColor === "#000" ? `rgba(0, 0, 0, ${shadowOpacity})` : shadowColor;

  return createBoxShadow(
    rgbaColor,
    shadowOffset.width,
    shadowOffset.height,
    shadowRadius,
    0
  );
};

