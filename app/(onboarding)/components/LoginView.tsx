import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Alert, Image, View } from 'react-native';

import Stack from '@/ui/components/Stack';
import Button from '@/ui/new/Button';
import TextInput from '@/ui/new/TextInput';
import Typography from '@/ui/new/Typography';
import ActivityIndicator from '@/ui/components/ActivityIndicator';
import { Dynamic } from '@/ui/components/Dynamic';

interface LoginViewProps {
  color: string;
  serviceName: string;
  serviceIcon: any;
  loading?: boolean;
  fields?: {
    name: string;
    placeholder: string;
    secureTextEntry: boolean;
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
  fields = [
    {
      name: "username",
      placeholder: "Nom d'utilisateur",
      secureTextEntry: false,
    },
    {
      name: "password",
      placeholder: "Mot de passe",
      secureTextEntry: true,
    }
  ],
  actions = [
    {
      label: "Se connecter",
      variant: "primary",
      submit: true,
    },
    {
      label: "Problèmes de connexion ?",
      variant: "secondary",
      onPress: () => {
        Alert.alert("Aide à la connexion", "Si vous rencontrez des problèmes pour vous connecter, veuillez contacter le support de votre service ou vérifier vos identifiants.");
      },
    }
  ],
  onSubmit,
}: LoginViewProps) {
  const { colors } = useTheme();

  const [fieldValues, setFieldValues] = React.useState<{ [key: string]: string }>({});

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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <View
        style={{
          borderColor: colors.text + "20",
          backgroundColor: !serviceIcon ? (color ?? colors.primary) : colors.card,
          borderWidth: 1,
          width: 72,
          height: 72,
          borderRadius: 16,
          marginBottom: 16,
          shadowColor: 'black',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {serviceIcon && (
          <Image
            source={serviceIcon}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 16,
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
        Connexion au service
      </Typography>

      <Stack animated direction='horizontal' hAlign='center' gap={10}>
        <Dynamic animated>
          <Typography variant="h3" align="center">
            {serviceName || "Service inconnu"}
          </Typography>
        </Dynamic>
        {loading &&
          <Dynamic animated>
            <ActivityIndicator color={color} size={22} strokeWidth={3.5} />
          </Dynamic>
        }
      </Stack>

      <Stack
        padding={[0, 20]}
        width={"100%"}
        gap={8}
      >
        {fields.map((field, index) => (
          <TextInput
            key={index}
            color={color}
            placeholder={field.placeholder}
            secureTextEntry={field.secureTextEntry}
            onChangeText={(value) => handleChange(field.name, value)}
          />
        ))}
      </Stack>

      <Stack
        width={"100%"}
        gap={8}
      >
        {actions.map((action, index) => (
          <Button
            key={index}
            color={color}
            fullWidth
            label={action.label}
            variant={action.variant}
            onPress={action.onPress ? action.onPress : action.submit ? handleSubmit : undefined}
          />
        ))}
      </Stack>

      <Typography variant="caption" align="center" color="textSecondary" style={{ marginTop: 16 }}>
        Papillon n’est pas affilié à {serviceName || "ce service"}. Votre mot de passe n’est pas lu ou conservé par Papillon.
      </Typography>
    </View>
  );
}