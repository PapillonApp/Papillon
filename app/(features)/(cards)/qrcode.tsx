import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { Papicons, Phone } from "@getpapillon/papicons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import QRCode from 'react-native-qrcode-svg';

export default function QRCodePage() {
  const search = useLocalSearchParams();
  const qr = String(search.qrcode)

  const { t } = useTranslation();

  return (
    <>
      <View
        style={{
          backgroundColor: "black",
          flex: 1,
          padding: 100,
          paddingTop: 200,
          gap: 20
        }}
      >
        <View
          style={{
            padding: 15,
            borderRadius: 10,
            backgroundColor: "white",
            alignSelf: "center"
          }}
        >
          <QRCode value={qr} size={170} />
        </View>

        <Stack style={{ width: "100%" }} hAlign="center">
          <Phone fill={"#FFFFFF"} />
          <Typography variant="body2" align="center" color="#FFFFFF">{t("Profile_Cards_Scan_Orientation")}</Typography>
        </Stack>
      </View>
      <AnimatedPressable
        onPress={() => {
          router.back()
        }}
        style={{
          position: "absolute",
          top: 50,
          right: 20
        }}>
        <View
          style={{
            backgroundColor: "#FFFFFF70",
            padding: 10,
            borderRadius: 500
          }}
        >
          <Papicons name={"Cross"} fill={"#FFFFFF"} />
        </View>
      </AnimatedPressable>
    </>
  )
}