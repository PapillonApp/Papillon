import { Papicons } from '@getpapillon/papicons';
import { MenuView } from '@react-native-menu/menu';
import { useTheme } from '@react-navigation/native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Pressable } from 'react-native';

import Avatar from '@/ui/components/Avatar';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';

import { useUserProfileData } from '../hooks/useUserProfileData';

const UserProfile = ({ subtitle, onPress }: { subtitle?: string, onPress?: () => void }) => {
  const router = useRouter();
  const { firstName, lastName, level, establishment, initials, profilePicture } = useUserProfileData();

  const theme = useTheme();

  const accountsList = [
    {
      firstName,
      lastName,
      level,
      establishment,
      initials,
      profilePicture,
      current: true,
    },
  ]

  return (
    <Stack inline flex>
      <Stack
        direction="horizontal"
        hAlign="center"
        gap={10}
      >
        <Pressable onPress={() => router.push('/(modals)/profile')}>
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
            <Avatar
              size={40}
              initials={initials}
              imageUrl={profilePicture}
            />
          </LiquidGlassView>
        </Pressable>

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
          <MenuView
            actions={[
              {
                id: 'workspaces',
                title: '',
                displayInline: true,
                subactions: accountsList.map((account) => ({
                  id: account.id,
                  title: account.firstName + ' ' + account.lastName,
                  subtitle: account.establishment,
                  state: account.current ? 'on' : 'off',
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
        </LiquidGlassView>
      </Stack>
    </Stack>
  );
};

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