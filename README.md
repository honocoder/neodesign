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
| `N8N_WEBHOOK_URL` | oui | `https://n8n.jimsvault.tech/webhook/neodesign-contact` |
| `N8N_WEBHOOK_SECRET` | oui | Clé enregistrée dans n8n. Envoyée telle quelle dans `X-NeoDesign-Webhook-Token`. |

La clé ne va ni dans le dépôt, ni dans le navigateur, ni dans les logs.  
Sans l'une de ces deux variables, le site se construit quand même. L'envoi répond alors que le formulaire est indisponible, et le webhook n'est pas appelé.

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
- En-têtes vers n8n : `Content-Type: application/json` et `X-NeoDesign-Webhook-Token`.
- n8n répond `200` avec `{ "ok": true }` quand le mail part, et `400` avec `{ "ok": false, "error": "invalid_request" }` s'il refuse les données. Le site n'affiche pas ce code : il demande de vérifier les informations.
- Si n8n ne répond pas, ou répond autre chose, le site affiche une erreur générique et ne confirme pas l'envoi.
- Le navigateur n'appelle que `/api/contact`. Aucun CORS n'est nécessaire sur n8n pour cet appel serveur à serveur.
- Cinq envois par adresse IP et par tranche de 10 minutes. Le compteur est en mémoire, donc propre à chaque instance de la fonction Vercel.
- La confirmation n'est affichée que si `/api/contact` répond `200` avec `{ "ok": true }`.

Ne pas envoyer de message réel vers cette URL pour un essai : elle alimente le workflow publié.  
`pnpm test:contact` construit le JSON et exerce l'endpoint avec un `fetch` simulé.
