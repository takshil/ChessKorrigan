<template>
  <main class="app-container">
    <header>
      <h1>Saisie de parties d'échecs</h1>
      <p>Vue 3 + Back4App avec accès privé par utilisateur connecté.</p>
    </header>

    <section v-if="!hasRequiredConfig" class="card warning">
      <h2>Configuration incomplète</h2>
      <p>
        Renseignez <code>VITE_BACK4APP_APP_ID</code> et <code>VITE_BACK4APP_JAVASCRIPT_KEY</code>
        dans votre fichier <code>.env</code>.
      </p>
      <p>Serveur utilisé : <strong>{{ back4appConfig.serverURL }}</strong></p>
    </section>

    <template v-else>
      <section class="card" v-if="!currentUser">
        <h2>Connexion</h2>
        <form class="form" @submit.prevent="login">
          <label>
            Nom d'utilisateur
            <input v-model.trim="loginForm.username" required autocomplete="username" />
          </label>
          <label>
            Mot de passe
            <input
              v-model="loginForm.password"
              type="password"
              required
              autocomplete="current-password"
            />
          </label>
          <button :disabled="isLoading">Se connecter</button>
        </form>

        <h3>Créer un compte</h3>
        <form class="form" @submit.prevent="signup">
          <label>
            Nom d'utilisateur
            <input v-model.trim="signupForm.username" required autocomplete="username" />
          </label>
          <label>
            Email
            <input v-model.trim="signupForm.email" type="email" required autocomplete="email" />
          </label>
          <label>
            Mot de passe
            <input v-model="signupForm.password" type="password" required autocomplete="new-password" />
          </label>
          <button :disabled="isLoading">Créer le compte</button>
        </form>
      </section>

      <template v-else>
        <section class="card user-bar">
          <div>
            Connecté : <strong>{{ currentUser.username }}</strong>
          </div>
          <button class="secondary" @click="logout">Se déconnecter</button>
        </section>

        <section class="card">
          <h2>Nouvelle partie</h2>
          <form class="form" @submit.prevent="createGame">
            <label>
              Blancs
              <input v-model.trim="gameForm.whitePlayer" required />
            </label>
            <label>
              Noirs
              <input v-model.trim="gameForm.blackPlayer" required />
            </label>
            <label>
              Résultat
              <select v-model="gameForm.result" required>
                <option value="1-0">1-0</option>
                <option value="0-1">0-1</option>
                <option value="1/2-1/2">1/2-1/2</option>
                <option value="*">*</option>
              </select>
            </label>
            <label>
              Date de la partie
              <input v-model="gameForm.playedOn" type="date" required />
            </label>
            <label>
              PGN (optionnel)
              <textarea v-model.trim="gameForm.pgn" rows="4" placeholder="Collez votre PGN ici"></textarea>
            </label>
            <button :disabled="isLoading">Enregistrer la partie</button>
          </form>
        </section>

        <section class="card">
          <h2>Mes parties</h2>
          <p v-if="!games.length">Aucune partie enregistrée pour le moment.</p>
          <ul v-else class="game-list">
            <li v-for="game in games" :key="game.objectId" class="game-item">
              <div>
                <strong>{{ game.whitePlayer }}</strong>
                vs
                <strong>{{ game.blackPlayer }}</strong>
                — {{ game.result }}
              </div>
              <small>
                {{ formatDate(game.playedOn?.iso) }} · créé le {{ formatDate(game.createdAt) }}
              </small>
            </li>
          </ul>
        </section>
      </template>

      <section v-if="message" class="card info">{{ message }}</section>
      <section v-if="errorMessage" class="card error">{{ errorMessage }}</section>
    </template>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { back4appApi, back4appConfig, hasRequiredConfig } from './back4app.js'

const STORAGE_KEY = 'chess-back4app-session'
const currentUser = ref(loadStoredUser())
const games = ref([])
const isLoading = ref(false)
const message = ref('')
const errorMessage = ref('')

