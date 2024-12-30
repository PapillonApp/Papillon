import {ThemesMeta} from "@/utils/chat/themes/Themes.types";

async function GetAvailableThemes (): Promise<ThemesMeta[]> {
  let f = await fetch("https://raw.githubusercontent.com/PapillonApp/datasets/themes/refs/heads/main/themes.json");
  let r = await f.json();
  return r.map((theme: ThemesMeta) => {
    return {
      name: theme.name,
      author: theme.author,
      path: theme.path,
      icon: { uri: "https://raw.githubusercontent.com/PapillonApp/datasets/themes/refs/heads/main/" + theme.path + "/" + theme.icon },
      darkIcon: theme.darkIcon
    };
  });
}

export default GetAvailableThemes;