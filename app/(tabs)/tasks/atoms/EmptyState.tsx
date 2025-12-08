import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { t } from 'i18next';

import Typography from '@/ui/components/Typography';

interface EmptyStateProps {
  isSearching: boolean;
}

const EmptyState = memo(({ isSearching }: EmptyStateProps) => (
  <View style={styles.emptyContainer}>
    <Typography variant="h4" align="center">
      {isSearching ? t('Tasks_Search_NoResults') : t('Tasks_NoTasks_Title')}
    </Typography>
    <Typography variant="body2" align="center" style={styles.emptyText}>
      {isSearching ? "Essaie avec un autre mot clé." : t('Tasks_NoTasks_Description')}
    </Typography>
  </View>
));
EmptyState.displayName = "EmptyState";

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 8,
  },
});

export default EmptyState;
