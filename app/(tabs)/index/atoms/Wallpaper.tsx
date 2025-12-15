import React, { useEffect, useState } from 'react';
import { Image, StatusBar, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { useSettingsStore } from '@/stores/settings';
import { File, Paths } from 'expo-file-system';

const Wallpaper = ({ height = 400, dim = true }) => {
  try {
    const visible = useIsFocused();
    const settingsStore = useSettingsStore(state => state.personalization);
    const currentWallpaper = settingsStore.wallpaper;

    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
      if (currentWallpaper?.path?.name) {
        const file = new File(Paths.document, currentWallpaper.path.directory || '', currentWallpaper.path.name);
        if (file.exists) {
          setImage(file.uri);
        } else {
          setImage(null);
        }
      }
      else {
        setImage(null);
      }
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

        {dim && visible &&
          <StatusBar translucent animated barStyle={'light-content'} />
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