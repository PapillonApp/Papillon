import { useTheme } from "expo-router/react-navigation";
import React from 'react';
import { Alert, Image, TextInputProps, View } from 'react-native';
import { useTranslation } from "react-i18next";

import ActivityIndicator from '@/ui/components/ActivityIndicator';
import { Dynamic } from '@/ui/components/Dynamic';
import Stack from '@/ui/components/Stack';
import Button from '@/ui/new/Button';
import TextInput from '@/ui/new/TextInput';
import Typography from '@/ui/new/Typography';

interface LoginViewProps {
  color: string;
  serviceName: string;
  serviceIcon: any;
  loading?: boolean;
  initialValues?: Record<string, string>;
  fields?: {
    name: string;
    placeholder: string;
    secureTextEntry: boolean;
    textContentType?: "username" | "password";
    keyboardType?: "default" | "number-pad" | "decimal-pad" | "email-address" | "phone-pad" | "url" | "numeric";
    autoCapitalize?: TextInputProps["autoCapitalize"];
    autoCorrect?: boolean;
    spellCheck?: boolean;
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
  serviceIcon,
  loading = false,
  initialValues,
  fields,
  actions,
  onSubmit,
}: LoginViewProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [fieldValues, setFieldValues] = React.useState<{ [key: string]: string }>(initialValues ?? {});

  const defaultFields = fields ?? [
    {
      name: "username",
      placeholder: t("INPUT_USERNAME"),
      secureTextEntry: false,
      textContentType: "username" as const,
      autoCapitalize: "none" as const,
      autoCorrect: false,
      spellCheck: false,
    },
    {
      name: "password",
      placeholder: t("INPUT_PASSWORD"),
      secureTextEntry: true,
      textContentType: "password" as const,
      autoCapitalize: "none" as const,
      autoCorrect: false,
      spellCheck: false,
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
      onSubmit(fieldValues);
    }
  };

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          borderColor: colors.text + "20",
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

      <Typography variant="body" align="center" color="textSecondary">
        {t("ONBOARDING_LOGIN_TO_SERVICE")}
      </Typography>

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

      <Stack padding={[0, 20]} width={"100%"} gap={8} style={{ maxWidth: 600 }}>
        {defaultFields.map((field, index) => (
          <TextInput
            key={index}
            color={color}
            placeholder={field.placeholder}
            value={fieldValues[field.name] ?? ""}
            secureTextEntry={field.secureTextEntry}
            onChangeText={value => handleChange(field.name, value)}
            textContentType={
              field.textContentType ? field.textContentType : undefined
            }
            keyboardType={field.keyboardType ? field.keyboardType : "default"}
            autoCapitalize={field.autoCapitalize}
            autoCorrect={field.autoCorrect}
            spellCheck={field.spellCheck}
          />
        ))}
      </Stack>

      <Stack width={"100%"} gap={8} hAlign={"center"} style={{ marginTop: 'auto' }}>
        <Typography
          variant="caption"
          align="center"
          color="textSecondary"
          style={{ marginVertical: 16, marginBottom: 8 }}
        >
          {t("ONBOARDING_LOGIN_DISCLAIMER", {
            service: serviceName || t("ONBOARDING_THIS_SERVICE"),
          })}
        </Typography>
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
                  : undefined
            }
          />
        ))}
      </Stack>
    </View>
  );
}
