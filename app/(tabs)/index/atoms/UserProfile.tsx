import { useAccountStore } from '@/stores/account';
import Avatar from '@/ui/components/Avatar';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { getInitials } from '@/utils/chats/initials';
import { Papicons } from '@getpapillon/papicons';
import { t } from 'i18next';
import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';

const UserProfile = ({ subtitle }: { subtitle?: string }) => {

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const account = accounts.find((a) => a.id === lastUsedAccount);

  const [firstName, lastName, level, establishment] = useMemo(() => {
    if (!lastUsedAccount) { return [null, null, null, null]; }

    const firstName = account?.firstName;
    const lastName = account?.lastName;
    const level = account?.className;
    const establishment = account?.schoolName;

    return [firstName, lastName, level, establishment];
  }, [lastUsedAccount, accounts]);

  return (
    <Stack
      direction="horizontal"
      hAlign="center"
      gap={14}
      inline
      flex

      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      }}
    >
      <Avatar
        size={38}
        initials={getInitials(`${account?.firstName} ${account?.lastName}`)}
        imageUrl={account && account.customisation && account.customisation.profilePicture && !account.customisation.profilePicture.startsWith("PCFET0NUWVBFIGh0bWw+") ? `data:image/png;base64,${account.customisation.profilePicture}` : undefined}
      />
      <Stack
        direction="vertical"
        vAlign="center"
        gap={0}
        inline
        flex
      >
        <TouchableOpacity activeOpacity={0.5}>
          <Stack
            direction="horizontal"
            hAlign="center"
            gap={6}
          >
            <Typography nowrap color='white' variant='navigation' weight='bold'>
              {t('Home_Welcome_Name', { name: firstName, emoji: "👋" })}
            </Typography>
            <Papicons name="chevrondown" size={20} color="white" opacity={0.7} />
          </Stack>
        </TouchableOpacity>
        {subtitle &&
          <Typography nowrap color='white' variant='body1' style={{ opacity: 0.7 }}>
            {subtitle}aaaaaa
          </Typography>
        }
      </Stack>
    </Stack>
  );
};

export default UserProfile;