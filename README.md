# NeoDesign

Site vitrine de Jimy Marletta, développeur web freelance près d'Amiens.  
Astro, pages statiques, français. Le formulaire de contact passe par une fonction serveur.

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm test:contact
```

Le site canonique est `https://www.agenceneodesign.com`.

## Formulaire de contact

Le navigateur envoie le formulaire à `POST /api/contact`.  
La fonction transmet ensuite à n8n le JSON ci-dessous, sans champ supplémentaire.

### Variables d'environnement

À configurer sur Vercel, pour l'environnement de production. Elles ne sont pas préfixées par `PUBLIC_` et ne sont pas lues par le code du navigateur.

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `N8N_WEBHOOK_URL` | oui | URL https du webhook n8n |
| `N8N_WEBHOOK_SECRET` | non | Valeur exacte de l'en-tête Header Auth. Laisser vide si le webhook n'exige pas d'en-tête. |
| `N8N_WEBHOOK_AUTH_HEADER` | non | Nom de cet en-tête. Défaut : `Authorization`, seulement si le secret est défini. |

Si n8n attend `Bearer …`, ce préfixe fait partie de `N8N_WEBHOOK_SECRET`.  
Si le nom d'en-tête est renseigné sans secret, la fonction n'appelle pas le webhook.

Sans `N8N_WEBHOOK_URL`, le site se construit quand même. L'envoi répond alors que le formulaire est indisponible, et le webhook n'est pas appelé.

L'ancienne variable `PUBLIC_CONTACT_WEBHOOK` n'est plus lue. On peut la retirer de Vercel.

### Corps exact transmis à n8n

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
- Le champ piège `nd_hp` est lu par `/api/contact` puis retiré. S'il est rempli, la fonction répond comme un succès et n'appelle pas n8n.
- En-têtes vers n8n : `Content-Type: application/json`, `Accept: application/json`, plus l'en-tête secret s'il est configuré.
- Le navigateur n'a pas besoin de CORS vers n8n : l'appel part du serveur.
- Cinq envois par adresse IP et par tranche de 10 minutes. Le compteur est en mémoire, donc propre à chaque instance de la fonction Vercel.
- La confirmation n'est affichée que si `/api/contact` répond `200` avec `{ "ok": true }`.

Ne pas pointer `N8N_WEBHOOK_URL` vers le webhook de production pour un essai.  
`pnpm test:contact` construit le JSON et exerce l'endpoint avec un `fetch` simulé.
