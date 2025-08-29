import { Papicons } from "@getpapillon/papicons"
import { useTheme } from "@react-navigation/native"
import { Image, ImageSourcePropType, View, Switch } from "react-native"
import Stack from "@/ui/components/Stack"
import Typography from "@/ui/components/Typography"
import Icon from "@/ui/components/Icon"

interface SettingsHeaderProps {
  color: string
  title: string
  description: string
  iconName?: string
  imageSource?: ImageSourcePropType
  height?: number
  showSwitch?: boolean
  switchValue?: boolean
  onSwitchChange?: (value: boolean) => void
  switchLabel?: string
  switchColor?: string
}

export default function SettingsHeader({
  color,
  title,
  description,
  iconName,
  imageSource,
  height = 280,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  switchLabel,
  switchColor
}: SettingsHeaderProps) {
  const theme = useTheme()
  const { colors } = theme

  return (
    <Stack
      direction="vertical"
      style={{
        padding: 13,
        backgroundColor: color,
        borderRadius: 25,
        height,
        justifyContent: "flex-end",
        borderWidth: 1,
        borderColor: colors.border
      }}
      hAlign="center"
    >
      {imageSource && (
        <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 5 }}>
          <Image
            source={imageSource}
            style={{
              maxWidth: 350,
              maxHeight: 130
            }}
            resizeMode="contain"
          />
        </View>
      )}

      <Stack
        flex
        direction="horizontal"
        hAlign="center"
        vAlign="center"
        style={{
          backgroundColor: colors.card,
          gap: 10,
          padding: 18,
          borderRadius: 15
        }}
      >
        {iconName && (
          <Icon>
            <Papicons name={iconName} opacity={0.6} />
          </Icon>
        )}

        <Stack flex direction="vertical" style={{ flex: 1 }}>
          <Typography variant="title">{title}</Typography>
          <Typography style={{ opacity: 0.6 }} variant="caption">
            {description}
          </Typography>


        </Stack>
        {showSwitch && (
          <Stack direction="horizontal" style={{ alignItems: "center", gap: 8 }}>
            {switchLabel && (
              <Typography variant="body2" style={{ flex: 1 }}>
                {switchLabel}
              </Typography>
            )}
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              trackColor={{ false: colors.border, true: switchColor }}
              thumbColor={switchValue ? "#FFFFFF" : "#f4f3f4"}
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
