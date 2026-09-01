export type MyCpeId = string | number;

export interface MyCpeLoginResponse {
  normal: string;
  comptage?: string;
}

export interface MyCpePlanningEvent {
  id?: MyCpeId;
  date_debut?: string;
  date_fin?: string;
  duree?: string;
  matiere?: string;
  type_activite?: string;
  statut_intervention?: string;
  intervenants?: string;
  ressource?: string;
  salle?: string;
  is_break?: boolean;
  is_empty?: boolean;
  description?: string;
}

export interface MyCpeCourseRegistration {
  nombre_credits_obtenus?: string | number;
  nombre_credits_potentiels?: string | number;
  moyenne?: string | number;
  est_validee?: boolean;
}

export interface MyCpeExam {
  id?: MyCpeId;
  libelle?: string;
  date_debut_evt?: string;
  est_absent?: boolean;
  intervenants?: string;
  date_obtention?: string;
  note?: string | number;
  est_non_noter?: boolean;
  appreciation?: unknown[];
}

export interface MyCpeCourseGrades {
  id?: MyCpeId;
  cours_code?: string;
  cours_libelle?: string;
  intervenants?: string;
  inscription_cours?: MyCpeCourseRegistration;
  epreuves?: MyCpeExam[];
}

export interface MyCpeAbsenceReason {
  id?: MyCpeId;
  libelle?: string;
  est_excuser?: boolean;
}

export interface MyCpeAbsenceEvent {
  date_debut?: string;
  date_fin?: string;
  intervenants?: string;
  libelle_construit?: string;
}

export interface MyCpeAbsence {
  id?: MyCpeId;
  duree?: string;
  motif_absence?: MyCpeAbsenceReason;
  evenement?: MyCpeAbsenceEvent;
}

export interface MyCpeAbsencesResponse {
  nbr_total_absence_excuser?: number;
  nbr_total_absence_non_excuser?: number;
  duree_totale_absence_excuser?: string;
  duree_totale_absence_non_excuser?: string;
  absences: MyCpeAbsence[];
}

export interface MyCpeIndividualConfiguration {
  individu_id?: MyCpeId;
  nom?: string;
  prenom?: string;
  est_apprenant?: boolean;
  est_intervenant?: boolean;
}

export interface MyCpeVisibilityConfiguration {
  est_visible_mes_notes?: boolean;
  est_visible_mes_absences?: boolean;
  est_visible_mon_planning?: boolean;
  est_visible_appel?: boolean;
}

export interface MyCpeApplicationConfiguration {
  duree_retard?: string | number;
}

export interface MyCpeConfiguration {
  individu?: MyCpeIndividualConfiguration;
  visibilite?: MyCpeVisibilityConfiguration;
  application?: MyCpeApplicationConfiguration;
}
