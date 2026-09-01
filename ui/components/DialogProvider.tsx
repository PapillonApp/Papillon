import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  type AlertButton,
  type AlertOptions,
  Platform,
} from "react-native";

import Dialog from "./Dialog";

type DialogRequest = {
  title?: string | null;
  message?: string | null;
  buttons: AlertButton[];
  options?: AlertOptions;
};

type DialogContextType = {
  showDialog: typeof Alert.alert;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);
const globalWithOriginalAlert = globalThis as typeof globalThis & {
  __papillonOriginalAlert?: typeof Alert.alert;
};

if (!globalWithOriginalAlert.__papillonOriginalAlert) {
  globalWithOriginalAlert.__papillonOriginalAlert = Alert.alert;
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<DialogRequest[]>([]);
  const currentDialogRef = useRef<DialogRequest | null>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showDialogRef = useRef<typeof Alert.alert>(() => {});

  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogRequest | null>(
    null
  );

  function clearTimer(
    timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function openNextDialog() {
    if (currentDialogRef.current) {
      return;
    }

    const nextDialog = queueRef.current.shift();
    if (!nextDialog) {
      return;
    }

    clearTimer(closeTimeoutRef);
    clearTimer(openTimeoutRef);
    currentDialogRef.current = nextDialog;
    setCurrentDialog(nextDialog);
    setVisible(true);
    openTimeoutRef.current = setTimeout(() => {
      setModalVisible(true);
    }, 0);
  }

  function showDialog(
    title: string | null | undefined,
    message?: string | null,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) {
    queueRef.current.push({
      title,
      message,
      buttons: buttons?.length ? buttons : [{ text: "OK" }],
      options,
    });
    openNextDialog();
  }

  function closeDialog(button?: AlertButton, dismissed?: boolean) {
    const dialog = currentDialogRef.current;
    if (!dialog) {
      return;
    }

    clearTimer(openTimeoutRef);
    setModalVisible(false);
    clearTimer(closeTimeoutRef);
    closeTimeoutRef.current = setTimeout(() => {
      currentDialogRef.current = null;
      setVisible(false);
      setCurrentDialog(null);

      if (dismissed) {
        dialog.options?.onDismiss?.();
      } else {
        button?.onPress?.();
      }

      openNextDialog();
    }, 220);
  }

  useEffect(() => {
    showDialogRef.current = showDialog;
  });

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    Alert.alert = ((title, message, buttons, options) => {
      showDialogRef.current(title, message, buttons, options);
    }) as typeof Alert.alert;

    return () => {
      Alert.alert = globalWithOriginalAlert.__papillonOriginalAlert!;
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTimer(openTimeoutRef);
      clearTimer(closeTimeoutRef);
      queueRef.current = [];
      currentDialogRef.current = null;
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      showDialog,
    }),
    []
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {Platform.OS === "android" && currentDialog ? (
        <Dialog
          visible={visible}
          modalVisible={modalVisible}
          title={currentDialog.title}
          message={currentDialog.message}
          buttons={currentDialog.buttons}
          cancelable={currentDialog.options?.cancelable}
          onDismiss={() => {
            if (currentDialog.options?.cancelable) {
              closeDialog(undefined, true);
            }
          }}
          onPressButton={button => {
            closeDialog(button, false);
          }}
        />
      ) : null}
    </DialogContext.Provider>
  );
}
