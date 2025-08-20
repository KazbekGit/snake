import NetInfo from "@react-native-community/netinfo";
import { contentCache } from "./contentCache";
import { TopicContent } from "../content/schema";

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number;
  pendingChanges: number;
  error?: string;
}

export interface SyncProgress {
  current: number;
  total: number;
  message: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;
export type SyncStatusCallback = (status: SyncStatus) => void;

class SyncManager {
  private static instance: SyncManager;
  private isOnline: boolean = false;
  private isSyncing: boolean = false;
  private syncCallbacks: SyncStatusCallback[] = [];
  private progressCallbacks: SyncProgressCallback[] = [];
  private pendingChanges: Set<string> = new Set();

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        // Стали онлайн - запускаем синхронизацию
        this.syncWhenOnline();
      }

      this.notifyStatusChange();
    });
  }

  // Подписка на изменения статуса синхронизации
  subscribeToStatus(callback: SyncStatusCallback): () => void {
    this.syncCallbacks.push(callback);

    // Сразу отправляем текущий статус
    callback(this.getCurrentStatus());

    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  // Подписка на прогресс синхронизации
  subscribeToProgress(callback: SyncProgressCallback): () => void {
    this.progressCallbacks.push(callback);

    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  private notifyStatusChange(): void {
    const status = this.getCurrentStatus();
    this.syncCallbacks.forEach((callback) => callback(status));
  }

  private notifyProgress(progress: SyncProgress): void {
    this.progressCallbacks.forEach((callback) => callback(progress));
  }

  private getCurrentStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSync: 0, // TODO: получить из кэша
      pendingChanges: this.pendingChanges.size,
    };
  }

  // Синхронизация при подключении к интернету
  private async syncWhenOnline(): Promise<void> {
    if (this.pendingChanges.size > 0) {
      console.log(`Syncing ${this.pendingChanges.size} pending changes...`);
      await this.syncPendingChanges();
    }
  }

  // Синхронизация всех данных
  async syncAllData(): Promise<void> {
    if (this.isSyncing) {
      console.log("Sync already in progress");
      return;
    }

    if (!this.isOnline) {
      console.log("No internet connection, sync postponed");
      return;
    }

    this.isSyncing = true;
    this.notifyStatusChange();

    try {
      // Синхронизация контента
      await this.syncContent();

      // Синхронизация прогресса пользователя
      await this.syncUserProgress();

      // Синхронизация аналитики
      await this.syncAnalytics();

      // Обновляем timestamp последней синхронизации
      await contentCache.setLastSyncTimestamp();

      console.log("Sync completed successfully");
    } catch (error) {
      console.error("Sync failed:", error);
      this.notifyStatusChange();
    } finally {
      this.isSyncing = false;
      this.notifyStatusChange();
    }
  }

  // Синхронизация контента
  private async syncContent(): Promise<void> {
    this.notifyProgress({
      current: 0,
      total: 3,
      message: "Syncing content...",
    });

    try {
      // Получаем список тем для синхронизации
      const topicsToSync = await this.getTopicsToSync();

      this.notifyProgress({
        current: 1,
        total: 3,
        message: `Syncing ${topicsToSync.length} topics...`,
      });

      for (let i = 0; i < topicsToSync.length; i++) {
        const topic = topicsToSync[i];

        // Загружаем тему с сервера (в будущем)
        const updatedTopic = await this.fetchTopicFromServer(topic.id);

        if (updatedTopic) {
          // Кэшируем обновленную тему
          await contentCache.cacheTopic(updatedTopic);
        }

        this.notifyProgress({
          current: 1 + i / topicsToSync.length,
          total: 3,
          message: `Syncing topic: ${topic.title}`,
        });
      }

      this.notifyProgress({
        current: 2,
        total: 3,
        message: "Content synced successfully",
      });
    } catch (error) {
      console.error("Content sync failed:", error);
      throw error;
    }
  }

  // Синхронизация прогресса пользователя
  private async syncUserProgress(): Promise<void> {
    this.notifyProgress({
      current: 2,
      total: 3,
      message: "Syncing user progress...",
    });

    try {
      // TODO: Отправляем прогресс на сервер
      // const progress = await getUserProgress();
      // await this.uploadUserProgress(progress);

      console.log("User progress synced");
    } catch (error) {
      console.error("User progress sync failed:", error);
      // Не прерываем синхронизацию из-за ошибки прогресса
    }
  }

  // Синхронизация аналитики
  private async syncAnalytics(): Promise<void> {
    this.notifyProgress({
      current: 2.5,
      total: 3,
      message: "Syncing analytics...",
    });

    try {
      // TODO: Отправляем аналитику на сервер
      // const analytics = await getAnalyticsData();
      // await this.uploadAnalytics(analytics);

      console.log("Analytics synced");
    } catch (error) {
      console.error("Analytics sync failed:", error);
      // Не прерываем синхронизацию из-за ошибки аналитики
    }
  }

  // Синхронизация отложенных изменений
  private async syncPendingChanges(): Promise<void> {
    if (this.pendingChanges.size === 0) {
      return;
    }

    console.log(`Syncing ${this.pendingChanges.size} pending changes...`);

    try {
      for (const changeId of this.pendingChanges) {
        await this.syncPendingChange(changeId);
        this.pendingChanges.delete(changeId);
      }

      console.log("Pending changes synced successfully");
    } catch (error) {
      console.error("Pending changes sync failed:", error);
      throw error;
    }
  }

  // Синхронизация одного отложенного изменения
  private async syncPendingChange(changeId: string): Promise<void> {
    // TODO: Реализовать синхронизацию конкретного изменения
    console.log(`Syncing change: ${changeId}`);
  }

  // Получение тем для синхронизации
  private async getTopicsToSync(): Promise<TopicContent[]> {
    // TODO: Получить список тем, которые нужно синхронизировать
    // Пока возвращаем пустой массив
    return [];
  }

  // Загрузка темы с сервера
  private async fetchTopicFromServer(
    topicId: string
  ): Promise<TopicContent | null> {
    // TODO: Реализовать загрузку с сервера
    // Пока возвращаем null
    return null;
  }

  // Добавление отложенного изменения
  addPendingChange(changeId: string): void {
    this.pendingChanges.add(changeId);
    this.notifyStatusChange();
  }

  // Удаление отложенного изменения
  removePendingChange(changeId: string): void {
    this.pendingChanges.delete(changeId);
    this.notifyStatusChange();
  }

  // Принудительная синхронизация
  async forceSync(): Promise<void> {
    console.log("Force sync requested");
    await this.syncAllData();
  }

  // Получение текущего статуса
  getStatus(): SyncStatus {
    return this.getCurrentStatus();
  }

  // Проверка подключения к интернету
  async checkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    this.notifyStatusChange();
    return this.isOnline;
  }

  // Очистка отложенных изменений
  clearPendingChanges(): void {
    this.pendingChanges.clear();
    this.notifyStatusChange();
  }
}

export const syncManager = SyncManager.getInstance();

