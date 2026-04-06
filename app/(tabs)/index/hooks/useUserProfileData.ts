import { useMemo } from 'react';

import { useAccountStore } from '@/stores/account';
import { getInitials } from '@/utils/chats/initials';
import {
  getDisplayInitials,
  getDisplayPersonName,
  getDisplaySchoolName,
  useAnonymousMode,
} from '@/utils/privacy/anonymize';
import { getAccountProfilePictureUri } from '@/utils/profilePicture';

export const useUserProfileData = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const anonymousMode = useAnonymousMode();
  const account = accounts.find((a) => a.id === lastUsedAccount);

  const [firstName, lastName, level, establishment] = useMemo(() => {
    if (!lastUsedAccount) { return [null, null, null, null]; }

    const displayName = getDisplayPersonName(account?.firstName, account?.lastName, anonymousMode);
    const [displayFirstName, ...displayLastNameParts] = displayName.split(" ");
    const level = account?.className;
    const establishment = getDisplaySchoolName(account?.schoolName, anonymousMode);

    return [displayFirstName ?? null, displayLastNameParts.join(" ") || null, level, establishment ?? null];
  }, [lastUsedAccount, account, anonymousMode]);

  const initials = useMemo(() => {
    return getDisplayInitials(getInitials(`${account?.firstName} ${account?.lastName}`), anonymousMode);
  }, [account, anonymousMode]);
  
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
