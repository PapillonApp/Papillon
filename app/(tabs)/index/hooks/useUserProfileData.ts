import { useMemo } from 'react';

import { useAccountStore } from '@/stores/account';
import { getInitials } from '@/utils/chats/initials';
import { getAccountProfilePictureUri } from '@/utils/profilePicture';

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
    return getAccountProfilePictureUri(account?.customisation?.profilePicture);
  }, [account?.customisation?.profilePicture]);

  if(!account) {return null;}

  return {
    firstName,
    lastName,
    level,
    establishment,
    initials,
    profilePicture
  };
};
