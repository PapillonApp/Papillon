export interface ThemesMeta {
  name: string;
  author: string;
  icon: { uri: string };
  darkIcon: { uri: string };
  path: string;
}

export interface ThemeExclusiveMeta {
  isExclusive: boolean;
  etab_id?: string;
}

export interface ThemeModifier {
  headerBackgroundColor: string;
  headerTextColor: string;

  chatBackgroundColor: string;
  chatBackgroundImage?: string;

  sentMessageBackgroundColor: string;
  sentMessageTextColor: string;
  sentMessageBorderColor: string;
  sentMessageBorderSize: number;
  sentMessageborderRadiusDefault: number;
  sentMessageBorderRadiusLinked: number;

  receivedMessageBackgroundColor: string;
  receivedMessageTextColor: string;
  receivedMessageBorderColor: string;
  receivedMessageBorderSize: number;
  receivedMessageborderRadiusDefault: number;
  receivedMessageBorderRadiusLinked: number;

  inputBarBackgroundColor: string;
  sendButtonBackgroundColor: string;
}

export interface Theme {
  meta: ThemesMeta;
  lightModifier: ThemeModifier;
  darkModifier: ThemeModifier;
  exclusiveMeta: ThemeExclusiveMeta;
}
