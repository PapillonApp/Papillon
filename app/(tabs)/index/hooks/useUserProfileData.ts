import { useMemo } from 'react';
import { useAccountStore } from '@/stores/account';
import { getInitials } from '@/utils/chats/initials';

export const useUserProfileData = () => {
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
  }, [lastUsedAccount, account]);

  const initials = useMemo(() => getInitials(`${account?.firstName} ${account?.lastName}`), [account]);
  
  const profilePicture = useMemo(() => {
      if (account && account.customisation && account.customisation.profilePicture && !account.customisation.profilePicture.startsWith("PCFET0NUWVBFIGh0bWw+")) {
          return `data:image/png;base64,${account.customisation.profilePicture}`;
      }
      return undefined;
  }, [account]);

  return {
    firstName,
    lastName,
    level,
    establishment,
    initials,
    profilePicture
  };
};
