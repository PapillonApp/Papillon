import React from 'react';
import { Image, StatusBar, View } from 'react-native';

import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
const Wallpaper = ({ height = 400, dim = true }) => {
  const visible = useIsFocused();

  return (
    <MaskedView
      style={{
        width: '100%',
        height: height,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -9
      }}
      maskElement={
        <LinearGradient
          colors={['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)']}
          locations={[0.5, 1]}
          style={{ width: '100%', height: height }}
        />
      }
    >
      <Image
        source={require('@/assets/images/wallpapers/clouds.jpg')}
        style={{ width: '100%', height: height, position: 'absolute', top: 0, left: 0 }}
      />

      {dim &&
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0)']}
          locations={[0, 1]}
          style={{ width: '100%', height: height / 1.5, position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />
      }

      {dim && visible &&
        <StatusBar translucent animated barStyle={'light-content'} />
      }
    </MaskedView>
  );
};

export default Wallpaper;