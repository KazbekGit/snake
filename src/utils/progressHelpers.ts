export interface SimpleTopicProgress {
  lastBlockIndex?: number | null;
  completedBlocks?: number | null;
}

export function computeStartBlockIndex(
  progress: SimpleTopicProgress | null | undefined
): number {
  if (!progress) return 0;
  const last =
    typeof progress.lastBlockIndex === "number" ? progress.lastBlockIndex : 0;
  return last >= 0 ? last : 0;
}

export function getCtaText(
  progress: SimpleTopicProgress | null | undefined
): string {
  return (progress?.completedBlocks ?? 0) > 0
    ? "Продолжить изучение"
    : "Начать изучение";
}

export function getCtaHint(
  progress: SimpleTopicProgress | null | undefined
): string {
  return (progress?.completedBlocks ?? 0) > 0
    ? `Продолжить с блока ${(progress?.lastBlockIndex ?? 0) + 1}`
    : "Начать изучение темы с первого блока";
}

export function getLastStudiedTopicIdFromUserProgress(
  progress:
    | { topics: Record<string, { lastStudied?: string }> }
    | null
    | undefined
): string | null {
  if (!progress || !progress.topics) return null;
  let latestId: string | null = null;
  let latestTs = 0;
  for (const [topicId, t] of Object.entries(progress.topics)) {
    if (!t?.lastStudied) continue;
    const ts = Date.parse(t.lastStudied);
    if (!Number.isNaN(ts) && ts > latestTs) {
      latestTs = ts;
      latestId = topicId;
    }
  }
  return latestId;
}
