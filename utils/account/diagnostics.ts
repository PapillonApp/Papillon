import { Account, Services, ServiceAccount } from "@/stores/account/types";
import { Pronote } from "@/services/pronote";
import { Skolengo } from "@/services/skolengo";
import { EcoleDirecte } from "@/services/ecoledirecte";
import { TurboSelf } from "@/services/turboself";
import { ARD } from "@/services/ard";
import { Izly } from "@/services/izly";
import { Alise } from "@/services/alise";
import { Appscho } from "@/services/appscho";
import { error } from "@/utils/logger/logger";

export interface DiagnosticResult {
  isHealthy: boolean;
  issues: DiagnosticIssue[];
  lastChecked: Date;
  serviceDetails: ServiceDiagnostic[];
}

export interface DiagnosticIssue {
  severity: "error" | "warning" | "info";
  message: string;
  code: string;
  serviceId?: Services;
}

export interface ServiceDiagnostic {
  serviceId: Services;
  serviceName: string;
  isWorking: boolean;
  errorMessage?: string;
  responseTime?: number;
}

const SERVICE_NAMES: Record<Services, string> = {
  [Services.PRONOTE]: "PRONOTE",
  [Services.SKOLENGO]: "Skolengo",
  [Services.ECOLEDIRECTE]: "EcoleDirecte",
  [Services.TURBOSELF]: "TurboSelf",
  [Services.ARD]: "ARD",
  [Services.IZLY]: "Izly",
  [Services.MULTI]: "Multi",
  [Services.ALISE]: "Alise",
  [Services.APPSCHO]: "AppScho",
};

function createServiceInstance(serviceAccount: ServiceAccount): any {
  switch (serviceAccount.serviceId) {
    case Services.PRONOTE:
      return new Pronote(serviceAccount.id);
    case Services.SKOLENGO:
      return new Skolengo(serviceAccount.id);
    case Services.ECOLEDIRECTE:
      return new EcoleDirecte(serviceAccount.id);
    case Services.TURBOSELF:
      return new TurboSelf(serviceAccount.id);
    case Services.ARD:
      return new ARD(serviceAccount.id);
    case Services.IZLY:
      return new Izly(serviceAccount.id);
    case Services.ALISE:
      return new Alise(serviceAccount.id);
    case Services.APPSCHO:
      return new Appscho(serviceAccount.id);
    default:
      return null;
  }
}

async function testServiceRefresh(
  serviceAccount: ServiceAccount
): Promise<ServiceDiagnostic> {
  const startTime = Date.now();
  const serviceName =
    SERVICE_NAMES[serviceAccount.serviceId] || "Service inconnu";

  try {
    const serviceInstance = createServiceInstance(serviceAccount);

    if (!serviceInstance) {
      return {
        serviceId: serviceAccount.serviceId,
        serviceName,
        isWorking: false,
        errorMessage: "Service non pris en charge",
        responseTime: Date.now() - startTime,
      };
    }

    if (!serviceAccount.auth) {
      return {
        serviceId: serviceAccount.serviceId,
        serviceName,
        isWorking: false,
        errorMessage: "Aucune donnée d'authentification trouvée",
        responseTime: Date.now() - startTime,
      };
    }

    await serviceInstance.refreshAccount(serviceAccount.auth);

    const responseTime = Date.now() - startTime;

    return {
      serviceId: serviceAccount.serviceId,
      serviceName,
      isWorking: true,
      responseTime,
    };
  } catch (err) {
    const responseTime = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";

    error(
      `Échec du diagnostic pour ${serviceName}: ${errorMessage}`,
      "testServiceRefresh"
    );

    return {
      serviceId: serviceAccount.serviceId,
      serviceName,
      isWorking: false,
      errorMessage,
      responseTime,
    };
  }
}

