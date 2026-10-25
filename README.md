# NeoDesign

Site vitrine de Jimy Marletta, développeur web freelance près d'Amiens.  
Astro, pages statiques, français.

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm test:contact
```

Le site canonique est `https://www.agenceneodesign.com`.

## Formulaire de contact

Le formulaire envoie un `POST` JSON au webhook n8n.

Variable facultative : `PUBLIC_CONTACT_WEBHOOK` (voir `.env.example`).  
Si elle est absente, l'URL utilisée est :

`https://n8n.jimsvault.tech/webhook/heyform-submissions`

Ne pas envoyer de requête de test sur cette URL : elle alimente le pipeline réel.  
Les tests locaux construisent le JSON sans l'envoyer (`pnpm test:contact`) ou interceptent `fetch` dans le navigateur.

### Corps exact

```json
{
  "name": "Camille Martin",
  "email": "camille@exemple.fr",
  "phone": null,
  "company": "Atelier Martin",
  "offer": "site-vitrine",
  "message": "Bonjour, je voudrais un site.",
  "source": "neodesign-website"
}
```

- `phone` et `company` valent `null` quand le champ est vide.
- `offer` : `site-vitrine` | `maintenance` | `automatisation` | `conseil` | `autre`.
- Le champ piège `nd_hp` n'est jamais envoyé. S'il est rempli, le navigateur affiche le message de succès et n'appelle pas le webhook.
- En-têtes : `Content-Type: application/json`, `Accept: application/json`.
- Il faudra probablement autoriser le CORS (origine `https://www.agenceneodesign.com`, méthode `POST`, en-tête `Content-Type`) côté n8n.

## Redirections

`/pricing` → `/tarifs`, `/about` → `/a-propos`,  
`/services/web-dev`, `/services/graphisme`, `/services/seo-sea` → `/services/site-vitrine`,  
`/services/mobile-dev` → `/tarifs`.
