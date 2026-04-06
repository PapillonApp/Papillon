import { Papicons } from '@getpapillon/papicons';
import type { MenuAction } from '@react-native-menu/menu';
import { useTheme } from '@react-navigation/native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { Pressable } from 'react-native';

import ActivityIndicator from '@/ui/components/ActivityIndicator';
import { initializeAccountManager } from '@/services/shared';
import { useAccountStore } from '@/stores/account';
import Avatar from '@/ui/components/Avatar';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';

import { useUserProfileData } from '../hooks/useUserProfileData';
import { t } from 'i18next';
import { formatSchoolName } from '@/utils/format/formatSchoolName';
import ActionMenu from '@/ui/components/ActionMenu';
import {
  ANONYMOUS_PROFILE_BLUR_RADIUS,
  getDisplayPersonName,
  getDisplaySchoolName,
  useAnonymousMode,
} from '@/utils/privacy/anonymize';

type UserProfileMenuAction = MenuAction & {
  papicon?: React.ComponentProps<typeof Papicons>["name"];
};

const UserProfile = ({
  subtitle,
  onPress,
  isLoading = false,
}: {
  subtitle?: string,
  onPress?: () => void,
  isLoading?: boolean,
}) => {
  const router = useRouter();
  const { firstName, lastName, initials, profilePicture, level, establishment } = useUserProfileData() ?? {};
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const theme = useTheme();
  const anonymousMode = useAnonymousMode();

  const AccountsMenuItems: UserProfileMenuAction[] = (accounts && accounts.length > 0) ? accounts.map((account) => ({
    id: account.id,
    title: getDisplayPersonName(account.firstName, account.lastName, anonymousMode),
    subtitle: anonymousMode
      ? (getDisplaySchoolName(account.schoolName, true) ?? "")
      : formatSchoolName(account.schoolName ?? ""),
    state: account.id === lastUsedAccount ? "on" : "off",
  })) : [];

  const menuActions: UserProfileMenuAction[] = [
    ...(Platform.OS === "ios" ? [{
      id: 'workspaces',
      title: '',
      displayInline: true,
      subactions: AccountsMenuItems,
    }] : AccountsMenuItems),
    {
      id: 'edit',
      title: t('Home_Edit_Profile'),
      image: 'person.crop.circle',
      papicon: 'user',
      imageColor: theme.colors.text,
    },
    {
      id: 'add',
      title: t('Home_Add_Profile'),
      image: 'plus',
      papicon: 'add',
      imageColor: theme.colors.text,
    },
  ];

  return (
    <Stack inline flex>
      <Stack
        direction="horizontal"
        hAlign="center"
        gap={10}
      >
        <Pressable onPress={() => router.push('/(modals)/profile')}>
          <UserProfileItemContainer>
            <Avatar
              size={40}
              initials={initials}
              imageUrl={profilePicture}
              blurRadius={anonymousMode ? ANONYMOUS_PROFILE_BLUR_RADIUS : 0}
            />
          </UserProfileItemContainer>
        </Pressable>

        <UserProfileItemContainer>
          <ActionMenu
            onPressAction={async ({ nativeEvent }) => {
              if (nativeEvent.event === "edit") {
                router.push('/(modals)/profile');
                return;
              }

              if (nativeEvent.event === "add") {
                router.push("/(onboarding)/ageSelection?action=addService");
                return;
              }

              const store = useAccountStore.getState();
              store.setLastUsedAccount(nativeEvent.event);
              await initializeAccountManager();
            }}
            actions={menuActions}
          >
            <Stack direction="vertical" vAlign="center" gap={0} style={{ height: 42, paddingHorizontal: 12 }}>
              <Stack direction="horizontal" hAlign="center" gap={6}>
                <Typography nowrap color='white' variant='navigation' weight='bold' style={{ maxWidth: Dimensions.get('window').width - 230 }}>
                  {firstName && lastName ? `${firstName} ${lastName}` : "Mon compte"}
                </Typography>
                <Papicons name="chevrondown" size={20} color="white" opacity={0.5} style={{ marginRight: 0 }} />
                {isLoading && (
                  <ActivityIndicator
                    size={16}
                    strokeWidth={2.5}
                    color="#FFFFFFCC"
                    style={{ marginLeft: 2 }}
                  />
                )}
              </Stack>
              {subtitle &&
                <Typography nowrap color='white' variant='body1' style={{ opacity: 0.7 }}>
                  {subtitle}
                </Typography>
              }
            </Stack>
          </ActionMenu>
        </UserProfileItemContainer>
      </Stack>
    </Stack>
  );
};

const UserProfileItemContainer = ({ children }: { children: React.ReactNode }) => {
  if (runsIOS26) {
    return (
      <LiquidGlassView
        glassType="clear"
        isInteractive={true}
        glassTintColor="transparent"
        glassOpacity={0}
        style={{
          borderRadius: 300,
          zIndex: 999999,
        }}
      >
        {children}
      </LiquidGlassView>
    );
  }


  return (
    <Stack style={{ marginRight: -8 }}>
      {children}
    </Stack>
  )

}

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  }
});

export default UserProfile;