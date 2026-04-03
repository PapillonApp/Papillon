import { useTheme } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import Reanimated, { LinearTransition } from 'react-native-reanimated';

import { Animation } from "../utils/Animation";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import Typography from "./Typography";

type MarkerProps = {
  children?: React.ReactNode;
};

type ListItemProps = MarkerProps & {
  id?: string;
  animated?: boolean;
  onPress?: () => void;
  containerStyle?: any;
  style?: any;
  entering?: any;
  exiting?: any;
};

type ListViewProps = MarkerProps & {
  id?: string;
  style?: any;
};

type ListRuntimeItemContext = {
  renderItem: (props: ListItemProps) => React.ReactNode;
} | null;

const ListRuntimeItemContext = React.createContext<ListRuntimeItemContext>(null);

const isType = (child, component, name) => {
  return child?.type && (child.type === component || child.type.displayName === name);
};

const splitItemChildren = (children: React.ReactNode) => {
  let leading = null;
  let trailing = null;
  const main = [];

  React.Children.forEach(children, (child) => {
    if (!child) {
      return;
    }

    const type = child.type;
    if (type === Leading || type?.displayName === "List.Leading") {
      leading = child.props.children;
    } else if (type === Trailing || type?.displayName === "List.Trailing") {
      trailing = child.props.children;
    } else {
      main.push(child);
    }
  });

  return { leading, trailing, main };
};

const renderListRow = ({
  itemProps,
  leading,
  trailing,
  main,
  isFirst,
  isLast,
  gapBefore = 0,
  listAnimated,
  colors,
}) => {
  const ItemComponent = listAnimated ? Reanimated.View : View;
  const entering = itemProps.entering ?? (itemProps.animated ? PapillonAppearIn : undefined);
  const exiting = itemProps.exiting ?? (itemProps.animated ? PapillonAppearOut : undefined);

  return (
    <ItemComponent
      style={[
        styles.rowContainer,
        isFirst && styles.first,
        isLast && styles.last,
        { marginTop: gapBefore },
        Platform.OS === "android"
          ? { marginBottom: !isLast ? 4 : 0 }
          : {
              borderColor: colors.border,
              backgroundColor: colors.border,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderTopWidth: isFirst ? 1 : 0,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1,
              overflow: "visible",
              ...itemProps.containerStyle,
            },
      ]}
      layout={itemProps.animated ? Animation(LinearTransition, "list") : undefined}
      entering={entering}
      exiting={exiting}
    >
      <ListTouchable {...(itemProps.onPress ? { onPress: itemProps.onPress } : {})}>
        <View
          style={[
            styles.row,
            isFirst && styles.first,
            isLast && styles.last,
            {
              backgroundColor: colors.item,
              overflow: "hidden",
              ...itemProps.style,
            },
            Platform.OS === "android"
              ? {
                  borderTopLeftRadius: isFirst ? 20 : 8,
                  borderTopRightRadius: isFirst ? 20 : 8,
                  borderBottomLeftRadius: isLast ? 20 : 8,
                  borderBottomRightRadius: isLast ? 20 : 8,
                }
              : null,
          ]}
        >
          {leading && <View style={styles.leading}>{leading}</View>}
          <View style={styles.body}>{main}</View>
          {trailing && <View style={styles.trailing}>{trailing}</View>}
        </View>
      </ListTouchable>
    </ItemComponent>
  );
};

const Item: React.FC<ListItemProps> = (props) => {
  const runtimeContext = useContext(ListRuntimeItemContext);
  if (runtimeContext) {
    return runtimeContext.renderItem(props);
  }
  return props.children;
};
Item.displayName = "List.Item";

const Leading: React.FC<MarkerProps> = ({ children }) => children;
Leading.displayName = "List.Leading";

const Trailing: React.FC<MarkerProps> = ({ children }) => children;
Trailing.displayName = "List.Trailing";

const Section: React.FC<MarkerProps & { id?: string }> = ({ children }) => children;
Section.displayName = "List.Section";

const SectionTitle: React.FC<MarkerProps & { id?: string }> = ({ children }) => children;
SectionTitle.displayName = "List.SectionTitle";

const Label: React.FC<MarkerProps> = ({ children }) => children;
Label.displayName = "List.Label";

const ViewItem: React.FC<ListViewProps> = ({ children }) => children;
ViewItem.displayName = "List.View";

const RawRuntimeItem: React.FC<{
  index: number;
  total: number;
  itemProps: ListItemProps;
  animated: boolean;
  colors: any;
}> = ({ index, total, itemProps, animated, colors }) => {
  const parsed = splitItemChildren(itemProps.children);
  return renderListRow({
    itemProps,
    leading: parsed.leading,
    trailing: parsed.trailing,
    main: parsed.main,
    isFirst: index === 0,
    isLast: total > 0 ? index === total - 1 : false,
    listAnimated: animated,
    colors,
  });
};

