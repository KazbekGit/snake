import React, { useEffect, useState } from "react";
import { Image, View, ViewStyle } from "react-native";
import { ds } from "./theme";
import { getCachedUri } from "../utils/imageCache";

interface HeroPhotoProps {
	uri?: string;
	width?: number;
	height?: number;
	style?: ViewStyle;
}

// Фото по теме обществознания (класс, ученики, учитель)
// По умолчанию используем локальный ассет, если он есть; иначе — оптимизированный Unsplash URL
const REMOTE_FALLBACK_URI =
	"https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80";

export const HeroPhoto: React.FC<HeroPhotoProps> = ({
	uri,
	width = 280,
	height = 200,
	style,
}) => {
	const [localUri, setLocalUri] = useState<string>(uri || REMOTE_FALLBACK_URI);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const chosen = uri || REMOTE_FALLBACK_URI;
				const cached = await getCachedUri(chosen);
				if (active) setLocalUri(cached);
			} catch {
				if (active) setLocalUri(uri || REMOTE_FALLBACK_URI);
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
					width,
					height,
					borderRadius: ds.radius.xl,
					overflow: "hidden",
					backgroundColor: ds.colors.card,
					...ds.shadow.card,
				},
				style,
			]}
		>
			<Image
				source={{ uri: localUri }}
				style={{ width: "100%", height: "100%" }}
				resizeMode="cover"
				accessible
				accessibilityLabel="Фото: урок обществознания"
			/>
		</View>
	);
};

export default HeroPhoto;


