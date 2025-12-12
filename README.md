# Purple Dog 🟣🐶

**Plateforme d'Enchères & Vente d'Objets d'Exception**

Purple Dog est une application web moderne connectant des particuliers souhaitant vendre des objets de valeur (arts, bijoux, collection) avec un réseau certifié d'acheteurs professionnels. La plateforme propose deux modes de vente : **Vente Directe** et **Enchères**.

---

## 🚀 Fonctionnalités Principales

### 🔐 Authentification, Rôles & Abonnements

- **Particuliers** : Peuvent créer un compte, déposer des annonces et suivre leurs ventes.
- **Professionnels** :
    - Accès aux enchères et à l'achat immédiat.
    - **Abonnements** : Système de plans (Standard, Gold, Platinum) géré via **Stripe**.
    - Tableau de bord dédié (statistiques, achats, facturation).
- **Admin** : Gestion globale (utilisateurs, abonnements, commission) via `/admin`.

### 📦 Dépôt d'Annonces & IA

- Formulaire intuitif avec upload de photos.
- **Estimation par IA** : Intégration avec **Ollama (Llama 3)** pour suggérer un prix basé sur le titre et la description de l'objet.
- Choix du mode de vente : **Vente Directe** ou **Enchère**.

### 🔨 Système d'Enchères & Paiements

- **Enchères Sécurisées** : Seuls les professionnels avec un abonnement valide peuvent enchérir.
- **Paiements Stripe** : Intégration complète pour les abonnements et les transactions d'achat (Marketplace avec Stripe Connect).
- **Achat Immédiat** : Paiement sécurisé et retenue de commission automatique.

### 🚚 Logistique & Suivi

- **Expédition** : Gestion des adresses d'expédition lors de l'achat.
- **Suivi de Colis** : Le vendeur renseigne le numéro de suivi, l'acheteur suit l'acheminement depuis son dashboard.
- **Workflow** : Validation de l'expédition et réception du colis.

### 📊 Tableaux de Bord

- **User Dashboard** : Suivi des annonces, ventes, et génération d'étiquettes d'envoi.
- **Pro Dashboard** : Suivi des enchères, historique des achats, gestion de l'abonnement.
- **Admin Dashboard** : Vue d'ensemble des revenus, gestion des litiges et configuration de la plateforme.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Langage** : TypeScript
- **Base de Données** : PostgreSQL
- **ORM** : Prisma
- **Auth** : NextAuth.js v5 (Beta)
- **Paiement** : Stripe (Connect & Billing)
- **UI** : Tailwind CSS, Shadcn/ui, Lucide Icons
- **IA** : Ollama (Llama 3 local)
- **Infrastructure** : Docker & Docker Compose

---

## ⚙️ Installation & Lancement

### Pré-requis

- **Docker** et **Docker Compose** installés.
- (Optionnel) Node.js v20+ pour le développement local hors conteneur.

### 1. Cloner le projet

```bash
git clone git@github.com:Karamelooo/ESGI-purple-dog.git
cd ESGI-purple-dog
```

### 2. Configuration

Le projet est pré-configuré pour Docker. Le fichier `.env` est géré automatiquement, mais voici les variables clés pour la production et Stripe :

```env
DATABASE_URL="postgresql://user:password@postgres:5432/leboncoindb"
AUTH_SECRET="votre_secret_genere"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
DOMAIN_NAME="example.com"
```

### 3. Lancer avec Docker 🐳

#### Environnement de Développement (Complet avec IA)
```bash
docker compose up -d
```

#### Environnement de Production (Optimisé)
```bash
docker compose -f docker-compose.prod.yml up -d
```

#### Environnement Léger (Sans IA)
Pour les petites configs, sans le service Ollama :
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 4. Initialiser la Base de Données

Une fois les conteneurs lancés :

```bash
# Appliquer le schéma
docker exec leboncoin-app npx prisma migrate dev

# Lancer le seed (Données de démo : Users, Abonnements, Transactions, etc.)
docker exec leboncoin-app npx prisma db seed
```

### 5. Accéder à l'application

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 👤 Comptes de Démo (Seed)

| Rôle      | Email                 | Mot de passe  |
| --------- | --------------------- | ------------- |
| **Admin** | `admin@purpledog.com` | `password123` |
| **Pro**   | `pro@gallery.com`     | `password123` |
| **User**  | `johnny@gmail.com`    | `password123` |

---

## 📂 Schéma de Base de Données

```mermaid
erDiagram
    User ||--o{ Ad : "posts"
    User ||--o{ Ad : "buys"
    User ||--o{ Bid : "places"
    User ||--o{ Notification : "receives"
    User ||--o{ Transaction : "initiates"
    User ||--o{ Review : "writes/receives"
    User }|..|| SubscriptionPlan : "subscribes to"
    
    Ad ||--|| Category : "belongs to"
    Ad ||--o{ Bid : "has"
    Ad ||--o{ Transaction : "has"
    Ad ||--|| Delivery : "has"

    User {
        int id PK
        string email
        string role "USER | PRO | ADMIN"
        string stripeCustomerId
        string subscriptionStatus
        int planId FK
    }

    SubscriptionPlan {
        int id PK
        string name
        float price
        string stripePriceId
        json limits
    }

    Ad {
        int id PK
        string title
        float price
        string type "SALE | AUCTION"
        string status
        int userId FK "Seller"
        int buyerId FK "Buyer"
    }

    Bid {
        int id PK
        float amount
        int userId FK
        int adId FK
    }

    Transaction {
        int id PK
        float amount
        float commissionAmount
        string stripePaymentId
        string status
        int adId FK
    }

    Delivery {
        int id PK
        string trackingNumber
        string carrier
        string status
        string address
        int adId FK
    }

    Category {
        int id PK
        string name
        json formConfig
    }
```

---

_Développé pour le Hackathon ESGI 2025._
