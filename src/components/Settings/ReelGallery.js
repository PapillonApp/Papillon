var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useCallback, useState } from "react";
import { ScrollView, View, TouchableOpacity, StyleSheet, Image, Text, Dimensions, } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useGradesStore } from "@/stores/grades";
import GradeModal from "../Grades/GradeModal";
// Components
var GradeIndicator = function (_a) {
    var value = _a.value, outOf = _a.outOf, color = _a.color;
    return (<View style={{ flexDirection: "row", alignItems: "flex-end" }}>
    <Text style={[styles.scoreText, { color: color }]}>{value}</Text>
    <Text style={[styles.maxScoreText, { color: color + "50" }]}>/{outOf}</Text>
  </View>);
};
var SubjectBadge = function (_a) {
    var emoji = _a.emoji, color = _a.color;
    return (<View style={[styles.subjectBadge, { backgroundColor: color + "80" }]}>
    <Text style={styles.emojiText}>{emoji}</Text>
  </View>);
};
var ReelThumbnail = function (_a) {
    var reel = _a.reel, onPress = _a.onPress, width = _a.width;
    var colors = useTheme().colors;
    // Vérification de sécurité pour l'image
    var imageSource = reel.imagewithouteffect
        ? { uri: "data:image/jpeg;base64,".concat(reel.imagewithouteffect) }
        : null; // Tu peux aussi mettre une image par défaut ici
    if (!imageSource) {
        return (<View style={[styles.item, {
                    backgroundColor: colors.card,
                    width: width,
                    height: width * 1.5,
                    margin: 4,
                    justifyContent: "center",
                    alignItems: "center"
                }]}>
        <Text style={{ color: colors.text }}>Image non disponible</Text>
      </View>);
    }
    return (<TouchableOpacity style={[
            styles.item,
            {
                backgroundColor: colors.card,
                width: width,
                height: width * 1.5,
                margin: 4,
            }
        ]} onPress={onPress}>
      <Image source={imageSource} style={styles.thumbnail} resizeMode="cover" defaultSource={require("@/../assets/images/service_unknown.png")} // Ajoutez une image par défaut
    />
      <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
        <SubjectBadge emoji={reel.subjectdata.emoji} color={reel.subjectdata.color}/>
        <GradeIndicator value={reel.grade.value} outOf={Number(reel.grade.outOf)} color={colors.text}/>
      </View>
    </TouchableOpacity>);
};
// Sécurisation du composant principal
var ReelGallery = function (_a) {
    var reels = _a.reels;
    var _b = useState(null), selectedReel = _b[0], setSelectedReel = _b[1];
    var windowWidth = Dimensions.get("window").width;
    var padding = 40;
    var gap = 8;
    var numColumns = 2;
    // Vérification des reels valides
    var validReels = reels.filter(function (reel) {
        return reel &&
            typeof reel.id === "string" &&
            reel.grade &&
            reel.subjectdata;
    });
    var itemWidth = (Math.min(500, windowWidth) - (padding * 2) - (gap * (numColumns - 1))) / numColumns;
    var deleteReel = useCallback(function (reelId) {
        useGradesStore.setState(function (store) {
            var updatedReels = __assign({}, store.reels);
            delete updatedReels[reelId];
            return { reels: updatedReels };
        });
        setSelectedReel(null);
    }, []);
    return (<ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={[styles.galleryContent, { gap: gap }]}>
          {validReels.map(function (reel) { return (<ReelThumbnail key={reel.id} reel={reel} width={itemWidth} onPress={function () { return setSelectedReel(reel); }}/>); })}
        </View>
      </View>

      {selectedReel && (<GradeModal isVisible={!!selectedReel} reel={selectedReel} onClose={function () { return setSelectedReel(null); }} DeleteGrade={function () { return selectedReel.id && deleteReel(selectedReel.id); }}/>)}
    </ScrollView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    galleryContent: {
        width: "100%",
        maxWidth: 500,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignContent: "flex-start",
    },
    item: {
        borderRadius: 12,
        overflow: "hidden",
    },
    thumbnail: {
        width: "100%",
        height: "100%",
        transform: [{ scaleX: -1 }],
    },
    infoContainer: {
        position: "absolute",
        bottom: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        gap: 3,
        maxWidth: "85%",
    },
    subjectBadge: {
        borderRadius: 100,
        padding: 5,
    },
    emojiText: {
        fontSize: 20,
    },
    scoreText: {
        fontWeight: "700",
        fontSize: 18,
    },
    maxScoreText: {
        fontWeight: "300",
    },
});
export default ReelGallery;
