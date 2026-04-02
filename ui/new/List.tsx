import { useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { FlatList, Platform, StyleSheet, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import Reanimated, { LinearTransition } from 'react-native-reanimated';

import { Animation } from "../utils/Animation";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import Ripple from "./RippleEffect";
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

const Item: React.FC<ListItemProps> = ({ children }) => children;
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

const List = ({ children, animated = false, gap = 12, ...rest }) => {
  const theme = useTheme();
  const { colors } = theme;

  const data = useMemo(() => {
    const isType = (child, component, name) => {
      return child?.type && (child.type === component || child.type.displayName === name);
    };

    const parseItem = (item, index) => {
        let leading = null;
        let trailing = null;
        const main = [];

        React.Children.forEach(item.props.children, (child) => {
          if (!child) { return; }

          const type = child.type;
          if (type === Leading || type?.displayName === "List.Leading") {
            leading = child.props.children;
          } else if (type === Trailing || type?.displayName === "List.Trailing") {
            trailing = child.props.children;
          } else {
            main.push(child);
          }
        });

        return {
          kind: "item",
          id: item.props.id || `item-${index}`,
          leading,
          trailing,
          main,
          itemProps: item.props,
        };
    };

    const parseSectionTitle = (sectionTitle, index, sectionId = null) => {
      let label = null;
      const main = [];

      React.Children.forEach(sectionTitle.props.children, (child) => {
        if (!child) { return; }

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
        main
      };
    };

    const withSectionFlags = (items, sectionId) => {
      return items.map((item, index) => ({
        ...item,
        sectionId,
        isFirstInSection: index === 0,
        isLastInSection: index === items.length - 1
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
        const sectionTitles = sectionChildren
          .filter((sectionChild) => isType(sectionChild, SectionTitle, "List.SectionTitle"))
          .map((sectionTitle, sectionTitleIndex) => parseSectionTitle(sectionTitle, `${index}-title-${sectionTitleIndex}`, sectionId));
        const sectionItems = withSectionFlags(
          sectionChildren
            .filter((sectionChild) => isType(sectionChild, Item, "List.Item"))
            .map((sectionItem, sectionItemIndex) => parseItem(sectionItem, `${index}-${sectionItemIndex}`)),
          sectionId
        );
        output.push(...sectionTitles, ...sectionItems);
        return;
      }

      if (isType(child, Item, "List.Item")) {
        if (!implicitSectionId) {
          implicitSectionId = `section-implicit-${index}`;
        }
        implicitItems.push(parseItem(child, `${index}-${implicitItems.length}`));
      }
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
  const ItemComponent = animated ? Reanimated.View : View;

  return (
    <ListComponent
      itemLayoutAnimation={animated ? Animation(LinearTransition, "list") : undefined}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        if (item.kind === "sectionTitle") {
          return (
            <View style={[styles.sectionTitleContainer, { marginTop: item.gapBefore }]} key={`${item.id}--sectiontitle`}>
              {item.main}
              {item.label && (
                <Typography variant="body1" weight="semibold" color="textSecondary">
                  {item.label}
                </Typography>
              )}
            </View>
          );
        }

        const isFirst = item.isFirstInSection;
        const isLast = item.isLastInSection;

        return (
          <ItemComponent
            style={[styles.rowContainer, isFirst && styles.first, isLast && styles.last, {
              marginTop: item.gapBefore,
            }, Platform.OS === "android" ? {
              marginBottom: (item.kind === "item" && !isLast) ? 4 : 0
            } : {
              borderColor: colors.border,
              backgroundColor: colors.border,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderTopWidth: isFirst ? 1 : 0,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.10,
              shadowRadius: 2,
              elevation: 1,
              overflow: Platform.OS === "android" ? "hidden" : "visible",
              ...item.itemProps.containerStyle
            }]}
            key={item.itemProps.id + "--containeritem"}
            layout={item.itemProps.animated ? Animation(LinearTransition, "list") : undefined}
            entering={item.itemProps.entering ?? item.itemProps.animated ? PapillonAppearIn : undefined}
            exiting={item.itemProps.exiting ?? item.itemProps.animated ? PapillonAppearOut : undefined}
          >
            <ListTouchable
              onPress={() => {
                item.itemProps.onPress?.();
              }}
            >
              <View style={[styles.row, isFirst && styles.first, isLast && styles.last, {
                backgroundColor: colors.item,
                overflow: "hidden",
                ...item.itemProps.style
              }, Platform.OS === "android" ? {
                borderTopLeftRadius: isFirst ? 20 : 8,
                borderTopRightRadius: isFirst ? 20 : 8,
                borderBottomLeftRadius: isLast ? 20 : 8,
                borderBottomRightRadius: isLast ? 20 : 8,
              } : {
              }
              ]}>
                {item.leading && <View style={styles.leading}>{item.leading}</View>}
                <View style={styles.body}>{item.main}</View>
                {item.trailing && <View style={styles.trailing}>{item.trailing}</View>}
              </View>
            </ListTouchable>
          </ItemComponent>
        )
      }}
      {...rest}
      contentContainerStyle={{
        ...rest.contentContainerStyle,
        gap: 0,
        overflow: "visible"
      }}
      style={{
        ...rest.style,
        overflow: "visible"
      }}
    />
  );
};

const ListTouchable = ({ onPress, ...props }) => {
  const theme = useTheme();

  if(Platform.OS === "android") {
    return (
      <TouchableNativeFeedback useForeground onPress={() => onPress?.()} {...props}>
        {props.children}
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => onPress?.()}
      {...props}
    >
      {props.children}
    </TouchableOpacity>
  );
}

List.Item = Item;
List.Leading = Leading;
List.Trailing = Trailing;
List.Section = Section;
List.SectionTitle = SectionTitle;
List.Label = Label;

const styles = StyleSheet.create({
  rowContainer: {},
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  leading: { marginRight: 16 },
  body: { flex: 1 },
  trailing: { marginLeft: 16 },
  sectionTitleContainer: { paddingHorizontal: 16, paddingVertical: 6 },
  first: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  last: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  }
});

export default List;
