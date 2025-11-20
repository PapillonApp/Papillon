import { CAS_CONFIG } from "../config";
import { getPhpSessionId, makeRequest, resetCookies } from "../httpClient";

export async function authLannion(
  username: string,
  password: string
): Promise<any> {
  resetCookies();

  const serviceParam = encodeURIComponent(CAS_CONFIG.SERVICE_URL);
  const loginUrl = `${CAS_CONFIG.CAS_LOGIN_URL}?service=${serviceParam}`;
  const respGet = await makeRequest(loginUrl);

  const execution = respGet.body.match(
    /name="execution"\s+value="([^"]+)"/
  )?.[1];
  if (!execution) {
    throw new Error("CAS Error: Token d'exécution manquant.");
  }

  const formData =
    `username=${encodeURIComponent(username)}` +
    `&password=${encodeURIComponent(password)}` +
    `&execution=${encodeURIComponent(execution)}` +
    `&_eventId=submit&geolocation=`;

  const respPost = await makeRequest(loginUrl, {
    method: "POST",
    body: formData,
  });

  let ticketUrl = respPost.location;
  if (!ticketUrl || !ticketUrl.includes("ticket=")) {
    throw new Error(
      "CAS Error: Login échoué ou ticket manquant. Vérifiez vos identifiants."
    );
  }
  if (ticketUrl.startsWith("/")) {
    ticketUrl = `https://notes9.iutlan.univ-rennes1.fr${ticketUrl}`;
  }

  await makeRequest(ticketUrl);

  if (!getPhpSessionId()) {
    throw new Error(
      "API Error: PHPSESSID non capturé après validation du ticket."
    );
  }

  const userUrl = `${CAS_CONFIG.SERVICE_URL}?q=${encodeURIComponent(
    CAS_CONFIG.API_QUERIES.FIRST_CONNECTION
  )}`;
  const respUser = await makeRequest(userUrl);

  let userData: any;
  try {
    userData = JSON.parse(respUser.body.trim());
  } catch (e) {
    throw new Error("API Error: Réponse JSON invalide ou vide.");
  }

  if (userData.redirect) {
    throw new Error(
      "API Error: Redirection détectée, session invalide ou expirée."
    );
  }

  return userData;
}

export async function loginAndFetchLannionData(
  username: string,
  password: string
): Promise<{ userInfo: any; grades: any | null }> {
  const userData = await authLannion(username, password);

  let gradesData: any | null = null;

  if (userData.semestres && userData.semestres.length > 0) {
    const semId = userData.semestres[0].formsemestre_id;

    const gradesUrl = `${CAS_CONFIG.SERVICE_URL}?q=${encodeURIComponent(
      CAS_CONFIG.API_QUERIES.RELEVE_ETUDIANT
    )}&semestre=${encodeURIComponent(semId)}`;

    const respGrades = await makeRequest(gradesUrl);

    try {
      gradesData = JSON.parse(respGrades.body.trim());
    } catch {
      gradesData = null;
    }
  }

  return {
    userInfo: userData,
    grades: gradesData,
  };
}
