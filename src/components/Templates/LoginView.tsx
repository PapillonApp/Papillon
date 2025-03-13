import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  KeyboardAvoidingView,
  type KeyboardType,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "../Global/NativeComponents";
import { AlertTriangle, Eye, EyeOff, Info } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import ButtonCta from "../FirstInstallation/ButtonCta";
import ResponsiveTextInput from "../FirstInstallation/ResponsiveTextInput";

export interface LoginViewCustomInput {
  identifier: string;
  keyboardType?: KeyboardType;
  title: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  value?: string;
}

const LoginView: React.FC<{
  serviceIcon: ImageSourcePropType;
  serviceName: string;
  loading?: boolean;
  error?: string | null;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  onLogin: (
    username: string,
    password: string,
    customFields: Record<string, string>
  ) => unknown;
  customFields?: LoginViewCustomInput[];
  usernameLabel?: string;
  usernamePlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  usernameKeyboardType?: KeyboardType;
  passwordKeyboardType?: KeyboardType;
}> = ({
  serviceIcon,
  serviceName,
  loading = false,
  error = null,
  autoCapitalize = "none",
  onLogin,
  customFields = [],
  usernameLabel = "Identifiant",
  usernamePlaceholder = "Nom d'utilisateur",
  passwordLabel = "Mot de passe",
  passwordPlaceholder = "Mot de passe",
  usernameKeyboardType = "default",
  passwordKeyboardType = "default",
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [customFieldsInputs, setCustomFieldsInputs] = useState<
    LoginViewCustomInput[]
  >(
    customFields.map((field) => ({
      ...field,
      value: "",
    }))
  );

  const [showPassword, setShowPassword] = useState(false);

  const actionLogin = async () => {
    const customFieldsDict = customFieldsInputs.reduce((acc, field) => {
      acc[field.identifier] = field.value ?? "";
      return acc;
    }, {} as Record<string, string>);

    onLogin(username, password, customFieldsDict);
  };

  return (
    <KeyboardAvoidingView
      behavior="height"
      keyboardVerticalOffset={insets.top + 64}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        overflow: "visible",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          overflow: "visible",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 14,
            margin: 4,
            alignItems: "center",
          }}
        >
          <Image
            source={serviceIcon}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
            }}
          />
          <View
            style={{
              flex: 1,
              gap: 2,
            }}
          >
            <NativeText
              style={{
                fontSize: 16,
                fontFamily: "medium",
                opacity: 0.5,
              }}
            >
              Se connecter au service
            </NativeText>
            <NativeText
              style={{
                fontSize: 20,
                lineHeight: 24,
                fontFamily: "semibold",
              }}
            >
              {serviceName}
            </NativeText>
          </View>
        </View>

        <NativeList inline>
          <NativeItem icon={<Info />}>
            <NativeText variant="subtitle">
              Papillon n'est pas affilié à {serviceName}. La politique de
              confidentialité de {serviceName} s'applique.
            </NativeText>
          </NativeItem>
        </NativeList>

        {error && (
          <NativeList
            style={{
              backgroundColor: "#eb403422",
            }}
          >
            <NativeItem icon={<AlertTriangle />}>
              <NativeText variant="subtitle">Impossible de se connecter, vérifie tes identifiants ou utilise le portail de ton ENT pour te connecter.</NativeText>
            </NativeItem>
          </NativeList>
        )}

        <NativeListHeader label={usernameLabel} />
        <NativeList>
          <NativeItem>
            <ResponsiveTextInput
              defaultValue={username}
              onChangeText={setUsername}
              placeholder={usernamePlaceholder}
              autoCapitalize={autoCapitalize}
              keyboardType={usernameKeyboardType}
              placeholderTextColor={theme.colors.text + "55"}
              style={{
                fontSize: 16,
                fontFamily: "medium",
                flex: 1,
                color: theme.colors.text,
              }}
            />
          </NativeItem>
        </NativeList>

        <NativeListHeader label={passwordLabel} />
        <NativeList>
          <NativeItem>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ResponsiveTextInput
                defaultValue={password}
                onChangeText={setPassword}
                placeholder={passwordPlaceholder}
                placeholderTextColor={theme.colors.text + "55"}
                autoCapitalize={autoCapitalize}
                keyboardType={passwordKeyboardType}
                style={{
                  fontSize: 16,
                  fontFamily: "medium",
                  flex: 1,
                  color: theme.colors.text,
                }}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color={theme.colors.text + "55"} />
                ) : (
                  <Eye color={theme.colors.text + "55"} />
                )}
              </TouchableOpacity>
            </View>
          </NativeItem>
        </NativeList>

        {customFieldsInputs.map((field, index) => (
          <View key={"c" + index}>
            <NativeListHeader label={field.title} />

            <NativeList>
              <NativeItem>
                <ResponsiveTextInput
                  value={field.value}
                  onChangeText={(text) => {
                    setCustomFieldsInputs(
                      customFieldsInputs.map((f, i) => {
                        if (i === index) {
                          return {
                            ...f,
                            value: text,
                          };
                        }
                        return f;
                      })
                    );
                  }}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.colors.text + "55"}
                  autoCapitalize={autoCapitalize}
                  style={{
                    fontSize: 16,
                    fontFamily: "medium",
                    flex: 1,
                    color: theme.colors.text,
                  }}
                  secureTextEntry={field.secureTextEntry}
                />
              </NativeItem>
            </NativeList>
          </View>
        ))}

        <ButtonCta
          primary
          value="Se connecter"
          onPress={actionLogin}
          style={{
            marginTop: 24,
          }}
          icon={loading ? <ActivityIndicator /> : void 0}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginView;
