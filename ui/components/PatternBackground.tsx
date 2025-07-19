import React from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TILE_SIZE = 39.2;

const PatternBackground = ({ PatternTile, color }: { PatternTile: React.ElementType, color: string }) => {
  const cols = Math.ceil(screenWidth / TILE_SIZE);
  const rows = Math.ceil(screenHeight / TILE_SIZE);

  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <Svg width="100%" height="100%">
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => (
            <PatternTile
              key={`${row}-${col}`}
              x={col * TILE_SIZE}
              y={row * TILE_SIZE}
              color={color}
            />
          ))
        )}
      </Svg>
    </View>
  );
};

export default PatternBackground;
