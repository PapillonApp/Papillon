import { Papicons } from '@getpapillon/papicons';
import { MenuView } from '@react-native-menu/menu';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import Avatar from '@/ui/components/Avatar';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';

import { useUserProfileData } from '../hooks/useUserProfileData';

const UserProfile = ({ subtitle, onPress }: { subtitle?: string, onPress?: () => void }) => {
  const router = useRouter();
  const { firstName, initials, profilePicture } = useUserProfileData();

  return (
    <Stack inline flex>
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
              id: 'profile',
              title: 'Profile',
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.6}
          >
            <Stack
              direction="horizontal"
              hAlign="center"
              gap={14}
            >

              <Avatar
                size={38}
                initials={initials}
                imageUrl={profilePicture}
              />
              <Stack direction="vertical" vAlign="center" gap={0}>
                <Stack direction="horizontal" hAlign="center" gap={6}>
                  <Typography nowrap color='white' variant='navigation' weight='bold'>
                    {t('Home_Welcome_Name', { name: firstName, emoji: "👋" })}
                  </Typography>
                  <Papicons name="chevrondown" size={20} color="white" opacity={0.5} style={{ marginRight: 12 }} />
                </Stack>
                {subtitle &&
                  <Typography nowrap color='white' variant='body1' style={{ opacity: 0.7 }}>
                    {subtitle}
                  </Typography>
                }
              </Stack>
            </Stack>
          </TouchableOpacity>
        </MenuView>
      </LiquidGlassView>
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