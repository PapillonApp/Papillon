import { ViewProps } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { Animation } from "../utils/Animation";
import { useTheme } from "@react-navigation/native";
import React, { useMemo, useCallback } from "react";
import Item from "./Item";

interface ListProps extends ViewProps {
  children?: React.ReactNode;
  disablePadding?: boolean;
  contentContainerStyle?: ViewProps['style'];
}

// Configuration d'animation mémoïsée pour éviter les re-créations
const LAYOUT_ANIMATION = Animation(LinearTransition);

// Styles constants pour optimiser les performances
const BASE_CONTAINER_STYLE = {
  flex: 1,
  width: '100%' as const, // Prend toute la largeur disponible
  marginBottom: 12,
  borderRadius: 20,
  borderCurve: "continuous" as const,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.16,
  shadowRadius: 1.5,
  elevation: 2,
};

const BASE_ITEM_STYLE = {
  flex: 1,
  width: '100%' as const, // Les éléments enfants prennent aussi toute la largeur
};

const DEFAULT_PADDING = {
  paddingHorizontal: 16,
  paddingVertical: 12,
};

// Fonction utilitaire mémoïsée pour vérifier si un style a du padding
const hasPaddingStyle = (style: any): boolean => {
  if (!style || typeof style !== 'object') return false;
  if (Array.isArray(style)) {
    return style.some(s => hasPaddingStyle(s));
  }
  return !!(style.padding || style.paddingHorizontal || style.paddingVertical);
};

// Fonction optimisée pour vérifier si c'est un composant Item
const isItemComponent = (element: React.ReactElement): boolean => {
  // Vérification basée sur le displayName pour une meilleure compatibilité
  const elementType = element.type as any;
  return elementType?.displayName === 'Item' || elementType === Item;
};

const List: React.FC<ListProps> = React.memo(({ 
  children, 
  disablePadding = false, 
  style, 
  contentContainerStyle, 
  ...rest 
}) => {
  const { colors } = useTheme();

  // Mémoïsation du style du conteneur principal
  const containerStyle = useMemo(() => {
    const baseStyle = {
      ...BASE_CONTAINER_STYLE,
      backgroundColor: colors.card,
    };
    return style ? [baseStyle, style] : baseStyle;
  }, [colors.card, style]);

  // Mémoïsation des enfants et de leurs métadonnées
  const childrenData = useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    const count = childrenArray.length;
    
    return childrenArray.map((child, index) => {
      if (!React.isValidElement(child)) {
        return {
          child,
          isValidElement: false,
          needsPadding: false,
          borderBottomWidth: 0,
          key: index,
        };
      }

      const childProps = child.props as any;
      const hasDisabledPadding = childProps?.disableListPadding;
      const isItem = isItemComponent(child);
      const hasStylePadding = hasPaddingStyle(childProps?.style);
      
      const needsPadding = !disablePadding && 
                          !hasDisabledPadding && 
                          !isItem && 
                          !hasStylePadding;

      return {
        child,
        isValidElement: true,
        needsPadding,
        borderBottomWidth: index < count - 1 ? 0.5 : 0,
        key: child.key ?? index,
      };
    });
  }, [children, disablePadding]);

  // Mémoïsation de la couleur de bordure
  const borderBottomColor = useMemo(() => colors.text + "25", [colors.text]);

  // Fonction de rendu optimisée pour chaque élément enfant
  const renderChild = useCallback((childData: any) => {
    if (!childData.isValidElement) {
      return childData.child;
    }

    const itemStyle = [
      BASE_ITEM_STYLE,
      {
        borderBottomColor,
        borderBottomWidth: childData.borderBottomWidth,
      },
      childData.needsPadding && DEFAULT_PADDING,
      contentContainerStyle,
    ];

    return (
      <Reanimated.View
        key={childData.key}
        layout={LAYOUT_ANIMATION}
        style={itemStyle}
      >
        {childData.child}
      </Reanimated.View>
    );
  }, [borderBottomColor, contentContainerStyle]);

  return (
    <Reanimated.View
      layout={LAYOUT_ANIMATION}
      style={containerStyle}
      {...rest}
    >
      {childrenData.map(renderChild)}
    </Reanimated.View>
  );
});

List.displayName = 'List';

export default List;