# NGALAM — Design System (verrouillé)

> **Statut : documentation de référence.** Ce fichier décrit le système visuel **réel** du projet, tel que défini dans
> [`tailwind.config.ts`](./tailwind.config.ts) et [`src/index.css`](./src/index.css).
> Il ne modifie rien. Tous les chantiers suivants doivent s'y conformer.
>
> Source de vérité :
> - **Couleurs / radius** : variables CSS `:root` (et `.dark`) dans `src/index.css`, exposées à Tailwind via `hsl(var(--…))` dans `tailwind.config.ts`.
> - **Typographie** : `theme.extend.fontFamily` dans `tailwind.config.ts` + `@import` Google Fonts en tête de `src/index.css`.
>
> Toutes les couleurs sont en **HSL sans fonction** (`H S% L%`) et consommées via `hsl(var(--token))`. Aucune valeur ci-dessous n'est inventée : elles sont copiées telles quelles depuis les fichiers source.

---

## 1. Palette

### Mode clair (`:root`)

| Token Tailwind | Variable CSS | Valeur réelle (HSL) | Usage typique |
|---|---|---|---|
| `background` | `--background` | `24 14% 94%` | Fond de page (`bg-background`), appliqué sur `body` |
| `foreground` | `--foreground` | `18 4% 23%` | Texte principal (`text-foreground`) |
| `primary` | `--primary` | `224 50% 25%` | Bleu nuit — CTA, en-têtes, accents forts (`bg-primary`, `text-primary`) |
| `primary-foreground` | `--primary-foreground` | `0 0% 100%` | Texte sur fond primary (`text-primary-foreground`) |
| `secondary` | `--secondary` | `42 14% 92%` | Fond doux alternatif (`bg-secondary`) |
| `secondary-foreground` | `--secondary-foreground` | `18 4% 23%` | Texte sur fond secondary |
| `muted` | `--muted` | `30 10% 88%` | Fonds neutres, placeholders (`bg-muted`) |
| `muted-foreground` | `--muted-foreground` | `18 4% 40%` | Texte secondaire / légendes (`text-muted-foreground`) |
| `accent` | `--accent` | `43 64% 52%` | Or — accent lumineux (`bg-accent`, `text-accent`) |
| `accent-foreground` | `--accent-foreground` | `18 4% 15%` | Texte sur fond accent |
| `gold` | `--gold` | `43 64% 52%` | Or décoratif (`text-gold`, `bg-gold`) — **valeur identique à `accent`** |
| `destructive` | `--destructive` | `0 84.2% 60.2%` | Erreurs / suppression (`text-destructive`) |
| `destructive-foreground` | `--destructive-foreground` | `210 40% 98%` | Texte sur fond destructive |
| `card` | `--card` | `24 14% 94%` | Fond des cartes (`bg-card`) |
| `card-foreground` | `--card-foreground` | `18 4% 23%` | Texte des cartes |
| `popover` | `--popover` | `24 14% 94%` | Fond des popovers |
| `popover-foreground` | `--popover-foreground` | `18 4% 23%` | Texte des popovers |
| `border` | `--border` | `18 4% 23% / 0.1` | Bordures (`border-border`) — inclut une alpha de 0.1 |
| `input` | `--input` | `18 4% 23% / 0.15` | Bordures de champs — alpha 0.15 |
| `ring` | `--ring` | `224 50% 25%` | Anneau de focus |

**Tokens hero (non mappés en classe Tailwind)** — définis dans `:root`, servant au dégradé du hero :

| Variable CSS | Valeur | Note |
|---|---|---|
| `--hero-gradient-start` | `24 14% 94%` | = `--background` |
| `--hero-gradient-end` | `44 58% 93%` | Ton crème chaud |

> ⚠️ **Constat (à ne pas « corriger » sans décision produit)** : le dégradé du hero est actuellement appliqué en dur dans
> [`src/components/HeroSection.tsx`](./src/components/HeroSection.tsx) via
> `linear-gradient(180deg, hsl(24 14% 94%) 0%, hsl(44 58% 93%) 100%)` — soit les **mêmes valeurs** que
> `--hero-gradient-start/end`, mais écrites en dur plutôt que via les tokens. C'est le seul écart tokens/usage relevé.

### Sidebar (`:root`)

Sous-palette dédiée aux primitives sidebar (`bg-sidebar`, `text-sidebar-foreground`, etc.) :

| Variable CSS | Valeur |
|---|---|
| `--sidebar-background` | `24 14% 94%` |
| `--sidebar-foreground` | `18 4% 23%` |
| `--sidebar-primary` | `224 50% 25%` |
| `--sidebar-primary-foreground` | `0 0% 100%` |
| `--sidebar-accent` | `42 14% 92%` |
| `--sidebar-accent-foreground` | `18 4% 23%` |
| `--sidebar-border` | `18 4% 23% / 0.1` |
| `--sidebar-ring` | `224 50% 25%` |

### Mode sombre (`.dark`)

Activé par la classe `dark` (`darkMode: ["class"]`). Surcharges définies dans `.dark` :

