import type React from "react";
import { Platform, TouchableHighlight, TouchableNativeFeedback, View } from "react-native";

type NativeTouchableProps = {
  children: React.ReactNode;
  underlayColor?: string;
} & React.ComponentProps<typeof TouchableNativeFeedback>;

const NativeTouchable: React.FC<NativeTouchableProps> = ({
  children,
  ...props
}) => {
  if(Platform.OS === "android") {
    return (
      <TouchableNativeFeedback {...props} key="natouch">
        <View style={props.style}>
          {children}
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableHighlight
      underlayColor={"rgba(0, 0, 0, 0.1)"}
      {...props}
    >
      {children}
    </TouchableHighlight>
  );
};

export default NativeTouchable;