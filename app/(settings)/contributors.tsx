import { Papicons } from "@getpapillon/papicons";
import React, { useEffect, useMemo, useState } from "react";
import { Linking } from "react-native";

import ActivityIndicator from "@/ui/components/ActivityIndicator";
import Avatar from "@/ui/components/Avatar";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { getInitials } from "@/utils/chats/initials";
import { Contributor, getContributors } from "@/utils/github/contributors";

const TEAM_LOGINS = [
  "ecnivtwelve",
  "tryon-dev",
  "raphckrman",
  "tom-things",
  "godetremy",
  "ryzenixx",
];

export default function SettingsContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getContributors()
      .then(allContributors => {
        setContributors(
          allContributors.filter(
            contributor => !TEAM_LOGINS.includes(contributor.login)
          )
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const contributorItems = useMemo(
    () =>
      contributors.map(item => (
        <List.Item
          key={item.login}
          id={item.login}
          onPress={() => Linking.openURL(item.html_url)}
        >
          <List.Leading>
            <Avatar
              size={40}
              shape="square"
              initials={getInitials(item.login)}
              imageUrl={item.avatar_url}
            />
          </List.Leading>
          <Typography variant="title">{item.login}</Typography>
          <Typography variant="body2" color="textSecondary">
            {item.contributions}{" "}
            {item.contributions > 1 ? "contributions" : "contribution"}
          </Typography>
          <List.Trailing>
            <Icon>
              <Papicons name="ChevronRight" />
            </Icon>
          </List.Trailing>
        </List.Item>
      )),
    [contributors]
  );

  return (
    <List
      contentInsetAdjustmentBehavior="always"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      style={{ flex: 1 }}
    >
      {isLoading && (
        <List.View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 24,
            gap: 10,
          }}
        >
          <ActivityIndicator size={42} />
          <Typography variant="caption" color="textSecondary" align="center">
            Chargement des contributeurs...
          </Typography>
        </List.View>
      )}
      {!isLoading && contributorItems}
    </List>
  );
}
