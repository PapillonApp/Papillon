import { LegendList } from '@legendapp/list';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { FlatList, FlatListProps, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { runsIOS26 } from '../utils/IsLiquidGlass';
import Icon from './Icon';
import Item, { Leading, Trailing } from './Item';
import Stack from './Stack';
import Typography from './Typography';

interface SectionItem {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  icon?: React.ReactNode;
  papicon?: React.ReactNode;
  type?: string;
  content?: React.ReactNode;
  title?: string;
  tags?: Array<string>;
  description?: string;
  onPress?: () => void;
  hideTitle?: boolean;
  itemProps?: PressableProps;
  ui?: {
    first?: boolean;
    last?: boolean;
    [key: string]: any;
  };
}

interface Section {
  title?: string;
  icon?: React.ReactNode;
  papicon?: React.ReactNode;
  hideTitle?: boolean; // Optional property to hide the title
  items: Array<SectionItem>;
}

interface TableFlatListProps extends FlatListProps<SectionItem> {
  sections: Array<Section>;
  engine?: 'FlatList' | 'LegendList' | 'FlashList';
  contentInsetAdjustmentBehavior?: 'automatic' | 'scrollableAxes' | 'never';
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  listProps?: any;
  renderItem?: (item: SectionItem) => React.ReactNode;
  data?: Array<SectionItem>;
  [key: string]: any;
}

const TableFlatList: React.FC<TableFlatListProps> = ({
  sections,
  engine = 'FlatList',
  contentInsetAdjustmentBehavior = 'never',
  style = {},
  contentContainerStyle = {},
  ...rest
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const headerHeight = useHeaderHeight();

  // render section title and items in same level array
  const data = sections.reduce((acc, section) => {
    if (section.title) {
      acc.push({ type: 'title', title: section.title, icon: section.icon, papicon: section.papicon, hideTitle: section.hideTitle });
    }
    section.items.forEach((item, idx) => {
      const first = idx === 0;
      const last = idx === section.items.length - 1;
      acc.push({
        ...item,
        type: 'item',
        ui: {
          ...(item.ui || {}),
          first,
          last,
        },
      });
    });
    return acc;
  }, [] as Array<SectionItem & { type: 'title' | 'item'; ui?: { first?: boolean; last?: boolean } }>);

  const ListComponent = engine === 'LegendList' ? LegendList : engine === 'FlashList' ? FlashList : FlatList;

  const renderItemComponent = ({ item, index }: any) => (
    item.type === 'item' ? (
      <Reanimated.View
        key={index}
        style={[
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            borderCurve: "continuous",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.16,
            shadowRadius: 1.5,
            elevation: 1,
          },
          item.ui?.first && {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderTopWidth: 1,
          },
          item.ui?.last && {
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            marginBottom: 14,
          }
        ]}
      >
        <Item
          onPress={item.onPress}
          isLast={true}
          {...item.itemProps}
        >
          {item.leading && (
            <Leading>
              {item.leading}
            </Leading>
          )}
          {item.icon || item.papicon ? (
            <Icon papicon={!!item.papicon} opacity={0.5}>
              {item.papicon ? item.papicon : item.icon}
            </Icon>
          ) : null}
          {item.title && (
            <Typography variant='title'>
              {item.title}
            </Typography>
          )}
          {item.description && !item.tags && (
            <Typography variant="caption" color="secondary">
              {item.description}
            </Typography>
          )}
          {item.tags && (
            <Stack direction={"horizontal"} gap={6}>
              {item.tags.map((tag: string, tagIndex: number) => (
                <Stack direction={"horizontal"} gap={8} hAlign={"center"} radius={100} backgroundColor={colors.background} inline padding={[12, 3]} card flat key={tag}>
                  <Typography variant={"body1"} color="secondary">
                    {tag}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
          {item.content && (
            item.content
          )}
          {item.trailing && (
            <Trailing>
              {item.trailing}
            </Trailing>
          )}
        </Item>
      </Reanimated.View>
    ) : item.type === 'title' && !item.hideTitle ? (
      <Stack direction="horizontal" gap={8} vAlign="start" hAlign="center" style={{
        paddingHorizontal: 4,
        paddingVertical: 0,
        marginBottom: 14,
        marginTop: 1,
        opacity: 0.5,
      }}>
        {item.icon || item.papicon ? (
          <Icon size={20} papicon={!!item.papicon}>
            {item.papicon ? item.papicon : item.icon}
          </Icon>
        ) : null}
        <Typography>
          {item.title}
        </Typography>
      </Stack>
    ) : null
  );

  return (
    <ListComponent
      contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
      style={[{
        flex: 1, height: "100%", width: "100%",
        backgroundColor: colors.background,
        paddingTop: runsIOS26 && contentInsetAdjustmentBehavior !== 'automatic' ? headerHeight : 0
      }, style]}
      data={data}
      contentContainerStyle={[{ padding: 16 }, contentContainerStyle]}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      renderItem={renderItemComponent}
      {...rest}
    />
  )
};

export default TableFlatList;