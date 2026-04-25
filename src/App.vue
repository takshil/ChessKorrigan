<template>
  <main class="app-container">
    <header>
      <h1>Chess Vue 3</h1>
      <p>Application Vue 3 prête à être développée.</p>
    </header>

    <section class="status">
      <p>Le projet est configuré avec <strong>Vue 3</strong> et <strong>Vite</strong>.</p>
      <p>Mode actif : <strong>{{ back4appConfig.mode }}</strong></p>
      <p>Serveur Back4App : <strong>{{ back4appConfig.serverURL || 'non configuré' }}</strong></p>
      <p>Lancez <code>npm install</code> puis <code>npm run dev</code>.</p>
    </section>

    <section class="board-placeholder">
      <div class="placeholder-title">Plateau d'échec</div>
      <div class="board-grid">
        <div v-for="n in 64" :key="n" class="square"></div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { back4appConfig } from './back4app.js'
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

.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

header h1 {
  margin: 0 0 0.5rem;
}

.status {
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.board-placeholder {
  padding: 1rem;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.placeholder-title {
  margin-bottom: 1rem;
  font-weight: 600;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 0.25rem;
}

.square {
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #f7f7f7 50%, #d8d8d8 50%);
  border-radius: 0.25rem;
}
</style>
