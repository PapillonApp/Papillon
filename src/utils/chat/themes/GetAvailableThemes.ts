import { ThemesMeta } from "@/utils/chat/themes/Themes.types";

async function GetAvailableThemes (): Promise<ThemesMeta[]> {
  let f = await fetch("https://raw.githubusercontent.com/PapillonApp/datasets/refs/heads/main/themes/themes.json");
  let r = await f.json();
  return r.map((theme: ThemesMeta) => {
    return {
      name: theme.name,
      author: theme.author,
      path: theme.path,
      icon: { uri: "https://raw.githubusercontent.com/PapillonApp/datasets/refs/heads/main/themes/" + theme.path + "/" + theme.icon },
      darkIcon: theme.darkIcon
    };
  });
}

export default GetAvailableThemes;
