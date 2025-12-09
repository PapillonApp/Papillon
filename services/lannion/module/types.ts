export interface LannionSession {
  phpSessionId: string;
  createdAt: Date;
}

export interface ECTS {
  [key: string]: undefined;
}

export interface Groupe {
  partition_id: number;
  group_name: string;
  numero: number;
  id: number;
  edt_id: string | null;
  partition: {
    id: number;
    bul_show_rank: boolean;
    groups_editable: boolean;
    partition_name: string;
    formsemestre_id: number;
    numero: number;
    show_in_lists: boolean;
    partition_id: number;
  };
}

export interface AbsencesSemestre {
  injustifie: number;
  total: number;
  metrique: string;
}

export interface Decision {
  code: string;
  etat: string;
  date: string;
}

export interface DecisionUE {
  ue_id: number;
  numero: number;
  acronyme: string;
  titre: string;
  code: string;
  ects: number;
}

export interface AutorisationInscription {
  semestre_id: number;
}

// Interfaces for API responses
export interface LannionSemestre {
  formsemestre_id?: number;
  semestre_id?: number;
  id?: number | string;
  annee_scolaire?: string;
  date_debut?: string;
  date_fin?: string;
}

export interface LannionReleve {
  relevé: {
    semestre?: {
      notes?: {
        value?: string;
        moy?: string;
      }
    };
    ues?: Record<string, LannionUE>;
    ressources?: Record<string, LannionRessource>;
    saes?: Record<string, LannionSAE>;
  };
  absences?: Record<string, LannionAbsence[]>;
}

export interface LannionUE {
  id?: number;
  titre?: string;
  moyenne?: {
    value?: string;
    moy?: string;
    min?: string;
    max?: string;
  };
  ressources?: Record<string, unknown>;
  saes?: Record<string, unknown>;
}

export interface LannionRessource {
  titre?: string;
  evaluations?: LannionEvaluation[];
}

export interface LannionSAE {
  titre?: string;
  evaluations?: LannionEvaluation[];
}

export interface LannionEvaluation {
  id?: number;
  description?: string;
  date?: string;
  coef?: string;
  note?: {
    value?: string;
    moy?: string;
    min?: string;
    max?: string;
  };
}

export interface LannionAbsence {
  idAbs?: number;
  dateFin?: string;
  debut?: number;
  fin?: number;
  matiereComplet?: string;
  justifie?: boolean;
}

export interface Competence {
  id_orebut: string;
  titre: string;
  titre_long: string;
  couleur: string;
  numero: number;
}

export interface Niveau {
  libelle: string;
  annee: string;
  ordre: number;
  competence: Competence;
}

export interface DecisionRCUE {
  code: string;
  niveau: Niveau;
}

export interface DecisionAnnee {
  annee_scolaire: number;
  date: string;
  code: string;
  ordre: number;
}

export interface NotesSemestre {
  value: string;
  min: string;
  moy: string;
  max: string;
}

export interface Rang {
  value: string;
  total: number;
  groupes: Record<string, undefined>;
}

export interface SemestreInfo {
  etapes: string[];
  date_debut: string;
  date_fin: string;
  annee_universitaire: string;
  numero: number;
  inscription: string;
  groupes: Groupe[];
  absences: AbsencesSemestre;
  ECTS: ECTS;
  diplomation: string;
  situation: string;
  diplome_dut120: boolean;
  diplome_dut120_descr: string;
  decision: Decision;
  decision_ue: DecisionUE[];
  autorisation_inscription: AutorisationInscription[];
  decision_rcue: DecisionRCUE[];
  descr_decisions_rcue: string;
  descr_decisions_rcue_list?: string[];
  descr_decisions_niveaux: string;
  decision_annee: DecisionAnnee | null;
  notes: NotesSemestre;
  rang: Rang;
}

export interface Semestre {
  semestre_id: number;
  annee_scolaire: string;
  formsemestre_id: number;
  id?: string | number;
  date_debut?: string;
  date_fin?: string;
}

export interface Releve {
  semestre: SemestreInfo;
  ressources: Record<string, undefined>;
  saes: Record<string, undefined>;
}

export interface Etudiant {
  boursier: boolean;
  civilite_etat_civil: string | null;
  civilite: string;
  code_ine: string;
  code_nip: string;
  date_naissance: string;
  dept_acronym: string;
  dept_id: number;
  dept_naissance: string;
  email: string;
  emailperso: string;
  etat_civil: string;
  etudid: number;
  lieu_naissance: string;
  nationalite: string;
  nom: string;
  nomprenom: string;
  prenom_etat_civil: string | null;
  prenom: string;
  fiche_url: string;
  photo_url: string;
  codepostaldomicile: string;
  paysdomicile: string;
  telephonemobile: string;
  typeadresse: string;
  id: number;
  domicile: string;
  villedomicile: string;
  telephone: string;
  fax: string;
  description: string;
}

export interface Formation {
  id: number;
  acronyme: string;
  titre_officiel: string;
  titre: string;
}

export interface InitialData {
  etudiant: Etudiant;
  formation: Formation;
  semestres: Semestre[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
