export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const buildUrl = (path) => `${API_BASE_URL}${path}`

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data?.message ?? data?.title ?? `Request failed with status ${response.status}`,
      )
    }

    return data
  }

  const text = await response.text()

  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  return text
}

export async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  return parseResponse(response)
}