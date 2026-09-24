import MaskedView from '@react-native-masked-view/masked-view';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSettingsStore } from '@/stores/settings';
import { getWallpaperUri } from '@/utils/wallpaperStorage';

const Wallpaper = ({ height = 400, dim = true }) => {
  try {
    const settingsStore = useSettingsStore(state => state.personalization);
    const currentWallpaper = settingsStore.wallpaper;

    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
      setImage(getWallpaperUri(currentWallpaper));
    }, [currentWallpaper]);

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
