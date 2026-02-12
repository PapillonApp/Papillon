import { Papicons } from "@getpapillon/papicons";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Linking } from "react-native";

import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";
import { Contributor, getContributors } from "@/utils/github/contributors";

import { Team } from "./about";

export default function SettingsContributors() {
  const { t } = useTranslation();

  const [contributors, setContributors] = useState<Contributor[]>([]);

  const fetchContributors = async () => {
    try {
      const fetchedContributors = (await getContributors()).filter(
        (contrib) => !Team.map((item) => item.login).includes(contrib.login)
      );
      setContributors(fetchedContributors);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchContributors();
  }, []);

  return (
    <FlatList
      data={contributors}
      renderItem={({ item }) => (
        <List disablePadding>
          <Item
            onPress={() => Linking.openURL(item.html_url)}
          >
            <Leading>
              <Image
                source={{ uri: item.avatar_url }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            </Leading>

            <Typography variant="title">{item.login}</Typography>

            <Typography variant="body1" color="secondary">
              {item.contributions} {t("Settings_Contributors_Contributions")}
            </Typography>

            <Trailing>
              <Icon>
                <Papicons name="ChevronRight" />
              </Icon>
            </Trailing>
          </Item>
        </List>
      )}
      contentContainerStyle={{ padding: 16, gap: 0 }}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}
