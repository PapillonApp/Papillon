import * as FileSystem from "expo-file-system";
import { error, log } from "@/utils/logger/logger";
import { AddonDomain, AddonManifest, AddonPermission, AddonPlacement, AddonPlacementManifest } from "@/addons/types";

async function init_addons_folder () {
  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons")).exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "addons");
    log("Addons folder initialized at " + FileSystem.documentDirectory + "addons", String((new Error()).stack!));
  }
}

function generate_addons_error (error: string, name: string): AddonManifest {
  return {
    error: error,
    author: "",
    development: false,
    domains: [],
    minAppVersion: "7.0.0",
    permissions: [],
    placement: [],
    screenshot: [],
    version: "",
    name: name
  };
}

async function get_addons_list (): Promise<AddonManifest[]> {
  init_addons_folder();

  log("Reading addons folder", String((new Error()).stack!));
  let res: AddonManifest[] = [];
  let addons = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + "addons");
  log(`Found ${addons.length} folder to check...`, String((new Error()).stack!));
  for (let addon of addons) {
    log(`| Starting check for folder ${addon}...`, String((new Error()).stack!));
    // Check if the addon is a directory
    let stat = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons/" + addon);
    if (!stat.isDirectory) {
      error("|   Not a directory ! Skipping...", String((new Error()).stack!));
      continue;
    }

    // Check if the addon has a manifest
    log("|   Searching for manifest.json...", String((new Error()).stack!));
    let info = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons/" + addon + "/manifest.json");
    if (!info.exists) {
      log("|   manifest.json not found ! Skipping...", String((new Error()).stack!));
      continue;
    }


    // Read the manifest
    log("|   Reading manifest.json...", String((new Error()).stack!));
    let file = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + "addons/" + addon + "/manifest.json");
    try {
      log("|   Parsing manifest.json...", String((new Error()).stack!));
      let manifest: Partial<AddonManifest> = JSON.parse(file);

      // Check if the manifest has all the required fields
      log("|   Loading addons...", String((new Error()).stack!));
      if (!manifest.name && typeof manifest.name !== "string") {
        error(`|   Missing properties "name" in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Missing properties \"name\"", addon));
        continue;
      }
      if (!manifest.author && typeof manifest.author !== "string") {
        error(`|   Missing properties "author" in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Missing properties \"author\"", addon));
        continue;
      }
      if (!manifest.version && typeof manifest.version !== "string") {
        error(`|   Missing properties "version" in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Missing properties \"version\"", addon));
        continue;
      }
      if (!manifest.placement && !Array.isArray(manifest.placement)) {
        error(`|   Missing properties "placement" in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Missing properties \"placement\"", addon));
        continue;
      }
      if (manifest.placement.length === 0) {
        error(`|   Empty placement in ${addon} ! You must have 1 placement ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Empty placement", addon));
        continue;
      }
      if (!manifest.placement.every((p: AddonPlacement) => typeof p.placement === "string" && typeof p.main === "string")) {
        error(`|   Invalid placement in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid placement", addon));
        continue;
      }
      if (!manifest.permissions && !Array.isArray(manifest.permissions)) {
        error(`|   Missing properties "permissions" in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Missing properties \"permissions\"", addon));
        continue;
      }
      if (!manifest.domains && !Array.isArray(manifest.domains)) {
        error(`|   Missing properties "domains" in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Missing properties \"domains\"", addon));
        continue;
      }

      // if icon is defined, check if it's a string and if it exists
      if (manifest.icon && typeof manifest.icon !== "string") {
        error(`|   Invalid icon in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid icon", addon));
        continue;
      }
      if (manifest.icon) {
        let icon = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons/" + addon + "/" + manifest.icon);
        if (!icon.exists) {
          error(`|   Icon not found for ${addon} ! Are you sure there is a file at ${addon + "/" + manifest.icon } ! Plugin can't load, skipping...`, String((new Error()).stack!));
          res.push(generate_addons_error("Icon not found", addon));
          continue;
        }
      }
      manifest.icon = FileSystem.documentDirectory + "addons/" + addon + "/" + manifest.icon;

      // check if screenshot is an array of strings and if they exists
      if (manifest.screenshot && !Array.isArray(manifest.screenshot)) {
        error(`|   Invalid screenshot in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid screenshot", addon));
        continue;
      }
      if (manifest.screenshot) {
        for (let i = 0; i < manifest.screenshot.length; i++) {
          if (typeof manifest.screenshot[i] !== "string") {
            error(`|   Invalid screenshot in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
            res.push(generate_addons_error("Invalid screenshot", addon));
            continue;
          }
          let screen = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "addons/" + addon + "/" + manifest.screenshot[i]);
          if (!screen.exists) {
            error(`|   Screenshot not found for ${addon} ! Are you sure there is a file at ${addon + "/" + manifest.screenshot[i] } ! Plugin can't load, skipping...`, String((new Error()).stack!));
            res.push(generate_addons_error("Screenshot not found", addon));
            continue;
          }
          manifest.screenshot[i] = FileSystem.documentDirectory + "addons/" + addon + "/" + manifest.screenshot[i];
        }
      }

      // check if development is a boolean
      if (manifest.development && typeof manifest.development !== "boolean") {
        error(`|   Invalid development in ${addon} ! Must be true or false ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid development", addon));
        continue;
      }
      // check if minAppVersion is a string
      if (manifest.minAppVersion && typeof manifest.minAppVersion !== "string") {
        error(`|   Invalid minAppVersion in ${addon} ! Must be a string ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid minAppVersion", addon));
        continue;
      }
      // check if license is a string
      if (manifest.license && typeof manifest.license !== "string") {
        error(`|   Invalid license in ${addon} ! Must be a string ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid license", addon));
        continue;
      }
      // check if description is a string
      if (manifest.description && typeof manifest.description !== "string") {
        error(`|   Invalid description in ${addon} ! Must be a string ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid description", addon));
        continue;
      }

      // check if placement is an array of AddonPlacement
      if (!manifest.placement.every((p: AddonPlacement) => typeof p.placement === "string" && typeof p.main === "string")) {
        error(`|   Invalid placement in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid placement", addon));
        continue;
      }

      manifest.placement.forEach(placement => {
        placement.main = FileSystem.documentDirectory + "addons/" + addon + "/" + placement.main;
      });

      // check if permissions is an array of AddonPermission
      if (!manifest.permissions.every((p: AddonPermission) => typeof p.name === "string" && typeof p.reason === "string")) {
        error(`|   Invalid permissions in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid permissions", addon));
        continue;
      }

      // check if domains is an array of AddonDomain
      if (!manifest.domains.every((d: AddonDomain) => typeof d.domain === "string" && typeof d.reason === "string")) {
        error(`|   Invalid domains in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
        res.push(generate_addons_error("Invalid domains", addon));
        continue;
      }

      // add the addon to the list
      log(`|   ${addon} is a valid addon !`, String((new Error()).stack!));
      res.push(manifest as AddonManifest);
    } catch (e) {
      error(`|   Invalid JSON in ${addon} ! Plugin can't load, skipping...`, String((new Error()).stack!));
      res.push(generate_addons_error("Invalid JSON", addon));
    }
  }
  res.sort((a, b) => a.name.localeCompare(b.name));
  return res;
}

async function get_home_widgets (): Promise<AddonManifest[]> {
  let addons = await get_addons_list();
  return addons.filter((addon) => addon.placement.some((p) => p.placement === "PLACE_HOME_WIDGET"));
}

async function get_settings_widgets (): Promise<AddonPlacementManifest[]> {
  let addons = await get_addons_list();
  let res: Array<AddonPlacementManifest> = [];
  addons.forEach((addon) => {
    for (let i = 0; i < addon.placement.length; i++) {
      if (addon.placement[i].placement == "PLACE_SETTINGS_PAGE")
        res.push({
          index: i,
          manifest: addon
        });
    }
  });
  return res;
}

export { init_addons_folder, get_addons_list, get_home_widgets, get_settings_widgets };
