import { useTheme } from "expo-router/react-navigation";
import React from 'react';
import { Alert, Image, View } from 'react-native';
import { useTranslation } from "react-i18next";

import ActivityIndicator from '@/ui/components/ActivityIndicator';
import { Dynamic } from '@/ui/components/Dynamic';
import Stack from '@/ui/components/Stack';
import Button from '@/ui/new/Button';
import TextInput from '@/ui/new/TextInput';
import Typography from '@/ui/new/Typography';
import { useSafeHorizontalPadding } from "@/ui/hooks/useSafeHorizontalPadding";

interface LoginViewProps {
  color: string;
  serviceName: string;
  serviceSubtitle?: string;
  serviceIcon?: any;
  loading?: boolean;
  showHeader?: boolean;
  showDisclaimer?: boolean;
  disclaimerService?: string;
  disclaimerText?: string;
  fields?: {
    name: string;
    placeholder: string;
    secureTextEntry: boolean;
    textContentType?: "username" | "password";
    keyboardType?: "default" | "number-pad" | "decimal-pad" | "email-address" | "phone-pad" | "url" | "numeric";
    value?: string;
    defaultValue?: string;
    editable?: boolean;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: boolean;
  }[];
  actions?: {
    label: string;
    variant?: "primary" | "secondary" | "outlined" | "ghost" | "text";
    submit?: boolean;
    onPress?: () => void;
  }[];
  onSubmit?: (fieldValues: { [key: string]: string }) => void;
}

export default function LoginView({
  color,
  serviceName,
  serviceSubtitle,
  serviceIcon,
  loading = false,
  showHeader = true,
  showDisclaimer = true,
  disclaimerService,
  disclaimerText,
  fields,
  actions,
  onSubmit,
}: LoginViewProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const safePadding = useSafeHorizontalPadding(20);

  const [fieldValues, setFieldValues] = React.useState<{ [key: string]: string }>({});

  const defaultFields = fields ?? [
    {
      name: "username",
      placeholder: t("INPUT_USERNAME"),
      secureTextEntry: false,
      textContentType: "username" as const,
    },
    {
      name: "password",
      placeholder: t("INPUT_PASSWORD"),
      secureTextEntry: true,
      textContentType: "password" as const,
    }
  ];

  const defaultActions = actions ?? [
    {
      label: t("ONBOARDING_LOGIN_HELP_ACTION"),
      variant: "secondary" as const,
      onPress: () => {
        Alert.alert(t("ONBOARDING_LOGIN_HELP_TITLE"), t("ONBOARDING_LOGIN_HELP_DESCRIPTION"));
      },
    },
    {
      label: t("LOGIN_BTN"),
      variant: "primary" as const,
      submit: true,
    }
  ];

  const handleChange = (name: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const merged: { [key: string]: string } = {};
      defaultFields.forEach((field) => {
        if (field.value !== undefined) {
          merged[field.name] = field.value;
        } else if (field.defaultValue !== undefined && fieldValues[field.name] === undefined) {
          merged[field.name] = field.defaultValue;
        }
      });
      onSubmit({ ...merged, ...fieldValues });
    }
  };

  return (
    <View
      style={{
        justifyContent: showHeader ? "center" : "flex-start",
        alignItems: "center",
        padding: 20,
        paddingTop: showHeader ? 20 : 0,
        ...safePadding,
      }}
    >
      {showHeader && (
        <>
          <View
            style={{
              borderColor: String(colors.text) + "20",
              backgroundColor: !serviceIcon
                ? (color ?? colors.primary)
                : colors.card,
              borderWidth: 1,
              width: 72,
              height: 72,
              borderRadius: 20,
              marginBottom: 16,
              shadowColor: "black",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {serviceIcon && (
              <Image
                source={serviceIcon}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 20,
                }}
              />
            )}

            {!serviceIcon && (
              <Typography variant="h1" color="white">
                {serviceName[0]}
              </Typography>
            )}
          </View>

          {(serviceSubtitle !== undefined ? serviceSubtitle : t("ONBOARDING_LOGIN_TO_SERVICE")) ? (
            <Typography variant="body" align="center" color="textSecondary">
              {serviceSubtitle ?? t("ONBOARDING_LOGIN_TO_SERVICE")}
            </Typography>
          ) : null}

          <Stack animated direction="horizontal" hAlign="center" gap={10}>
            <Dynamic animated>
              <Typography variant="h3" align="center">
                {serviceName || t("ONBOARDING_UNKNOWN_SERVICE")}
              </Typography>
            </Dynamic>
            {loading && (
              <Dynamic animated>
                <ActivityIndicator color={color} size={22} strokeWidth={3.5} />
              </Dynamic>
            )}
          </Stack>
        </>
      )}

      {!showHeader && loading && (
        <View style={{ marginBottom: 16 }}>
          <ActivityIndicator color={color} size={22} strokeWidth={3.5} />
        </View>
      )}

      {defaultFields.length > 0 && (
        <Stack
          padding={[0, showHeader ? 20 : 0]}
          width={"100%"}
          gap={8}
          style={{ maxWidth: 600, ...(!showHeader ? { marginBottom: 16 } : {}) }}
        >
          {defaultFields.map((field, index) => (
            <TextInput
              key={field.name || index}
              color={color}
              placeholder={field.placeholder}
              secureTextEntry={field.secureTextEntry}
              value={field.value !== undefined ? field.value : fieldValues[field.name]}
              defaultValue={field.defaultValue}
              editable={field.editable}
              autoCapitalize={field.autoCapitalize}
              autoCorrect={field.autoCorrect}
              onChangeText={(value: string) => handleChange(field.name, value)}
              textContentType={
                field.textContentType ? field.textContentType : undefined
              }
              keyboardType={field.keyboardType ? field.keyboardType : "default"}
            />
          ))}
        </Stack>
      )}

      <Stack width={"100%"} gap={8} hAlign={"center"} style={{ maxWidth: 600, marginTop: "auto" }}>
        {showDisclaimer && (
          <Typography
            variant="caption"
            align="center"
            color="textSecondary"
            style={{ marginVertical: 16, marginBottom: 8 }}
          >
            {disclaimerText || t("ONBOARDING_LOGIN_DISCLAIMER", {
              service: disclaimerService || serviceName || t("ONBOARDING_THIS_SERVICE"),
            })}
          </Typography>
        )}
        {defaultActions.map((action, index) => (
          <Button
            key={index}
            color={color}
            fullWidth
            label={action.label}
            variant={action.variant}
            onPress={
              action.onPress
                ? action.onPress
                : action.submit
                  ? handleSubmit
                  : () => { }
            }
          />
        ))}
      </Stack>
    </View>
  );
}
