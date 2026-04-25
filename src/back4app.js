export const back4appConfig = {
  appId: import.meta.env.VITE_BACK4APP_APP_ID,
  javascriptKey: import.meta.env.VITE_BACK4APP_JAVASCRIPT_KEY,
  serverURL: import.meta.env.VITE_BACK4APP_SERVER_URL || 'https://parseapi.back4app.com',
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.MODE === 'production',
  isTest: import.meta.env.MODE === 'test'
}

export const hasRequiredConfig = Boolean(back4appConfig.appId && back4appConfig.javascriptKey)

const buildHeaders = (sessionToken) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': back4appConfig.appId,
    'X-Parse-JavaScript-Key': back4appConfig.javascriptKey
  }

  if (sessionToken) {
    headers['X-Parse-Session-Token'] = sessionToken
  }

  return headers
}

const request = async ({ path, method = 'GET', body, sessionToken }) => {
  if (!hasRequiredConfig) {
    throw new Error('Configuration Back4App manquante.')
  }

  const response = await fetch(`${back4appConfig.serverURL}${path}`, {
    method,
    headers: buildHeaders(sessionToken),
    body: body ? JSON.stringify(body) : undefined
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.error || 'Erreur Back4App')
  }

  return payload
}

export const back4appApi = {
  login: ({ username, password }) =>
    request({
      path: `/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    }),

  signup: ({ username, email, password }) =>
    request({
      path: '/users',
      method: 'POST',
      body: { username, email, password }
    }),

  createGame: ({ sessionToken, game }) =>
    request({
      path: '/classes/Game',
      method: 'POST',
      sessionToken,
      body: game
    }),

  listGames: ({ sessionToken, userId }) => {
    const where = {
      owner: {
        __type: 'Pointer',
        className: '_User',
        objectId: userId
      }
    }

    return request({
      path: `/classes/Game?where=${encodeURIComponent(JSON.stringify(where))}&order=-playedOn&limit=100`,
      sessionToken
    })
  }
}
