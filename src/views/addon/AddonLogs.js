import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { ScrollView, View } from "react-native";
import { CircleAlert, CircleX, Code, TriangleAlert } from "lucide-react-native";
var AddonLogs = function (_a) {
    var navigation = _a.navigation, route = _a.route;
    var logs = route.params.logs.map(function (l) {
        return {
            date: new Date(l.date),
            message: l.message,
            type: l.type
        };
    });
    return (<ScrollView>
      <View style={{ paddingHorizontal: 16 }}>
        <NativeList>
          {logs.map(function (log, index) { return (<NativeItem key={index} leading={<View>
                  {log.type === "log" && (<Code size={24} color={"#000"}/>)}
                  {log.type === "error" && (<CircleX size={24} color={"#BE0B00"}/>)}
                  {log.type === "warn" && (<TriangleAlert size={24} color={"#CF6B0F"}/>)}
                  {log.type === "info" && (<CircleAlert size={24} color={"#0E7CCB"}/>)}
                </View>}>
              <NativeText variant={"title"} style={{ color: log.type === "error" ? "#BE0B00" : log.type === "warn" ? "#CF6B0F" : log.type === "info" ? "#0E7CCB" : "#000" }}>{log.message}</NativeText>
              <NativeText variant={"subtitle"}>{log.date.toISOString()}</NativeText>
            </NativeItem>); })}
        </NativeList>
      </View>
    </ScrollView>);
};
export default AddonLogs;
