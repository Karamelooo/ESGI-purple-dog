# Purple Dog 🟣🐶

**Plateforme d'Enchères & Vente d'Objets d'Exception**

Purple Dog est une application web moderne connectant des particuliers souhaitant vendre des objets de valeur (arts, bijoux, collection) avec un réseau certifié d'acheteurs professionnels. La plateforme propose deux modes de vente : **Vente Directe** et **Enchères**.

---

## 🚀 Fonctionnalités Principales

### 🔐 Authentification & Rôles
- **Particuliers** : Peuvent créer un compte, déposer des annonces et suivre leurs ventes.
- **Professionnels** : Accès exclusif aux enchères et à l'achat immédiat. Tableau de bord dédié (statistiques, achats).
- **Admin** : Gestion globale (via `/admin`).

### 📦 Dépôt d'Annonces & IA
- Formulaire intuitif avec upload de photos.
- **Estimation par IA** : Intégration avec **Ollama (Llama 3)** pour suggérer un prix basé sur le titre et la description de l'objet.
- Choix du mode de vente : **Vente Directe** ou **Enchère**.

### 🔨 Système d'Enchères
- **Réservé aux Pros** : Seuls les professionnels validés peuvent enchérir.
- **Offres Sécurisées** : Le système vérifie que chaque offre est supérieure à l'offre actuelle (+10€ min).
- **Temps Réel** : Mise à jour des prix et de l'historique des enchères.
- **Achat Immédiat** : Possibilité d'acheter directement au prix fixé (si option activée).

### 📊 Tableaux de Bord
- **User Dashboard** : Suivi des annonces en ligne, vendues, ou en attente.
- **Pro Dashboard** : Suivi des enchères en cours, des achats réalisés et du chiffre d'affaires.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Langage** : TypeScript
- **Base de Données** : PostgreSQL
- **ORM** : Prisma
- **Auth** : NextAuth.js v5 (Beta)
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
Le projet est pré-configuré pour Docker. Assurez-vous que les ports `3000` (Web), `5432` (Postgres) et `11434` (Ollama) sont libres.

Le fichier `.env` est géré automatiquement, mais voici les variables clés :
```env
DATABASE_URL="postgresql://user:password@postgres:5432/leboncoindb"
AUTH_SECRET="votre_secret_genere"
```

### 3. Lancer avec Docker 🐳
L'environnement complet (App + DB + IA) se lance en une commande :
```bash
docker compose up -d
```
*Note : Le premier lancement peut être long (téléchargement des images et du modèle IA).*

### 3b. Mode Développement Léger (Sans IA) ⚡️
Pour économiser des ressources (RAM), vous pouvez lancer une version sans le service Ollama (l'estimation de prix ne fonctionnera pas, mais l'app ne plantera pas) :
```bash
docker compose -f docker-compose.dev.yml up -d
```
Les conteneurs auront le suffixe `-dev` (ex: `leboncoin-app-dev`). Pensez à initialiser la DB spécifique à cet environnement :
```bash
docker exec leboncoin-app-dev npx prisma migrate dev
docker exec leboncoin-app-dev npx prisma db seed
```

### 4. Initialiser la Base de Données
Une fois les conteneurs lancés, initialisez la DB et les données de test :
```bash
# Appliquer le schéma
docker exec leboncoin-app npx prisma migrate dev

# Lancer le seed (Données de démo)
docker exec leboncoin-app npx prisma db seed
```

### 5. Accéder à l'application
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 👤 Comptes de Démo (Seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@purpledog.com` | `password123` |
| **Pro** | `pro@gallery.com` | `password123` |
| **User** | `johnny@gmail.com` | `password123` |

---

## 🐛 Dépannage Courant

### Erreur Prisma "Binary Target"
Si vous rencontrez des erreurs liées à `openssl` ou aux `binaryTargets` (notamment sur Mac M1/M2/M3), assurez-vous que `prisma/schema.prisma` contient :
```prisma
binaryTargets = ["native", "darwin-arm64", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-3.0.x"]
```
Puis régénérez le client :
```bash
docker exec leboncoin-app npx prisma generate
docker restart leboncoin-app
```

### Erreur "tw-animate-css" ou Module non trouvé
Il s'agit souvent d'un problème de cache.
```bash
docker exec leboncoin-app rm -rf .next
docker restart leboncoin-app
```

---

## 📂 Schéma de Base de Données

```mermaid
erDiagram
    User ||--o{ Ad : "posts"
    User ||--o{ Ad : "buys"
    User ||--o{ Bid : "places"
    User ||--o{ Notification : "receives"
    Ad ||--|| Category : "belongs to"
    Ad ||--o{ Bid : "has"

    User {
        int id PK
        string email
        string role "USER | PRO | ADMIN"
        string companyName "Nullable"
        string siret "Nullable"
    }

    Ad {
        int id PK
        string title
        float price
        string type "SALE | AUCTION"
        string status "ACTIVE | SOLD | ..."
        int userId FK
        int buyerId FK "Nullable"
    }

    Bid {
        int id PK
        float amount
        int userId FK
        int adId FK
    }

    Category {
        int id PK
        string name
        string slug
    }

    Notification {
        int id PK
        string message
        boolean read
        int userId FK
    }
```

---

*Développé pour le Hackathon ESGI 2024.*