const RawRuntimeRenderer: React.FC<{
  item: any;
  animated: boolean;
  colors: any;
}> = ({ item, animated, colors }) => {
  const indexCursorRef = useRef(0);
  const countRef = useRef(0);
  const [count, setCount] = useState(0);

  indexCursorRef.current = 0;

  const runtimeValue = useMemo(() => ({
    renderItem: (itemProps: ListItemProps) => {
      const index = indexCursorRef.current;
      indexCursorRef.current += 1;
      return (
        <RawRuntimeItem
          key={itemProps.id ?? `raw-item-${index}`}
          index={index}
          total={count}
          itemProps={itemProps}
          animated={animated}
          colors={colors}
        />
      );
    },
  }), [animated, colors, count]);

  useEffect(() => {
    if (countRef.current !== indexCursorRef.current) {
      countRef.current = indexCursorRef.current;
      if (count !== countRef.current) {
        setCount(countRef.current);
      }
    }
  });

  return (
    <View style={{ marginTop: item.gapBefore }}>
      <ListRuntimeItemContext.Provider value={runtimeValue}>
        {item.rawItem}
      </ListRuntimeItemContext.Provider>
    </View>
  );
};

const List = ({ children, animated = false, gap = 12, ...rest }) => {
  const theme = useTheme();
  const { colors } = theme;

  const data = useMemo(() => {
    const parseItem = (item, index) => {
      const { leading, trailing, main } = splitItemChildren(item.props.children);

      return {
        kind: "item",
        id: item.props.id || `item-${index}`,
        leading,
        trailing,
        main,
        itemProps: item.props,
      };
    };

    const parseRawItem = (rawItem, index) => {
      return {
        kind: "raw",
        id: rawItem?.props?.id || rawItem?.key?.toString?.() || `raw-${index}`,
        rawItem,
      };
    };

    const parseSectionTitle = (sectionTitle, index, sectionId = null) => {
      let label = null;
      const main = [];

      React.Children.forEach(sectionTitle.props.children, (child) => {
        if (!child) {
          return;
        }

        const type = child.type;
        if (type === Label || type?.displayName === "List.Label") {
          label = child.props.children;
        } else {
          main.push(child);
        }
      });

      return {
        kind: "sectionTitle",
        id: sectionTitle.props.id || `section-title-${index}`,
        sectionId,
        label,
        main,
      };
    };

    const parseViewItem = (viewItem, index, sectionId = null) => {
      return {
        kind: "view",
        id: viewItem.props.id || `view-${index}`,
        sectionId,
        viewProps: viewItem.props,
        main: viewItem.props.children,
      };
    };

    const withSectionFlags = (items, sectionId) => {
      return items.map((item, index) => ({
        ...item,
        sectionId,
        isFirstInSection: index === 0,
        isLastInSection: index === items.length - 1,
      }));
    };

    const output = [];
    const topLevel = React.Children.toArray(children).filter(Boolean);
    let implicitItems = [];
    let implicitSectionId = null;

    const flushImplicit = () => {
      if (!implicitItems.length || !implicitSectionId) {
        implicitItems = [];
        implicitSectionId = null;
        return;
      }
      output.push(...withSectionFlags(implicitItems, implicitSectionId));
      implicitItems = [];
      implicitSectionId = null;
    };

    topLevel.forEach((child, index) => {
      if (isType(child, SectionTitle, "List.SectionTitle")) {
        flushImplicit();
        output.push(parseSectionTitle(child, index));
        return;
      }

      if (isType(child, Section, "List.Section")) {
        flushImplicit();
        const sectionId = child.props?.id || `section-${index}`;
        const sectionChildren = React.Children.toArray(child.props.children).filter(Boolean);
        const sectionEntries = [];
        let sectionItemCursor = 0;

        sectionChildren.forEach((sectionChild, sectionChildIndex) => {
          if (isType(sectionChild, SectionTitle, "List.SectionTitle")) {
            sectionEntries.push(parseSectionTitle(sectionChild, `${index}-title-${sectionChildIndex}`, sectionId));
            return;
          }

          if (isType(sectionChild, ViewItem, "List.View")) {
            sectionEntries.push(parseViewItem(sectionChild, `${index}-view-${sectionChildIndex}`, sectionId));
            return;
          }

          if (isType(sectionChild, Item, "List.Item")) {
            sectionEntries.push(parseItem(sectionChild, `${index}-${sectionItemCursor}`));
            sectionItemCursor += 1;
            return;
          }

          sectionEntries.push(parseRawItem(sectionChild, `${index}-raw-${sectionChildIndex}`));
        });

        const sectionItems = sectionEntries.filter((entry) => entry.kind === "item" || entry.kind === "raw");
        const sectionItemsWithFlags = withSectionFlags(sectionItems, sectionId);
        let sectionItemIndex = 0;
        const normalizedSectionEntries = sectionEntries.map((entry) => {
          if (entry.kind !== "item" && entry.kind !== "raw") {
            return entry;
          }
          const normalized = sectionItemsWithFlags[sectionItemIndex];
          sectionItemIndex += 1;
          return normalized;
        });

        output.push(...normalizedSectionEntries);
        return;
      }

      if (isType(child, ViewItem, "List.View")) {
        flushImplicit();
        output.push(parseViewItem(child, `${index}`));
        return;
      }

      if (isType(child, Item, "List.Item")) {
        if (!implicitSectionId) {
          implicitSectionId = `section-implicit-${index}`;
        }
        implicitItems.push(parseItem(child, `${index}-${implicitItems.length}`));
        return;
      }

      flushImplicit();
      output.push({
        ...parseRawItem(child, `${index}`),
        sectionId: `section-raw-${index}`,
        isFirstInSection: true,
        isLastInSection: true,
      });
    });

    flushImplicit();

    return output.map((entry, index) => {
      if (index === 0) {
        return { ...entry, gapBefore: 0 };
      }

      const previous = output[index - 1];
      if (entry.kind === "sectionTitle") {
        return { ...entry, gapBefore: gap };
      }

      if (entry.kind === "view") {
        return { ...entry, gapBefore: 0 };
      }

      if (entry.isFirstInSection && previous.kind === "sectionTitle") {
        if (previous.sectionId === entry.sectionId) {
          return { ...entry, gapBefore: 6 };
        }
        return { ...entry, gapBefore: 0 };
      }

      if (entry.isFirstInSection && previous.sectionId !== entry.sectionId) {
        return { ...entry, gapBefore: gap };
      }

      return { ...entry, gapBefore: 0 };
    });
  }, [children, gap]);

  const ListComponent = animated ? Reanimated.FlatList : FlatList;

  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(({ item }) => {
    if (item.kind === "sectionTitle") {
      return (
        <View style={[styles.sectionTitleContainer, { marginTop: item.gapBefore }]}>
          {item.main}
          {item.label && (
            <Typography variant="body1" weight="semibold" color="textSecondary">
              {item.label}
            </Typography>
          )}
        </View>
      );
    }

    if (item.kind === "view") {
      return <View style={item.viewProps.style}>{item.main}</View>;
    }

    if (item.kind === "raw") {
      return <RawRuntimeRenderer item={item} animated={animated} colors={colors} />;
    }

    return renderListRow({
      itemProps: item.itemProps,
      leading: item.leading,
      trailing: item.trailing,
      main: item.main,
      isFirst: item.isFirstInSection,
      isLast: item.isLastInSection,
      gapBefore: item.gapBefore,
      listAnimated: animated,
      colors,
    });
  }, [animated, colors]);

  const contentContainerStyle = useMemo(
    () => [rest.contentContainerStyle, styles.listContentContainer],
    [rest.contentContainerStyle],
  );
  const listStyle = useMemo(() => [rest.style, styles.list], [rest.style]);

  return (
    <ListComponent
      itemLayoutAnimation={animated ? Animation(LinearTransition, "list") : undefined}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      {...rest}
      contentContainerStyle={contentContainerStyle}
      style={listStyle}
    />
  );
};

