import React from 'react';
import { Image, StatusBar, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useIsFocused } from '@react-navigation/native';

const Wallpaper = ({ height = 400, dim = true }) => {
  const visible = useIsFocused();

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
        source={require('@/assets/images/wallpapers/clouds.jpg')}
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