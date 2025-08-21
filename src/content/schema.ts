export interface ContentMedia {
  url: string;
  altText?: string;
  placement?: "before_content" | "after_content";
  type?: "image" | "video";
}

export interface ContentVideo {
  videoId: string;
  title?: string;
  description?: string;
  placement?: "before_content" | "after_content";
  platform?: "youtube" | "vimeo";
}

export interface DiagramStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ContentDiagram {
  title: string;
  steps: DiagramStep[];
  placement?: "before_content" | "after_content";
}

export interface ContentMnemonic {
  phrase: string;
  explanation: string;
  visualHint?: string;
}

export interface ContentKeyTerm {
  term: string;
  definition: string;
  highlightColor?: string;
}

export interface ContentBlock {
  title: string;
  content: string;
  media?: ContentMedia;
  video?: ContentVideo;
  diagram?: ContentDiagram;
  example?: string;
  keyTerms?: ContentKeyTerm[];
  mnemonic?: ContentMnemonic;
}

export interface QuizQuestion {
  type: "single" | "multiple" | "flip_card";
  question?: string;
  options?: string[];
  correctAnswer?: string | string[];
  correctIndex?: number;
  correctIndexes?: number[];
  explanation?: string;
  back?: string;
  front?: string;
  visualHint?: string;
}

export interface TopicContent {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  coverImage: string;
  gradeLevel?: number;
  isPremium?: boolean;
  estimatedTime?: number;
  difficulty?: "easy" | "medium" | "hard";
  learningObjectives?: string[];
  contentBlocks: ContentBlock[];
  quiz: { questions: QuizQuestion[] };
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export function validateTopicContent(input: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (path: string, message: string) =>
    issues.push({ path, message });

  if (!input || typeof input !== "object") {
    push("$", "Topic must be an object");
    return issues;
  }
  const req = [
    "id",
    "sectionId",
    "title",
    "description",
    "coverImage",
    "contentBlocks",
    "quiz",
  ];
  for (const key of req) {
    if (!(key in input)) push(key, "is required");
  }
  if (!Array.isArray(input.contentBlocks) || input.contentBlocks.length === 0) {
    push("contentBlocks", "must be a non-empty array");
  } else {
    input.contentBlocks.forEach((b: any, i: number) =>
      validateBlock(b, i, issues)
    );
  }
  if (
    !input.quiz ||
    !Array.isArray(input.quiz.questions) ||
    input.quiz.questions.length === 0
  ) {
    push("quiz.questions", "must be a non-empty array");
  } else {
    input.quiz.questions.forEach((q: any, i: number) =>
      validateQuestion(q, i, issues)
    );
  }
  return issues;
}

function validateBlock(b: any, index: number, issues: ValidationIssue[]) {
  const base = `contentBlocks[${index}]`;
  if (!b || typeof b !== "object") {
    issues.push({ path: base, message: "block must be an object" });
    return;
  }
  if (!b.title) issues.push({ path: `${base}.title`, message: "is required" });
  if (!b.content)
    issues.push({ path: `${base}.content`, message: "is required" });
  if (b.media && typeof b.media.url !== "string") {
    issues.push({ path: `${base}.media.url`, message: "must be string" });
  }
  if (b.keyTerms && !Array.isArray(b.keyTerms)) {
    issues.push({ path: `${base}.keyTerms`, message: "must be array" });
  }
}

function validateQuestion(q: any, index: number, issues: ValidationIssue[]) {
  const base = `quiz.questions[${index}]`;
  if (!q || typeof q !== "object") {
    issues.push({ path: base, message: "question must be an object" });
    return;
  }
  if (!q.type) {
    issues.push({ path: `${base}.type`, message: "is required" });
    return;
  }
  if (q.type === "single") {
    if (!Array.isArray(q.options) || typeof q.correctAnswer !== "string") {
      issues.push({
        path: base,
        message: "single requires options[] and correctAnswer",
      });
    }
  } else if (q.type === "multiple") {
    if (!Array.isArray(q.options) || !Array.isArray(q.correctAnswer)) {
      issues.push({
        path: base,
        message: "multiple requires options[] and correctAnswer[]",
      });
    }
  } else if (q.type === "flip_card") {
    if (typeof q.front !== "string" || typeof q.back !== "string") {
      issues.push({ path: base, message: "flip_card requires front and back" });
    }
  }
}