| Token | Valeur (dark) |
|---|---|
| `--background` | `18 10% 8%` |
| `--foreground` | `24 14% 94%` |
| `--card` | `18 10% 10%` |
| `--card-foreground` | `24 14% 94%` |
| `--popover` | `18 10% 10%` |
| `--popover-foreground` | `24 14% 94%` |
| `--primary` | `224 50% 55%` |
| `--primary-foreground` | `0 0% 100%` |
| `--secondary` | `18 10% 15%` |
| `--secondary-foreground` | `24 14% 94%` |
| `--muted` | `18 10% 18%` |
| `--muted-foreground` | `24 10% 60%` |
| `--accent` | `43 64% 52%` |
| `--accent-foreground` | `18 4% 15%` |
| `--destructive` | `0 62.8% 30.6%` |
| `--destructive-foreground` | `210 40% 98%` |
| `--border` | `24 14% 94% / 0.1` |
| `--input` | `24 14% 94% / 0.15` |
| `--ring` | `224 50% 55%` |

> Le bloc `.dark` ne redéfinit **pas** `--gold`, `--hero-gradient-*` ni les tokens `--sidebar-*` : ils conservent leur valeur de `:root`.

---

## 2. Typographie

Deux familles, déclarées dans `theme.extend.fontFamily` et importées depuis Google Fonts en tête de `src/index.css`.

| Classe Tailwind | Famille | Stack complète | Usage réel |
|---|---|---|---|
| `font-serif` | **Playfair Display** | `['Playfair Display', 'Georgia', 'serif']` | Titres. Appliqué automatiquement à `h1–h6` (via `src/index.css`) et explicitement sur les grands intitulés (`font-serif`) |
| `font-sans` | **DM Sans** | `['DM Sans', 'system-ui', 'sans-serif']` | Corps de texte. Appliqué à `body` par défaut (`font-family: var(--font-sans)`) |

Variables CSS miroir (dans `:root`) : `--font-serif` et `--font-sans`.

Graisses importées :
- Playfair Display : 400, 500, 600, 700 (+ italiques 400, 500).
- DM Sans : 300, 400, 500, 600, 700 (+ italique 400).

**Convention d'inter-lettrage** observée sur les libellés en majuscules (à réutiliser, pas un token formel) :
`tracking-[0.1em]` → `tracking-[0.3em]`, typiquement combinée à `uppercase` sur les sur-titres et boutons.

---

## 3. Radius, layout & animations

### Border radius
Base : `--radius: 0.125rem` (soit `2px`). Échelle Tailwind dérivée :

| Classe | Valeur |
|---|---|
| `rounded-lg` | `var(--radius)` = `0.125rem` |
| `rounded-md` | `calc(var(--radius) - 2px)` = `0px` |
| `rounded-sm` | `calc(var(--radius) - 4px)` = `-2px` (clampé à `0` par le navigateur) |

> Le design est volontairement **très peu arrondi** (angles quasi droits). `rounded-sm` est la classe la plus courante dans les composants.

### Conteneur
`theme.container` : centré, `padding: 2rem`, breakpoint `2xl: 1400px`.

### Animations (`theme.extend`)
Keyframes + utilities fournies : `accordion-down` / `accordion-up` (0.2s), `fade-up` (0.8s ease-out forwards), `fade-in` (0.6s ease-out forwards). Plugin : `tailwindcss-animate`.

---

## 4. Classes / utilities sémantiques clés à réutiliser

Classes réellement présentes dans le code (nombre de fichiers où elles apparaissent, indicatif) :

| Classe | Rôle | Présence |
|---|---|---|
| `bg-background` / `text-foreground` | Fond & texte de base | 29 / 23 |
| `bg-primary` / `text-primary` / `text-primary-foreground` | Bleu nuit + son texte | 16 / 18 / 12 |
| `bg-secondary` / `text-secondary` | Fond doux | 11 / 2 |
| `bg-muted` / `text-muted-foreground` | Neutres & texte secondaire | 19 / 35 |
| `bg-accent` / `text-accent` | Or accent | 11 / 12 |
| `text-gold` / `bg-gold` | Or décoratif (✦, détails) | 3 / 2 |
| `bg-card` / `border-border` | Cartes & bordures | 2 / 7 |
| `font-serif` / `font-sans` | Familles typo | 15 / 7 |
| `rounded-sm` / `rounded-md` / `rounded-lg` | Angles | 17 / 19 / 6 |

Primitives d'interface : composants dans [`src/components/ui/`](./src/components/ui) (shadcn/Radix). Ils consomment déjà ces tokens — **les réutiliser plutôt que recréer** boutons, inputs, dialogs, etc.

---

## 5. Règle de contribution

Tout nouveau code visuel (composant, page, section) **doit** :

1. **Réutiliser les tokens ci-dessus** via leurs classes Tailwind sémantiques (`bg-primary`, `text-muted-foreground`, `text-gold`, `font-serif`…). Ne jamais dupliquer une valeur.
2. **Réutiliser les primitives `src/components/ui/`** avant d'écrire un composant custom (boutons, champs, dialogs, dropdowns…).
3. **Interdiction d'introduire une couleur hors palette** : aucune nouvelle teinte, aucun nouveau token couleur sans décision explicite et mise à jour conjointe de `src/index.css`, `tailwind.config.ts` **et** de ce fichier.
4. **Interdiction d'une police hors `font-serif` / `font-sans`.**
5. **Jamais de couleur en dur** (`#hex`, `rgb(...)`, `hsl(...)` littéral) dans le JSX/CSS des composants. Toujours passer par les classes de tokens.
   - *Dette connue à résorber, pas à imiter* : le dégradé inline de `HeroSection.tsx` (cf. §1).
6. **Angles** : rester sur l'échelle `rounded-sm/md/lg` existante (design quasi droit) — ne pas introduire d'arrondis arbitraires.
7. **Modifier un token** = modifier la variable CSS dans `src/index.css` (source de vérité), pas la valeur en aval. Toute évolution de palette met ce document à jour.
