import React from 'react';
import { View } from 'react-native';

import ScodocUES from '../features/ScodocUES';

const featureComponent = {
  "scodoc-ues": ScodocUES,
}


const FeaturesMap: React.FC<{ features: Record<string, any> }> = ({ features }) => {
  if (!features) { return null; }

  return (
    <View style={{ marginBottom: 16 }}>
      {Object.entries(features).map(([key, value]) => {
        const Component = featureComponent[key as keyof typeof featureComponent];
        if (!Component) { return null; }
        return <Component key={key} data={value} />;
      })}
    </View>
  );
};

export default FeaturesMap;