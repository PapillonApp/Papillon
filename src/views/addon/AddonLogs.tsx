import {NativeItem, NativeList, NativeText} from "@/components/Global/NativeComponents";
import {ScrollView, View} from "react-native";
import {CircleAlert, CircleX, Code, Frown, MessageCircle, Scroll, TriangleAlert} from "lucide-react-native";
import {Screen} from "@/router/helpers/types";
import {AddonLogs as Logs} from "@/addons/types";

const AddonLogs: Screen<"AddonLogs"> = ({ navigation, route }) => {
  const logs: Logs[] = route.params.logs.map(l => {
    return {
      date: new Date(l.date),
      message: l.message,
      type: l.type
    };
  });
  return (
    <ScrollView>
      <View style={{paddingHorizontal: 16}}>
        <NativeList>
          {logs.map((log, index) => (
            <NativeItem
              key={index}
              leading={
                <View>
                  {log.type === "log" && (
                    <Code size={24} color={"#000"}/>
                  )}
                  {log.type === "error" && (
                    <CircleX size={24} color={"#BE0B00"}/>
                  )}
                  {log.type === "warn" && (
                    <TriangleAlert size={24} color={"#CF6B0F"}/>
                  )}
                  {log.type === "info" && (
                    <CircleAlert size={24} color={"#0E7CCB"}/>
                  )}
                </View>
              }
            >
              <NativeText
                variant={"title"}
                style={{color: log.type === "error" ? "#BE0B00" : log.type === "warn" ? "#CF6B0F" : log.type === "info" ? "#0E7CCB" : "#000"}}
              >{log.message}</NativeText>
              <NativeText variant={"subtitle"}>{log.date.toISOString()}</NativeText>
            </NativeItem>
          ))}
        </NativeList>
      </View>
    </ScrollView>
  );
}

export default AddonLogs;
