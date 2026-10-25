/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONTACT_WEBHOOK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
