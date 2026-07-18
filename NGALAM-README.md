# NGALAM — Documentation Complète

## 🎨 Identité
- **Nom** : NGALAM ("l'or le plus pur" en Wolof)
- **Signature** : *Designed in Paris. Soul in Dakar.*
- **Matière** : Acier inoxydable 316L, finition Or PVD (waterproof, hypoallergénique)

## 🏗️ Stack Technique
- React 18 + Vite 5 + TypeScript
- Tailwind CSS v3 + shadcn/ui
- React Router v6, TanStack Query
- Supabase (DB, Auth, Storage, Edge Functions)
- Stripe (paiements)

## 📄 Pages
| Route | Description |
|---|---|
| `/` | Homepage (Hero, Drop, Storytelling, Grille) |
| `/product/:id` | Fiche produit dynamique |
| `/coffret-dakar` | Landing Coffret Signares |
| `/journal/signares` | Page éditoriale Moodboard |
| `/histoire` | Page L'Esprit Ngalam |
| `/auth` | Login / Signup |
| `/admin` | Dashboard admin (protégé) |
| `/success` | Confirmation post-paiement |

## 🔐 Dashboard Admin (`/admin`)
Accessible uniquement aux utilisateurs avec le rôle `admin` (table `user_roles`).

**Fonctionnalités :**
- **KPIs** : CA total, commandes en cours, produits en rupture (cliquable pour filtrer)
- **Produits** : CRUD complet, édition inline prix/stock, upload image, alertes stock (rouge=épuisé, orange=faible)
- **Commandes** : liste live, statut modifiable (En attente → Livré)

## 🗄️ Base de Données (Supabase)
- `products` — id, name, description, price, stock_quantity, image_url, category, is_featured
- `orders` — id, customer_email, customer_name, total_amount, status, shipping_address
- `order_items` — order_id, product_id, quantity, price_at_purchase
- `user_roles` — user_id, role ('admin' | 'user')

**RLS** : lecture publique produits, écriture admin uniquement, commandes scopées à `auth.uid()`.

## ⚡ Edge Functions
- `create-checkout-session` — Crée une session Stripe (valide stock et prix côté serveur)
- `confirm-order` — Vérifie paiement, crée commande, décrémente stock

## 🔑 Secrets requis (Supabase → Edge Functions)
- `STRIPE_SECRET_KEY`

## 🚀 Installation
```bash
bun install
bun run dev
```

## 👑 Créer un admin
Dans le SQL Editor Supabase :
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<user-uuid>', 'admin');
```

## 🎨 Design Tokens (index.css)
- Beige Sable : `#F2EFED`
- Terre d'Ombre : `#3E3B39`
- Indigo Profond : `#1F2E5E`
- Or Mat : `#D4AF37`