export const ListTouchable = React.memo(({ ...props }) => {
  const parentBlockPress = useContext(ListTouchableContext);
  const blockOwnPressRef = useRef(false);
  const theme = useTheme();
  const hasOnPress = typeof props.onPress === "function";

  const blockOwnPress = useCallback(() => {
    blockOwnPressRef.current = true;
  }, []);

  const handlePress = useCallback((event) => {
    if (blockOwnPressRef.current) {
      blockOwnPressRef.current = false;
      return;
    }
    props.onPress?.(event);
  }, [props]);

  if (!hasOnPress) {
    return (
      <ListTouchableContext.Provider value={parentBlockPress}>
        <View {...props}>{props.children}</View>
      </ListTouchableContext.Provider>
    );
  }

  if (Platform.OS === "android") {
    return (
      <ListTouchableContext.Provider value={blockOwnPress}>
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple(theme.colors.text + "22", true)}
          useForeground
          {...props}
          onPress={(event) => {
            parentBlockPress?.();
            handlePress(event);
          }}
        >
          {props.children}
        </TouchableNativeFeedback>
      </ListTouchableContext.Provider>
    );
  }

  return (
    <ListTouchableContext.Provider value={blockOwnPress}>
      <TouchableOpacity
        activeOpacity={0.5}
        {...props}
        onPress={(event) => {
          parentBlockPress?.();
          handlePress(event);
        }}
      >
        {props.children}
      </TouchableOpacity>
    </ListTouchableContext.Provider>
  );
});

const ListTouchableContext = React.createContext(null);

List.Item = Item;
List.Leading = Leading;
List.Trailing = Trailing;
List.Section = Section;
List.SectionTitle = SectionTitle;
List.Label = Label;
List.View = ViewItem;

const styles = StyleSheet.create({
  rowContainer: {},
  row: { flexDirection: "row", alignItems: "center", paddingVertical: Platform.OS === "android" ? 14 : 12, paddingHorizontal: 16 },
  leading: { marginRight: 16 },
  body: { flex: 1 },
  trailing: { marginLeft: 16 },
  sectionTitleContainer: { paddingHorizontal: Platform.OS === "android" ? 16 : 6, paddingVertical: 6, paddingBottom: Platform.OS === "android" ? 6 : 6 },
  first: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  last: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  listContentContainer: {
    gap: 0,
    overflow: "visible",
  },
  list: {
    overflow: "visible",
  },
});

export default List;
