import { t } from "i18next";
import { Calendar, Link2Icon, TypeIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput } from "react-native";

import { useAddIcal, useIcals, useRemoveIcal } from "@/database/useIcals";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Item, { Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";
import { useTheme } from "@react-navigation/native";

export default function TabOneScreen() {
  const [icalUrl, setIcalUrl] = useState("");
  const [icalTitle, setIcalTitle] = useState("");
  const [refresh, setRefresh] = useState(0);
  const icals = useIcals(refresh);
  const addIcal = useAddIcal();
  const removeIcal = useRemoveIcal();

  const handleAdd = async () => {
    if (!icalUrl.trim() || !icalTitle.trim()) {
      Alert.alert(t("Tab_Calendar_Icals_Add_Title"), t("Tab_Calendar_Icals_Add_Description"));
      return;
    }
    await addIcal(icalTitle, icalUrl);
    setIcalUrl("");
    setIcalTitle("");
    setRefresh(r => r + 1);
  };

  const handleRemove = async (id: string) => {
    await removeIcal(id);
    setRefresh(r => r + 1);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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
            value={icalUrl}
            onChangeText={setIcalUrl}
            style={{ flex: 1, paddingVertical: 8, fontSize: 16, fontFamily: "medium", color: colors.text }}
          />
          {icalUrl.length > 0 && (
            <Trailing>
              <Button
                inline
                size="small"
                title={t("Context_Add")}
                variant="primary"
                onPress={handleAdd}
                disabled={!isValidUrl(icalUrl)}
              />
            </Trailing>
          )}
        </Item>
      </List>

      <List>
        {icals.map((ical, index) => (
          <Item
            key={ical.id}
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
        ))}
      </List>
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