const loginForm = reactive({ username: '', password: '' })
const signupForm = reactive({ username: '', email: '', password: '' })
const gameForm = reactive({
  whitePlayer: '',
  blackPlayer: '',
  result: '1-0',
  playedOn: new Date().toISOString().slice(0, 10),
  pgn: ''
})

function loadStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

function persistUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

const clearFeedback = () => {
  message.value = ''
  errorMessage.value = ''
}

const formatDate = (value) => {
  if (!value) return 'date inconnue'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'date inconnue'
  return new Intl.DateTimeFormat('fr-FR').format(date)
}

const loadGames = async () => {
  if (!currentUser.value) {
    games.value = []
    return
  }

  const data = await back4appApi.listGames({
    sessionToken: currentUser.value.sessionToken,
    userId: currentUser.value.objectId
  })

  games.value = data.results || []
}

const login = async () => {
  clearFeedback()
  isLoading.value = true

  try {
    const data = await back4appApi.login(loginForm)
    currentUser.value = {
      objectId: data.objectId,
      username: data.username,
      sessionToken: data.sessionToken
    }

    persistUser(currentUser.value)

    message.value = 'Connexion réussie.'
    loginForm.username = ''
    loginForm.password = ''
    await loadGames()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const signup = async () => {
  clearFeedback()
  isLoading.value = true

  try {
    const data = await back4appApi.signup(signupForm)
    currentUser.value = {
      objectId: data.objectId,
      username: signupForm.username,
      sessionToken: data.sessionToken
    }

    persistUser(currentUser.value)

    message.value = 'Compte créé et connecté.'
    signupForm.username = ''
    signupForm.email = ''
    signupForm.password = ''

    await loadGames()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  clearFeedback()
  currentUser.value = null
  games.value = []
  persistUser(null)
  message.value = 'Déconnexion effectuée.'
}

const createGame = async () => {
  clearFeedback()
  isLoading.value = true

  try {
    const iso = new Date(`${gameForm.playedOn}T12:00:00.000Z`).toISOString()

    await back4appApi.createGame({
      sessionToken: currentUser.value.sessionToken,
      game: {
        owner: {
          __type: 'Pointer',
          className: '_User',
          objectId: currentUser.value.objectId
        },
        ACL: {
          [currentUser.value.objectId]: { read: true, write: true }
        },
        whitePlayer: gameForm.whitePlayer,
        blackPlayer: gameForm.blackPlayer,
        result: gameForm.result,
        playedOn: {
          __type: 'Date',
          iso
        },
        pgn: gameForm.pgn || null
      }
    })

    message.value = 'Partie enregistrée. Visible uniquement par votre compte.'

    gameForm.whitePlayer = ''
    gameForm.blackPlayer = ''
    gameForm.result = '1-0'
    gameForm.playedOn = new Date().toISOString().slice(0, 10)
    gameForm.pgn = ''

    await loadGames()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (hasRequiredConfig && currentUser.value) {
    try {
      await loadGames()
    } catch (error) {
      errorMessage.value = `Session expirée: ${error.message}`
      logout()
    }
  }
})
</script>

<style>
:root {
  font-family: Inter, system-ui, Arial, sans-serif;
  color: #1c1c1c;
  background: #f4f5f7;
}
body {
  margin: 0;
}
* {
  box-sizing: border-box;
}
.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}
header h1 {
  margin: 0;
}
.card {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}
.form {
  display: grid;
  gap: 0.75rem;
}
label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.95rem;
}
input,
select,
textarea,
button {
  font: inherit;
}
input,
select,
textarea {
  border: 1px solid #d8d8d8;
  border-radius: 10px;
  padding: 0.55rem 0.65rem;
}
button {
  border: 0;
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  background: #1f57ff;
  color: #fff;
  cursor: pointer;
  width: fit-content;
}
button.secondary {
  background: #606b85;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.user-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.game-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}
.game-item {
  border: 1px solid #ececec;
  border-radius: 10px;
  padding: 0.7rem;
}
.info {
  border-left: 4px solid #1f57ff;
}
.error {
  border-left: 4px solid #ff2f2f;
  color: #8f0a0a;
}
.warning {
  border-left: 4px solid #f39c12;
}
</style>
