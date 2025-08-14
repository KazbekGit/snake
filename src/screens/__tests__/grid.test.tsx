import { computeColumnWidthPercent } from "../../ui/gridUtils";

describe("Grid", () => {
  it("computes column width percent correctly", () => {
    expect(computeColumnWidthPercent(12)).toBe(100);
    expect(computeColumnWidthPercent(6)).toBeCloseTo(50);
    expect(computeColumnWidthPercent(3)).toBeCloseTo(25);
    expect(computeColumnWidthPercent(0)).toBe(0);
    expect(computeColumnWidthPercent(20)).toBe(100);
  });
});
