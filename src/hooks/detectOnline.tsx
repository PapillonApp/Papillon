import { useEffect, useMemo, useState } from "react";
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

const detectOnline = (cache: boolean = false) => {
  const [isOnline, setIsOnline] = useState(true);
  const errorTitle = useMemo(() => getErrorTitle(), []);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });
  }, []);

  const afficheErreur = (
    <Reanimated.View
      entering={FlipInXDown.springify().mass(1).damping(20).stiffness(300)}
      exiting={FadeOutUp.springify().mass(1).damping(20).stiffness(300)}
      layout={animPapillon(LinearTransition)}
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
              : "Vérifie ta connexion Internet et réessaye"}
          </NativeText>
        </NativeItem>
      </NativeList>
    </Reanimated.View>
  );

  return {
    isOnline,
    UNEerreur: afficheErreur,
  };
};

export default detectOnline;
