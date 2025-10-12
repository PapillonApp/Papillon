import { t } from "i18next";
import { Calendar, Link2Icon, TypeIcon, Brain } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, Switch } from "react-native";

import { useAddIcal, useIcals, useRemoveIcal, useUpdateIcalParsing } from "@/database/useIcals";
import { isValidUrl, normalizeUrl } from "@/services/local/ical-utils";
import { fetchAndParseICal } from "@/services/local/ical";
import { enhanceADEUrl } from "@/services/local/parsers/ade-parser";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Item, { Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";
import { useTheme } from "@react-navigation/native";
import { Papicons } from "@getpapillon/papicons";
import AnimatedPressable from "@/ui/components/AnimatedPressable";

export default function TabOneScreen() {
  const [icalUrl, setIcalUrl] = useState("");
  const [icalTitle, setIcalTitle] = useState("");
  const [intelligentParsing, setIntelligentParsing] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const icals = useIcals(refresh);
  const addIcal = useAddIcal();
  const removeIcal = useRemoveIcal();
  const updateIcalParsing = useUpdateIcalParsing();

  const handleAdd = async () => {
    if (!icalUrl.trim() || !icalTitle.trim()) {
      Alert.alert(t("Tab_Calendar_Icals_Add_Title"), t("Tab_Calendar_Icals_Add_Description"));
      return;
    }

    const normalizedUrl = normalizeUrl(icalUrl);

    try {
      const parsedData = await fetchAndParseICal(normalizedUrl);
      const shouldEnableParsing = (parsedData.isADE || parsedData.isHyperplanning) ? true : intelligentParsing;

      const finalUrl = parsedData.isADE ? enhanceADEUrl(normalizedUrl) : normalizedUrl;

      await addIcal(icalTitle, finalUrl, shouldEnableParsing, parsedData.provider);
      setIcalUrl("");
      setIcalTitle("");
      setIntelligentParsing(false);
      setRefresh(r => r + 1);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de traiter l'URL iCal. Vérifiez qu'elle est valide.");
    }
  };

  const handleRemove = async (id: string) => {
    await removeIcal(id);
    setRefresh(r => r + 1);
  };


  const theme = useTheme();
  const { colors } = theme;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <List>
        {icalUrl.length > 0 &&
          <Item>
            <Icon>
              <TypeIcon opacity={icalTitle.length > 0 ? 1 : 0.5} />
            </Icon>
            <TextInput
              placeholder={t("Form_Title")}
              placeholderTextColor={colors.text + '80'}
              value={icalTitle}
              onChangeText={setIcalTitle}
              style={{ flex: 1, paddingVertical: 8, fontSize: 16, fontFamily: "medium", color: colors.text }}
            />
          </Item>
        }
        <Item>
          <Icon>
            <Link2Icon opacity={icalUrl.length > 0 ? 1 : 0.5} />
          </Icon>
          <TextInput
            placeholder={t("Tab_Calendar_Icals_Add_URL")}
            placeholderTextColor={colors.text + '80'}
            value={icalUrl}
            onChangeText={setIcalUrl}
            style={{ flex: 1, paddingVertical: 8, fontSize: 16, fontFamily: "medium", color: colors.text }}
          />
          {icalUrl.length > 0 && (
            <Trailing>
              <AnimatedPressable>
                <Papicons name={'Add'} onPress={handleAdd} size={24} color={'#D6502B'} disabled={!isValidUrl(icalUrl)} />
              </AnimatedPressable>
            </Trailing>
          )}
        </Item>
      </List>

      {icals.length > 0 && (
        <List>
          {icals.flatMap((ical, index) => {
            const isADE = (ical as any).provider?.toUpperCase().includes('ADE');
            const isHyperplanning = (ical as any).provider?.toUpperCase().includes('HYPERPLANNING');
            const supportsIntelligentParsing = isADE || isHyperplanning;
            const items = [
              <Item
                key={`${ical.id}-main`}
                onPress={() => {
                  Alert.alert(
                    t('Tab_Calendar_Icals_Manage_Title', { title: ical.title }),
                    t('Tab_Calendar_Icals_Manage_Description'),
                    [
                      {
                        text: t('Context_Cancel'),
                        style: 'cancel',
                      },
                      {
                        text: t('Context_Delete'),
                        style: 'destructive',
                        onPress: () => handleRemove(ical.id)
                      }
                    ]
                  );
                }}
              >
                <Icon>
                  <Calendar />
                </Icon>
                <Typography variant="title">{ical.title}</Typography>
                <Typography variant="caption" color="secondary">{ical.url}</Typography>
              </Item>
            ];

            // only ADE and Hyperplanning calendars support intelligent parsing
            if (supportsIntelligentParsing) {
              items.push(
                <Item key={`${ical.id}-parsing`}>
                  <Icon>
                    <Brain opacity={(ical as any).intelligentParsing ? 1 : 0.5} />
                  </Icon>
                  <Typography variant="title">Parsing intelligent (Beta)</Typography>
                  <Trailing>
                    <Switch
                      value={(ical as any).intelligentParsing || false}
                      onValueChange={async (value) => {
                        await updateIcalParsing(ical.id, value);
                        setRefresh(r => r + 1);
                      }}
                    />
                  </Trailing>
                </Item>
              );
            }

            return items;
          })}
        </List>
      )}

      {icals.length === 0 && (
        <Typography variant="body1" style={{ marginTop: 32 }} color="secondary">
          {t("Tab_Calendar_Icals_Empty")}
        </Typography>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  containerContent: {
    justifyContent: "center",
    alignItems: "center",
  }
});