export async function diagnoseAccount(
  account: Account
): Promise<DiagnosticResult> {
  const issues: DiagnosticIssue[] = [];
  const serviceDetails: ServiceDiagnostic[] = [];

  if (!account.services || account.services.length === 0) {
    issues.push({
      severity: "error",
      message: "Aucun service n'est configuré pour ce compte",
      code: "NO_SERVICES",
    });

    return {
      isHealthy: false,
      issues,
      lastChecked: new Date(),
      serviceDetails,
    };
  }

  if (!account.firstName || !account.lastName) {
    issues.push({
      severity: "warning",
      message: "Informations du profil incomplètes (nom ou prénom manquant)",
      code: "INCOMPLETE_PROFILE",
    });
  }

  for (const service of account.services) {
    const diagnostic = await testServiceRefresh(service);
    serviceDetails.push(diagnostic);

    if (!diagnostic.isWorking) {
      issues.push({
        severity: "error",
        message: `Le service ${diagnostic.serviceName} ne peut pas être renouvelé: ${diagnostic.errorMessage}`,
        code: "SERVICE_REFRESH_FAILED",
        serviceId: service.serviceId,
      });
    } else if (diagnostic.responseTime && diagnostic.responseTime > 10000) {
      // Plus de 10 secondes
      issues.push({
        severity: "warning",
        message: `Le service ${diagnostic.serviceName} met beaucoup de temps à répondre (${Math.round(diagnostic.responseTime / 1000)}s)`,
        code: "SLOW_SERVICE_RESPONSE",
        serviceId: service.serviceId,
      });
    }
  }

  const lastUpdate = new Date(account.updatedAt);
  const daysSinceUpdate = Math.floor(
    (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceUpdate > 30) {
    issues.push({
      severity: "info",
      message: `Le compte n'a pas été mis à jour depuis ${daysSinceUpdate} jours`,
      code: "OLD_ACCOUNT_DATA",
    });
  }

  const hasErrors = issues.some(issue => issue.severity === "error");
  const isHealthy = !hasErrors && serviceDetails.every(s => s.isWorking);

  return {
    isHealthy,
    issues,
    lastChecked: new Date(),
    serviceDetails,
  };
}

export function formatDiagnosticMessage(result: DiagnosticResult): string {
  if (result.isHealthy) {
    return "✅ Tout fonctionne correctement !\n\nTous les services sont opérationnels et peuvent être renouvelés sans problème.";
  }

  let message = "⚠️ Des problèmes ont été détectés\n\n";

  const errors = result.issues.filter(i => i.severity === "error");
  const warnings = result.issues.filter(i => i.severity === "warning");
  const infos = result.issues.filter(i => i.severity === "info");

  if (errors.length > 0) {
    message += "Erreurs critiques:\n";
    errors.forEach(issue => {
      message += `  • ${issue.message}\n`;
    });
    message += "\n";
  }

  if (warnings.length > 0) {
    message += "Avertissements:\n";
    warnings.forEach(issue => {
      message += `  • ${issue.message}\n`;
    });
    message += "\n";
  }

  if (infos.length > 0) {
    message += "Informations:\n";
    infos.forEach(issue => {
      message += `  • ${issue.message}\n`;
    });
    message += "\n";
  }

  // Ajouter un résumé des services
  message += "📊 État des services:\n";
  result.serviceDetails.forEach(service => {
    const status = service.isWorking ? "✅" : "❌";
    const time = service.responseTime
      ? ` (${Math.round(service.responseTime / 1000)}s)`
      : "";
    message += `  ${status} ${service.serviceName}${time}\n`;
  });

  return message;
}

export function getRecommendations(result: DiagnosticResult): string[] {
  const recommendations: string[] = [];

  for (const issue of result.issues) {
    switch (issue.code) {
      case "NO_SERVICES":
        recommendations.push(
          "Ajoutez au moins un service (PRONOTE, Skolengo, etc.) dans les paramètres du compte"
        );
        break;
      case "SERVICE_REFRESH_FAILED":
        recommendations.push(
          `Vérifiez vos identifiants pour ${SERVICE_NAMES[issue.serviceId!]} et reconnectez-vous si nécessaire`
        );
        break;
      case "SLOW_SERVICE_RESPONSE":
        recommendations.push(
          "Vérifiez votre connexion internet, les services mettent beaucoup de temps à répondre"
        );
        break;
      case "INCOMPLETE_PROFILE":
        recommendations.push(
          "Complétez les informations de votre profil dans les paramètres"
        );
        break;
      case "OLD_ACCOUNT_DATA":
        recommendations.push(
          "Rafraîchissez les données de votre compte depuis l'écran principal"
        );
        break;
    }
  }

  if (recommendations.length === 0 && !result.isHealthy) {
    recommendations.push(
      "Essayez de vous reconnecter ou contactez le support si le problème persiste"
    );
  }

  return [...new Set(recommendations)];
}
