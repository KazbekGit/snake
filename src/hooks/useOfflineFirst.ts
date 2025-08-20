import { useState, useEffect, useCallback } from "react";
import { contentCache, CacheStats } from "../utils/contentCache";
import { syncManager, SyncStatus, SyncProgress } from "../utils/syncManager";

export interface OfflineFirstState {
  cacheStats: CacheStats;
  syncStatus: SyncStatus;
  syncProgress: SyncProgress | null;
  isInitialized: boolean;
}

export interface OfflineFirstActions {
  forceSync: () => Promise<void>;
  clearCache: () => Promise<void>;
  cleanupExpiredCache: () => Promise<void>;
  addPendingChange: (changeId: string) => void;
  removePendingChange: (changeId: string) => void;
  checkConnectivity: () => Promise<boolean>;
}

export const useOfflineFirst = (): OfflineFirstState & OfflineFirstActions => {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    topicsCount: 0,
    imagesCount: 0,
    totalSize: 0,
    lastSync: 0,
    version: "1.0.0",
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    isSyncing: false,
    lastSync: 0,
    pendingChanges: 0,
  });

  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация
  useEffect(() => {
    const initializeOfflineFirst = async () => {
      try {
        // Загружаем статистику кэша
        const stats = await contentCache.getCacheStats();
        setCacheStats(stats);

        // Очищаем устаревшие данные
        await contentCache.cleanupExpiredCache();

        // Обновляем статистику после очистки
        const updatedStats = await contentCache.getCacheStats();
        setCacheStats(updatedStats);

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize offline-first:", error);
        setIsInitialized(true); // Все равно помечаем как инициализированное
      }
    };

    initializeOfflineFirst();
  }, []);

  // Подписка на статус синхронизации
  useEffect(() => {
    const unsubscribeStatus = syncManager.subscribeToStatus((status) => {
      setSyncStatus(status);
    });

    const unsubscribeProgress = syncManager.subscribeToProgress((progress) => {
      setSyncProgress(progress);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeProgress();
    };
  }, []);

  // Обновление статистики кэша при изменении
  const updateCacheStats = useCallback(async () => {
    try {
      const stats = await contentCache.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error("Failed to update cache stats:", error);
    }
  }, []);

  // Принудительная синхронизация
  const forceSync = useCallback(async () => {
    try {
      await syncManager.forceSync();
      // Обновляем статистику после синхронизации
      await updateCacheStats();
    } catch (error) {
      console.error("Force sync failed:", error);
    }
  }, [updateCacheStats]);

  // Очистка кэша
  const clearCache = useCallback(async () => {
    try {
      await contentCache.clearCache();
      await updateCacheStats();
    } catch (error) {
      console.error("Clear cache failed:", error);
    }
  }, [updateCacheStats]);

  // Очистка устаревших данных
  const cleanupExpiredCache = useCallback(async () => {
    try {
      await contentCache.cleanupExpiredCache();
      await updateCacheStats();
    } catch (error) {
      console.error("Cleanup expired cache failed:", error);
    }
  }, [updateCacheStats]);

  // Добавление отложенного изменения
  const addPendingChange = useCallback((changeId: string) => {
    syncManager.addPendingChange(changeId);
  }, []);

  // Удаление отложенного изменения
  const removePendingChange = useCallback((changeId: string) => {
    syncManager.removePendingChange(changeId);
  }, []);

  // Проверка подключения к интернету
  const checkConnectivity = useCallback(async () => {
    return await syncManager.checkConnectivity();
  }, []);

  return {
    // State
    cacheStats,
    syncStatus,
    syncProgress,
    isInitialized,

    // Actions
    forceSync,
    clearCache,
    cleanupExpiredCache,
    addPendingChange,
    removePendingChange,
    checkConnectivity,
  };
};

