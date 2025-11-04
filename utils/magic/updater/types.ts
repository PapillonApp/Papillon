export type CurrentPtr = { name: string; version: string; dir: string };

export type ApiModel = {
  name: string;
  version: string;
  download_url: string;
  sha256: string;
  size_bytes?: number;
  compatible_versions: string[];
  date_created?: string;
};

export type ApiResponse = { model: ApiModel };
