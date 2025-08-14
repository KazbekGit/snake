import { ds } from "../theme";

describe("design system", () => {
  it("has required typography tokens", () => {
    expect(ds.typography.heroTitle.fontSize).toBe(36);
    expect(ds.typography.title.lineHeight).toBe(32);
    expect(ds.typography.button.fontWeight).toBe("700");
  });

  it("has card shadow token", () => {
    expect(ds.shadow.card.elevation).toBe(3);
    expect(ds.shadow.card.shadowOpacity).toBeCloseTo(0.15);
  });
});


