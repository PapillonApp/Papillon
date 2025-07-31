export type AddonInfo = {
  base_path: string,
  error: boolean,
  error_message: string,
  name: string,
  author: string,
  description: string,
  icon: string,
  version: string,
  placement: AddonPlacement[]
};

export type AddonLogs = {
  type: "log" | "error" | "warn" | "info",
  message: string,
  date: Date
};

//NEW

export interface AddonPermission {
  name:
      "PERM_SCHOOLDATA_NEWS" |
      "PERM_SCHOOLDATA_TIMETABLE" |
      "PERM_SCHOOLDATA_CALENDAR" |
      "PERM_SCHOOLDATA_GRADES" |
      "PERM_SCHOOLDATA_SELF" |
      "PERM_SCHOOLDATA_AUTH" |
      "PERM_STUDENT_INFO" |
      "PERM_EDIT_STUDENT_INFO" |
      "PERM_EDIT_PREFERENCES" |
      "PERM_APP_LOGS" |
      "PERM_APP_PHOTOS" |
      "PERM_APP_CAMERA" |
      "PERM_APP_LOCATION",
  reason: string
}

export interface AddonDomain {
  domain: string,
  reason: string
}

export interface AddonPlacement {
  placement:
    "PLACE_HOME_WIDGET" |
    "PLACE_HOME_PAGE" |
    "PLACE_SETTINGS_PAGE" |
    "PLACE_ADDONS_VIEW" |
    "PLACE_HIDDEN_VIEW",
  name: string,
  main: string,
  icon?: string,
}

export class AddonManifest {
  name: string = "";
  author: string = "";
  description?: string;
  icon?: string;
  version: string = "";
  license?: string;
  minAppVersion: string = "7.0.0";
  development: boolean = false;
  screenshot: Array<string> = [];
  placement: Array<AddonPlacement> = [];
  permissions: Array<AddonPermission> = [];
  domains: Array<AddonDomain> = [];

  error?: string;
}

export interface AddonPlacementManifest {
  manifest: AddonManifest;
  index: number;
}
