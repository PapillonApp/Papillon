export interface ScodocSession {
  token: string;
  baseUrl: string;
  etudid?: number;
  deptAcronym?: string;
  /** Flask session cookie used for CAS-authenticated instances (alternative to Bearer token) */
  sessionCookie?: string;
  /** CAS TGT URL for refreshing the session without re-entering credentials */
  casTgtUrl?: string;
  createdAt: Date;
}

export interface ScodocEtudiant {
  etudid: number;
  nom: string;
  prenom: string;
  email?: string;
  code_nip?: string;
  dept_acronym?: string;
  photo_url?: string;
}

export interface ScodocFormsemestre {
  formsemestre_id: number;
  semestre_id: number;
  annee_scolaire: string;
  titre: string;
  date_debut: string;
  date_fin: string;
  dept_id?: number;
  dept_acronym?: string;
}

export interface ScodocNoteScore {
  value?: string | number | null;
  moy?: string | number | null;
  min?: string | number | null;
  max?: string | number | null;
}

export interface ScodocEvaluation {
  id?: number;
  description?: string;
  date?: string;
  coef?: string | number;
  note?: ScodocNoteScore;
}

export interface ScodocRessource {
  id?: number;
  titre?: string;
  evaluations?: ScodocEvaluation[];
  moyenne?: ScodocNoteScore & { rang?: string; total?: number };
  coef?: string | number;
  ues?: Record<string, unknown>;
  saes?: Record<string, unknown>;
}

export interface ScodocUE {
  id?: number;
  titre?: string;
  acronyme?: string;
  moyenne?: ScodocNoteScore & { rang?: string; total?: number };
  coef?: string | number;
  ressources?: Record<string, unknown>;
  saes?: Record<string, unknown>;
}

export interface ScodocAbsence {
  idAbs?: number;
  dateFin?: string;
  debut?: number;
  fin?: number;
  matiereComplet?: string;
  justifie?: boolean;
}

export interface ScodocSemestreInfo {
  notes?: ScodocNoteScore;
  rang?: {
    value: string;
    total: number;
  };
}

export interface ScodocReleve {
  relevé: {
    etudiant?: ScodocEtudiant;
    semestre?: ScodocSemestreInfo;
    ues?: Record<string, ScodocUE>;
    ressources?: Record<string, ScodocRessource>;
    saes?: Record<string, ScodocRessource>;
  };
  absences?: Record<string, ScodocAbsence[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
