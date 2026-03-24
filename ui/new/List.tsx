import { useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";


// 1. Define markers outside the main component
// 2. Add a static property for stable identification
const Item = ({ children }) => children;
Item.displayName = "List.Item";

const Leading = ({ children }) => children;
Leading.displayName = "List.Leading";

const Trailing = ({ children }) => children;
Trailing.displayName = "List.Trailing";

const List = ({ children, ...rest }) => {
  const theme = useTheme();
  const { colors } = theme;

  const data = useMemo(() => {
    return React.Children.toArray(children)
      .filter((child) => {
        // Use displayName or a custom property for comparison
        // This is much more stable during hot reloads than reference equality
        return child.type && (child.type === Item || child.type.displayName === "List.Item");
      })
      .map((item, index) => {
        let leading = null;
        let trailing = null;
        const main = [];

        React.Children.forEach(item.props.children, (child) => {
          if (!child) { return; }

          // Check against the stable displayName
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
          id: item.props.id || `item-${index}`,
          leading,
          trailing,
          main,
          itemProps: item.props,
        };
      });
  }, [children]);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const isFirst = index === 0;
        const isLast = index === data.length - 1;

        return (
          <View
            style={[styles.rowContainer, isFirst && styles.first, isLast && styles.last, {
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
              elevation: 5,
              ...item.itemProps.containerStyle
            }]}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                item.itemProps.onPress?.();
              }}
            >
              <View style={[styles.row, isFirst && styles.first, isLast && styles.last, {
                backgroundColor: colors.card,
                overflow: "hidden",
                ...item.itemProps.style
              }]}>
                {item.leading && <View style={styles.leading}>{item.leading}</View>}
                <View style={styles.body}>{item.main}</View>
                {item.trailing && <View style={styles.trailing}>{item.trailing}</View>}
              </View>
            </TouchableOpacity>
          </View>
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

List.Item = Item;
List.Leading = Leading;
List.Trailing = Trailing;

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  leading: { marginRight: 16 },
  body: { flex: 1 },
  trailing: { marginLeft: 16 },
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