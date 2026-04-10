// 프로덕션은 항상 동일 출처 `/api` → Vercel rewrites(vercel.json)가 Railway로 전달(CORS 회피).
// 로컬 개발은 기본 `/api` → vite.config.js proxy. 필요 시에만 .env에서 직접 URL 지정.
const BASE_URL =
  import.meta.env.PROD
    ? '/api'
    : import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  })

  if (!response.ok) {
    let message = `요청에 실패했습니다. (${response.status})`

    try {
      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        const data = await response.json()
        if (typeof data?.message === 'string' && data.message) {
          message = data.message
        }
      } else {
        const text = await response.text()
        if (text.trim()) {
          message = text.trim()
        }
      }
    } catch {
      // Ignore invalid error payloads and use the default message.
    }

    throw new Error(message)
  }

  return response.json()
}

export async function searchUniversities(query) {
  const params = new URLSearchParams()
  if (query) {
    params.set('q', query)
  }

  return request(`/universities?${params.toString()}`)
}

export async function getUniversitiesByProvince(province) {
  const params = new URLSearchParams()
  params.set('province', province)
  return request(`/universities?${params.toString()}`)
}

export async function getUniversityById(universityId) {
  return request(`/universities/${universityId}`)
}

export async function getUniversityStats(universityId) {
  return request(`/universities/${universityId}/stats`)
}

export async function getDoomRanking(limit = 3) {
  return request(`/ranking/doom?limit=${limit}`)
}

export async function contributeToUniversity(universityId, payload) {
  const normalizedPayload = {
    universityId,
    ...payload,
  }

  try {
    return await request('/universities/contribute', {
      method: 'POST',
      body: JSON.stringify(normalizedPayload),
    })
  } catch (error) {
    const canRetryWithPathParam =
      error instanceof Error &&
      (error.message.includes('(404)') || error.message.includes('Not Found'))

    if (!canRetryWithPathParam) {
      throw error
    }

    return request(`/universities/${universityId}/contribute`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}

export async function getUniversityVibes(universityId) {
  return request(`/universities/${universityId}/vibes`)
}

export async function createUniversityVibe(universityId, text) {
  return request(`/universities/${universityId}/vibes`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export { BASE_URL }
