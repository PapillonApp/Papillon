import { Session } from "pawdirecte";
import { Balance } from "@/services/shared/balance";

interface EDBalanceElement {
  couleurPastille: string;
  date: string;
  infoComp: string;
  lettrage: string;
  libelle: string;
  montant: number;
}

interface EDBalanceResponse {
  code: number;
  token: string;
  host: string;
  data: {
    comptes: Array<{
      avenir: Array<any>,
      codeCompte: string,
      disponible: boolean,
      ecritures: Array<EDBalanceElement>,
      id: number,
      idEleve: number,
      idServiceClasse: number,
      isPMPayable: boolean,
      libelle: string,
      libelleCompte: string,
      montantModifiable: boolean,
      montantVersement: number,
      quantiteModifiable: boolean,
      solde: number,
      typeCompte: string,
    }>,
    parametrage: {
      paiementSoldeCrediteur: boolean,
      porteMonnaie: boolean,
    }
  }
}

export async function fetchEDBalances(session: Session): Promise<Balance[]> {
  // Will be replaced later by another module

  console.log(session.token)

  const f = await fetch("https://api.ecoledirecte.com/v3/comptes/detail.awp?verbe=get&v=7.0.1", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Android EDMOBILE v7.0.1",
      "X-Token": session.token!,
    },
    body: 'data={}'
  });
  const json: EDBalanceResponse = await f.json();
  console.log(json);

  return json.data.comptes.map(compte => ({
    amount: compte.solde * 100,
    currency: "€",
    lunchRemaining: 0,
    lunchPrice: 0,
    label: compte.libelleCompte,
  })) as Balance[];
}