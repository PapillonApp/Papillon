
import { useTheme } from '@react-navigation/native';
import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { runsIOS26 } from '../utils/IsLiquidGlass';
import { TabHeaderTitleProps } from './TabHeaderTitle';


interface TabHeaderProps {
  onHeightChanged?: (height: number) => void,
  title?: React.ReactElement<TabHeaderTitleProps>,
  trailing?: React.ReactElement,
  bottom?: React.ReactElement,
  shouldCollapseHeader?: boolean,
  modal?: boolean,
};

const TabHeader: React.FC<TabHeaderProps> = ({
  onHeightChanged = () => { },
  title,
  trailing,
  bottom,
  shouldCollapseHeader,
  modal,
}) => {
  const theme = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const [height, setHeight] = React.useState(0);
  const usedInsets = modal ? 16 : insets.top;

  useEffect(() => {
    onHeightChanged(height + (Platform.OS === 'android' ? 6 : 0));
  }, [height]);

  return (
    <>
      <Reanimated.View
        style={[{
          backgroundColor: runsIOS26 ? 'transparent' : colors.background,
          borderBottomWidth: (Platform.OS === 'ios' && !runsIOS26) ? 0.5 : 0,
          borderBottomColor: (Platform.OS === 'ios' && !runsIOS26) ? colors.border : undefined,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height,
          zIndex: 99,
          overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
          elevation: 2,
        }]}
        pointerEvents={'none'}
      >
        {runsIOS26 && (
          <ProgressiveBlurView
            blurType="systemMaterial"
            blurAmount={20}
            direction="blurredTopClearBottom"
            startOffset={0}
            reducedTransparencyFallbackColor="#00000000"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: height - 20,
              zIndex: 99,
            }}
          />
        )}
      </Reanimated.View>

      <View
        style={{
          paddingTop: usedInsets + 4,
          paddingBottom: 16,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeight(height);
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            gap: 16,
            paddingHorizontal: 16,
            paddingLeft: modal ? 24 : 16,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {title}

          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            {trailing}
          </View>
        </View>

        {bottom}
      </View>
    </>
  )
};

export default TabHeader;