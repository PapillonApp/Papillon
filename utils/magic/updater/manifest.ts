import { fetchJsonWithRetry } from "./network";
import { cmp, satisfiesAll } from "./semver";
import { ApiModel } from "./types";

export async function fetchManifest(
  url: string,
  appVersion: string
): Promise<ApiModel> {
  const data = await fetchJsonWithRetry<{ models: ApiModel[] }>(url);

  if (!Array.isArray(data.models)) {
    throw new Error("Le manifest doit contenir un tableau 'models'.");
  }

  const compatible = data.models.filter(m =>
    satisfiesAll(appVersion, m.compatible_versions)
  );

  if (compatible.length === 0) {
    throw new Error(
      `Aucun modèle compatible trouvé pour appVersion ${appVersion}`
    );
  }

  let mostRecent = compatible[0];
  
  for (let i = 1; i < compatible.length; i++) {
    const current = compatible[i];
    
    const isMoreRecent = compareModels(current, mostRecent);
    if (isMoreRecent > 0) {
      mostRecent = current;
    }
  }

  return mostRecent;
}

function compareModels(a: ApiModel, b: ApiModel): number {
  if (a.date_created && b.date_created) {
    const dateA = new Date(a.date_created);
    const dateB = new Date(b.date_created);
    const dateDiff = dateA.getTime() - dateB.getTime(); 
    if (dateDiff !== 0) {
      return dateDiff;
    }
  }
  else if (a.date_created && !b.date_created) {
    return 1;
  }
  else if (!a.date_created && b.date_created) {
    return -1;
  }
  
  return cmp(a.version, b.version);
}

export function validateManifest(m: ApiModel): void {
  if (!m.name || !m.version || !m.download_url || !m.sha256) {
    throw new Error(
      "Manifest incomplet (name, version, download_url, sha256 requis)."
    );
  }
  if (!Array.isArray(m.compatible_versions)) {
    throw new Error("compatible_versions doit être un tableau.");
  }
  if (!/^[0-9a-f]{64}$/i.test(m.sha256)) {
    throw new Error("sha256 invalide (doit être 64 hex).");
  }
}
