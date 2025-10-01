import { Platform } from "react-native";
import { isIOS } from "@/utils/platform";

export const runsIOS26 = (isIOS && parseInt(Platform.Version as string, 10) >= 26);
// return (isIOS && parseInt(Platform.Version) >= 26);