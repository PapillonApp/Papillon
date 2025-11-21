import { OctokitResponse } from "@octokit/types";

export interface labelResponse {
  errors: Set<string>
  labels: string[]
}

export interface sizeResponse {
  errors: Set<string>
  warnings: string[]
  files: OctokitResponse<{
    sha: string;
    filename: string;
    status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string;
    previous_filename?: string;
  }[], 200>,
  dependencies?: Record<string, string>
}

export interface descriptionSize {
  errors: Set<string>
}