import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { t } from 'i18next';
import { Papicons } from '@getpapillon/papicons';
import Avatar from '@/ui/components/Avatar';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { useUserProfileData } from '../hooks/useUserProfileData';
import { useRouter } from 'expo-router';

const UserProfile = ({ subtitle, chevron, onPress }: { subtitle?: string, chevron?: boolean, onPress?: () => void }) => {
  const router = useRouter();
  const { firstName, initials, profilePicture } = useUserProfileData();

  return (
    <Stack
      direction="horizontal"
      hAlign="center"
      gap={14}
      inline
      flex
      style={styles.container}
    >
      <TouchableOpacity
        onPress={() => {
          router.push("/(modals)/profile");
        }}
      >
        <Avatar
          size={38}
          initials={initials}
          imageUrl={profilePicture}
        />
      </TouchableOpacity>
      <Stack direction="vertical" vAlign="center" gap={0} inline flex>
        <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
          <Stack direction="horizontal" hAlign="center" gap={6}>
            <Typography nowrap color='white' variant='navigation' weight='bold'>
              {t('Home_Welcome_Name', { name: firstName, emoji: "👋" })}
            </Typography>
            {chevron &&
              <Papicons name="chevrondown" size={20} color="white" opacity={0.7} />
            }
          </Stack>
        </TouchableOpacity>
        {subtitle &&
          <Typography nowrap color='white' variant='body1' style={{ opacity: 0.7 }}>
            {subtitle}
          </Typography>
        }
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