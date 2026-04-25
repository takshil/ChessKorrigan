# ChessKorrigan (Vue 3 + Back4App)

Application Vue 3 pour saisir des parties d'échecs avec authentification utilisateur.

## Fonctionnalités

- Connexion / inscription via Back4App (Parse REST API)
- Création d'une partie d'échecs (joueurs, résultat, date, PGN)
- Liste des parties du compte connecté uniquement
- ACL appliquée à chaque partie pour restreindre lecture/écriture au propriétaire

## Installation

```bash
npm install
cp .env.example .env
# compléter les variables Back4App dans .env
npm run dev
```

## Variables d'environnement

Voir `.env.example`.

## Structure Parse attendue

Classe `Game` avec les champs:

- `owner` (Pointer vers `_User`)
- `whitePlayer` (String)
- `blackPlayer` (String)
- `result` (String)
- `playedOn` (Date)
- `pgn` (String, optionnel)
- `ACL` (automatiquement définie à la création)
