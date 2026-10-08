import MaskedView from '@react-native-masked-view/masked-view';
import { File, Paths } from 'expo-file-system';
import React, { useEffect, useMemo } from 'react';
import { Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { generateMeshGradient } from '@/utils/generative';
import { applyGradientWallpaper, GRADIENT_HEIGHT, GRADIENT_WIDTH, isGradient, randomGradient, useAccountWallpaper } from '@/utils/gradientWallpaper';

const Wallpaper = ({ height = 400, dim = true }) => {
  try {
    const { wallpaper: currentWallpaper, wallpaperGradient } = useAccountWallpaper();

    // No wallpaper yet (first launch, or cleared): default to a random gradient
    useEffect(() => {
      if (!currentWallpaper) applyGradientWallpaper(randomGradient());
    }, [currentWallpaper]);

    // Gradients render from their params in memory, so edits show up without waiting for the PNG on disk
    const showGradient = isGradient(currentWallpaper);
    const gradientImage = useMemo(() => {
      if (!wallpaperGradient || !showGradient) return null;
      // ponytail: quarter-size like the modal preview, blurred so upscaling is invisible; bump if banding shows
      const rendered = generateMeshGradient(wallpaperGradient.colors, wallpaperGradient.seed, Math.round(GRADIENT_WIDTH / 4), GRADIENT_HEIGHT / 4);
      return rendered ? `data:image/png;base64,${rendered.encodeToBase64()}` : null;
    }, [showGradient, wallpaperGradient]);

    const fileImage = useMemo(() => {
      if (!currentWallpaper?.path?.name) return null;
      const file = new File(Paths.document, currentWallpaper.path.directory || '', currentWallpaper.path.name);
      return file.exists ? file.uri : null;
    }, [currentWallpaper]);

    const image = gradientImage ?? fileImage;

    return (
      <MaskedView
        style={[styles.container, { height }]}
        maskElement={
          <LinearGradient
            colors={['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)']}
            locations={[0.5, 1]}
            style={{ width: '100%', height }}
          />
        }
      >
        <Image
          source={image ? { uri: image } : require('@/assets/images/wallpapers/clouds.jpg')}
          style={[styles.image, { height }]}
        />

        {dim &&
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0)']}
            locations={[0, 1]}
            style={[styles.dimGradient, { height: height / 2 }]}
          />
        }
      </MaskedView>
    );
  } catch (error) {
    console.log(error);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -9
  },
  image: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  },
  dimGradient: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1
  }
});

export default Wallpaper;