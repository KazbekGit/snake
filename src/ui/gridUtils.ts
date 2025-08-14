export const computeColumnWidthPercent = (
  span: number,
  totalColumns: number = 12
): number => {
  if (span <= 0) return 0;
  if (span >= totalColumns) return 100;
  return (span / totalColumns) * 100;
};
