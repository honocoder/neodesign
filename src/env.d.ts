/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    /** URL https du webhook n8n. Serveur uniquement. */
    N8N_WEBHOOK_URL?: string;
    /** Valeur de l'en-tête Header Auth. Serveur uniquement. */
    N8N_WEBHOOK_SECRET?: string;
    /** Nom de l'en-tête. Défaut Authorization si le secret est défini. */
    N8N_WEBHOOK_AUTH_HEADER?: string;
  }
}
