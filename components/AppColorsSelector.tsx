import Typography from "@/ui/components/Typography";
import { FlatList, View } from "react-native";
import React, { useState } from "react";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useAccountStore } from "@/stores/account";

export enum Colors {
  PINK,
  YELLOW,
  GREEN,
  PURPLE,
  BLUE,
  BLACK
}

export const AppColors = [
  { mainColor: "#DD007D", backgroundColor: "#FAD9EC", name: "Rose", colorEnum: Colors.PINK },
  { mainColor: "#E8B048", backgroundColor: "#FCF3E4", name: "Jaune", colorEnum: Colors.YELLOW },
  { mainColor: "#26B290", backgroundColor: "#DEF3EE", name: "Vert", colorEnum: Colors.GREEN },
  { mainColor: "#C400DD", backgroundColor: "#F6D9FA", name: "Violet", colorEnum: Colors.PURPLE },
  { mainColor: "#48B7E8", backgroundColor: "#E4F4FC", name: "Bleu", colorEnum: Colors.BLUE },
  { mainColor: "#6D6D6D", backgroundColor: "#E9E9E9", name: "Noir", colorEnum: Colors.BLACK },
]

function ColorSelector({ mainColor, backgroundColor, name, onPress, selected }: { mainColor: string, backgroundColor: string, name: string, onPress?: () => void, selected: boolean }) {
  return (
    <AnimatedPressable
      onPress={() => {
        if (onPress) {
          onPress()
        }
      }}
      style={{
        flex: 1,
        margin: 4,
        marginVertical: selected ? 0 : 4,
        alignItems: "center",
        backgroundColor: backgroundColor,
        borderColor: selected ? mainColor : "#00000026",
        borderWidth: selected ? 4 : 2,
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: selected ? 20 : 26,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.07,
        shadowRadius: 5
    }}
    >
      <View style={{
        width: 44,
        height: 44,
        backgroundColor: mainColor,
        borderRadius: 100,
        borderWidth: 4,
        borderColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.615
      }} />
      <Typography variant="h6" color={mainColor}>{name}</Typography>
    </AnimatedPressable>
  )
}

const AppColorsSelector = (
  { onChangeColor, accountId } :{onChangeColor?: (color: string) => void, accountId?: string}
) => {
  const [selectedColor, setSelectedColor] = useState<string>("#DD007D")
  const [color, setColor] = useState<Colors>(Colors.PINK)

  return (
    <FlatList
      scrollEnabled={false}
      data={AppColors}
      numColumns={3}
      renderItem={({ item }) => (
        <ColorSelector
          selected={selectedColor === item.mainColor}
          mainColor={item.mainColor}
          backgroundColor={item.backgroundColor}
          name={item.name}
          onPress={() => {
            setSelectedColor(item.mainColor)
            setColor(item.colorEnum)
            if (onChangeColor) {
              useAccountStore.getState().setAccountSelectedColor(accountId, color)
              onChangeColor(item.mainColor)
            }
          }}
        />
      )}
      ListFooterComponent={<Typography style={{ paddingTop: 10, flex: 1 }} color="#7F7F7F" variant="caption">La couleur que tu choisis ici s’appliquera sur la page d’accueil de Papillon.</Typography>}
      ListFooterComponentStyle={{ flex: 1 }}
      keyExtractor={item => item.name}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ justifyContent: "space-between" }}
      style={{ maxHeight: 270 }}
    />
  )
};

export default AppColorsSelector;