import { validateTopicContent } from "../../content/schema";

describe("content schema", () => {
  it("detects missing required fields", () => {
    const issues = validateTopicContent({});
    expect(issues.length).toBeGreaterThan(0);
  });

  it("accepts minimal valid topic", () => {
    const minimal = {
      id: "t1",
      sectionId: "economy",
      title: "Тема",
      description: "Описание",
      coverImage: "https://example.com/x.png",
      contentBlocks: [{ title: "Блок", content: "Текст" }],
      quiz: {
        questions: [
          {
            type: "single",
            question: "Q",
            options: ["A", "B"],
            correctAnswer: "A",
          },
        ],
      },
    };
    const issues = validateTopicContent(minimal);
    expect(issues.length).toBe(0);
  });
});
