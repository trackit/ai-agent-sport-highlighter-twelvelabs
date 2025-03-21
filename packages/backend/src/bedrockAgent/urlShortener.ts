export const shortenUrl = async ({ url }: { url: string }) => {
  const apiEndpoint = 'https://api.short.io/links'
  const headers = {
    'Content-Type': 'application/json',
    authorization: process.env.SHORTIO_API_KEY!,
  }

  const body = {
    domain: process.env.SHORTIO_DOMAIN!,
    originalURL: url,
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // The response is expected to include the shortened URL in a field like `shortURL`.
    const data: { shortURL: string } = (await response.json()) as {
      shortURL: string
    }

    return data.shortURL
  } catch (error) {
    console.error('Error shortening URL:', error)
    return url
  }
}
