import { Papicons } from '@getpapillon/papicons';
import { MenuView } from '@react-native-menu/menu';
import { useTheme } from '@react-navigation/native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Pressable } from 'react-native';

import { initializeAccountManager } from '@/services/shared';
import { useAccountStore } from '@/stores/account';
import Avatar from '@/ui/components/Avatar';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';

import { useUserProfileData } from '../hooks/useUserProfileData';

const UserProfile = ({ subtitle, onPress }: { subtitle?: string, onPress?: () => void }) => {
  const router = useRouter();
  const { firstName, lastName, initials, profilePicture } = useUserProfileData();
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const theme = useTheme();

  return (
    <Stack inline flex>
      <Stack
        direction="horizontal"
        hAlign="center"
        gap={10}
      >
        <Pressable onPress={() => router.push('/(modals)/profile')}>
          <UserProfileItemContainer
            glassType="clear"
            isInteractive={true}
            glassTintColor="transparent"
            glassOpacity={0}
            style={{
              borderRadius: 300,
              zIndex: 999999,
            }}
          >
            <Avatar
              size={40}
              initials={initials}
              imageUrl={profilePicture}
            />
          </UserProfileItemContainer>
        </Pressable>

        <UserProfileItemContainer>
          <MenuView
            onPressAction={async ({ nativeEvent }) => {
              const store = useAccountStore.getState();
              store.setLastUsedAccount(nativeEvent.event);
              await initializeAccountManager();
            }}
            actions={[
              {
                id: 'workspaces',
                title: '',
                displayInline: true,
                subactions: accounts.map((account) => ({
                  id: account.id,
                  title: account.firstName + ' ' + account.lastName,
                  subtitle: account.schoolName,
                  state: account.id === lastUsedAccount ? 'on' : 'off',
                })),
              },
              {
                id: 'edit',
                title: 'Edit profile',
                image: 'person.crop.circle',
                imageColor: theme.colors.text,
              },
              {
                id: 'add',
                title: 'Add account',
                image: 'plus',
                imageColor: theme.colors.text,
              },
            ]}
          >
            <Stack direction="vertical" vAlign="center" gap={0} style={{ height: 42, paddingHorizontal: 12 }}>
              <Stack direction="horizontal" hAlign="center" gap={6}>
                <Typography nowrap color='white' variant='navigation' weight='bold' style={{ maxWidth: Dimensions.get('window').width - 230 }}>
                  {firstName} {lastName}
                </Typography>
                <Papicons name="chevrondown" size={20} color="white" opacity={0.5} style={{ marginRight: 0 }} />
              </Stack>
              {subtitle &&
                <Typography nowrap color='white' variant='body1' style={{ opacity: 0.7 }}>
                  {subtitle}
                </Typography>
              }
            </Stack>
          </MenuView>
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
    <Stack backgroundColor="#FFFFFF40" radius={300}>
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