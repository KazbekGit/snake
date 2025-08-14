import React from "react";
import { getGradientByVariant } from "../buttonUtils";

describe("Button variants", () => {
  it("returns gradients for variants", () => {
    expect(Array.isArray(getGradientByVariant("primary"))).toBe(true);
    expect(Array.isArray(getGradientByVariant("secondary"))).toBe(true);
    expect(Array.isArray(getGradientByVariant("danger"))).toBe(true);
    expect(Array.isArray(getGradientByVariant("ghost"))).toBe(true);
  });
});


