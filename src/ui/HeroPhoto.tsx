import React, { useEffect, useState } from "react";
import { Image, View, ViewStyle } from "react-native";
import { ds } from "./theme";
import { getCachedUri } from "../utils/imageCache";

interface HeroPhotoProps {
  // Либо локальный require(...), либо удалённый URL
  uri?: string | number;
  width?: number;
  height?: number;
  scale?: number;
  style?: ViewStyle;
}

// Фото по теме обществознания (класс, ученики, учитель)
// По умолчанию используем локальный ассет, если он есть; иначе — оптимизированный Unsplash URL
const REMOTE_FALLBACK_URI =
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80";

export const HeroPhoto: React.FC<HeroPhotoProps> = ({
  uri,
  width,
  height,
  scale,
  style,
}) => {
  const isLocal = typeof uri === "number";
  const initialRemote = !isLocal
    ? (uri as string) || REMOTE_FALLBACK_URI
    : REMOTE_FALLBACK_URI;
  const [localUri, setLocalUri] = useState<string>(initialRemote);

  // Используем натуральные размеры локального ассета, если ширина/высота не заданы
  const assetSource = isLocal
    ? Image.resolveAssetSource(uri as number)
    : undefined;
  const factor = typeof scale === "number" ? scale : 1;
  const finalWidth = (width ?? assetSource?.width ?? 280) * factor;
  const finalHeight = (height ?? assetSource?.height ?? 200) * factor;

  useEffect(() => {
    if (typeof uri === "number") return; // локальный ассет — кеш не нужен
    let active = true;
    (async () => {
      try {
        const chosen = (uri as string) || REMOTE_FALLBACK_URI;
        const cached = await getCachedUri(chosen);
        if (active) setLocalUri(cached);
      } catch {
        if (active) setLocalUri((uri as string) || REMOTE_FALLBACK_URI);
      }
    })();
    return () => {
      active = false;
    };
  }, [uri]);

  return (
    <View
      style={[
        {
          width: finalWidth,
          height: finalHeight,
          // Не добавляем фон/скругление/тени — сохраняем прозрачность PNG и не обрезаем
        },
        style,
      ]}
    >
      <Image
        source={typeof uri === "number" ? (uri as number) : { uri: localUri }}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
        resizeMode="contain"
        accessible
        accessibilityLabel="Фото: урок обществознания"
      />
    </View>
  );
};

export default HeroPhoto;
