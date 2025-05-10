import { useEffect, useState, useMemo } from "react";
import NetInfo from "@react-native-community/netinfo";
import { getErrorTitle } from "@/utils/format/get_papillon_error_title";
import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import Reanimated, {
  FadeOutUp,
  FlipInXDown,
  LinearTransition,
} from "react-native-reanimated";
import { WifiOff } from "lucide-react-native";
import { animPapillon } from "@/utils/ui/animations";

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const errorTitle = useMemo(() => getErrorTitle(), []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, errorTitle };
};

const OfflineWarning = ({ cache = false, paddingTop = 0 }) => {
  const { errorTitle } = useOnlineStatus();

  return (
    <Reanimated.View
      entering={FlipInXDown.springify().mass(1).damping(20).stiffness(300)}
      exiting={FadeOutUp.springify().mass(1).damping(20).stiffness(300)}
      layout={animPapillon(LinearTransition)}
      style={{
        paddingTop: paddingTop,
      }}
    >
      <NativeList inline>
        <NativeItem icon={<WifiOff />}>
          <NativeText
            variant="title"
            style={{ paddingVertical: 2, marginBottom: -4 }}
          >
            {errorTitle.label} {errorTitle.emoji}
          </NativeText>
          <NativeText variant="subtitle">
            Tu es hors ligne.{" "}
            {cache
              ? "Les données affichées peuvent être obsolètes."
              : "Vérifie ta connexion Internet et réessaie"}
          </NativeText>
        </NativeItem>
      </NativeList>
    </Reanimated.View>
  );
};

export { useOnlineStatus, OfflineWarning };
