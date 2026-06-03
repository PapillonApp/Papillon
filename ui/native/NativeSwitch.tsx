import { Platform, Switch, View } from "react-native"
import { Host, Switch as AndroidSwitch } from '@expo/ui/jetpack-compose';

type NativeSwitchProps = {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

const NativeSwitch: React.FC<NativeSwitchProps> = ({ value, onValueChange, disabled }) => {
  if(Platform.OS === "android") {
    return (
      <View pointerEvents={disabled ? "none" : "auto"}>
        <Host matchContents>
          <AndroidSwitch
            value={value}
            onCheckedChange={onValueChange}
          />
        </Host>
      </View>
    )
  }

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    />
  )
}

export default NativeSwitch