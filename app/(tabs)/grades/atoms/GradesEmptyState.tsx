import { t } from 'i18next';
import React, { memo } from 'react';

import { EmptyItem } from '@/ui/components/EmptyItem';

interface GradesEmptyStateProps {
  /** The period couldn't be fetched — shown instead of the "no grades" copy. */
  hasError: boolean;
  /** Display name of the failing service, when known. */
  serviceName?: string;
  /** The list is empty because the search matched nothing, not because there are no grades. */
  isSearching: boolean;
}

const GradesEmptyState = memo(({ hasError, serviceName, isSearching }: GradesEmptyStateProps) => {
  if (hasError) {
    return (
      <EmptyItem
        icon="AlertTriangle"
        title={t('Grades_Error_Title')}
        description={serviceName
          ? t('Grades_Error_Description', { service: serviceName })
          : t('Grades_Error_Description_Unknown')}
        margin={32}
      />
    );
  }

  if (isSearching) {
    return (
      <EmptyItem
        icon="Search"
        title={t('Grades_Search_Empty_Title')}
        description={t('Grades_Search_Empty_Description')}
        margin={32}
      />
    );
  }

  return (
    <EmptyItem
      icon="Grades"
      title={t('Grades_Empty_Title')}
      description={t('Grades_Empty_Description')}
      margin={32}
    />
  );
});
GradesEmptyState.displayName = 'GradesEmptyState';

export default GradesEmptyState;
