import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../ui/Typography";
import { ds } from "../ui/theme";
import { colors } from "../constants/colors";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  description?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title,
  description,
  onLoadStart,
  onLoadEnd,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
  };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      <Typography variant="body" style={styles.errorText}>
        Не удалось загрузить видео
      </Typography>
      <Typography variant="caption" style={styles.errorSubtext}>
        Проверьте подключение к интернету
      </Typography>
    </View>
  );

  const renderVideo = () => (
    <View style={[styles.videoContainer, isExpanded && styles.videoExpanded]}>
      <WebView
        source={{ uri: getYouTubeEmbedUrl(videoId) }}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography variant="caption" style={styles.loadingText}>
            Загрузка видео...
          </Typography>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Ionicons
            name="play-circle-outline"
            size={24}
            color={colors.primary}
          />
          <Typography variant="subtitle" style={styles.title}>
            {title}
          </Typography>
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.expandButton}
          >
            <Ionicons
              name={isExpanded ? "contract" : "expand"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}

      {hasError ? renderErrorState() : renderVideo()}

      {description && (
        <View style={styles.descriptionContainer}>
          <Typography variant="body" style={styles.description}>
            {description}
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: ds.spacing.lg,
    borderRadius: ds.radius.lg,
    overflow: "hidden",
    backgroundColor: colors.card,
    ...ds.shadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: ds.spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    flex: 1,
    marginLeft: ds.spacing.sm,
    color: colors.text,
  },
  expandButton: {
    padding: ds.spacing.xs,
  },
  videoContainer: {
    height: 200,
    backgroundColor: "#000",
  },
  videoExpanded: {
    height: 300,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  loadingText: {
    color: "white",
    marginTop: ds.spacing.sm,
  },
  errorContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error + "10",
  },
  errorText: {
    color: colors.error,
    marginTop: ds.spacing.sm,
    textAlign: "center",
  },
  errorSubtext: {
    color: colors.textSecondary,
    marginTop: ds.spacing.xs,
    textAlign: "center",
  },
  descriptionContainer: {
    padding: ds.spacing.md,
    backgroundColor: colors.background,
  },
  description: {
    color: colors.textSecondary,
    fontStyle: "italic",
  },
});
