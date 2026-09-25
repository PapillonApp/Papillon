import { useCallback, useState } from "react";
import { Alert } from "react-native";

export const describeError = (error: unknown) => {
  const code = (error as { code?: string } | null)?.code;
  const message = (error as Error | null)?.message ?? String(error);
  return code ? `${code}\n\n${message}` : message;
};

export const showError = (error: unknown) => Alert.alert("L'action a échoué", describeError(error));

export function confirmDestructive(
  title: string,
  message: string,
  confirm: string,
  onConfirm: () => Promise<unknown> | unknown
) {
  Alert.alert(title, message, [
    { text: "Annuler", style: "cancel" },
    {
      text: confirm,
      style: "destructive",
      onPress: async () => {
        try {
          await onConfirm();
        } catch (error) {
          showError(error);
        }
      },
    },
  ]);
}

export function useDevAction() {
  const [running, setRunning] = useState<string | null>(null);

  const run = useCallback(async (key: string, action: () => Promise<unknown> | unknown) => {
    setRunning(key);
    try {
      await action();
    } catch (error) {
      showError(error);
    } finally {
      setRunning(null);
    }
  }, []);

  return { running, run };
}

export const formatDate = (value: number) =>
  new Date(value).toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatTime = (value: number) => new Date(value).toLocaleTimeString("fr-FR");
