import { Platform } from "react-native"
import { Host as AndroidHost, SegmentedButton, SingleChoiceSegmentedButtonRow, Text as AndroidText } from "@expo/ui/jetpack-compose";
import { Host, Picker, Text } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

type NativeSegmentedControlProps = {
  options: string[]
  selectedIndex: number
  onChange: (index: number) => void
}

const NativeSegmentedControl: React.FC<NativeSegmentedControlProps> = ({ options, selectedIndex, onChange }) => {
  if (Platform.OS === "android") {
    return (
      <AndroidHost matchContents={{ vertical: true }}>
        <SingleChoiceSegmentedButtonRow>
          {options.map((option, index) => (
            <SegmentedButton key={option} selected={index === selectedIndex} onClick={() => onChange(index)}>
              <SegmentedButton.Label>
                <AndroidText>{option}</AndroidText>
              </SegmentedButton.Label>
            </SegmentedButton>
          ))}
        </SingleChoiceSegmentedButtonRow>
      </AndroidHost>
    )
  }

  return (
    <Host matchContents={{ vertical: true }}>
      <Picker selection={selectedIndex} onSelectionChange={onChange} modifiers={[pickerStyle("segmented")]}>
        {options.map((option, index) => (
          <Text key={option} modifiers={[tag(index)]}>{option}</Text>
        ))}
      </Picker>
    </Host>
  )
}

export default NativeSegmentedControl
