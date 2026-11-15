export function getSafeCallbackURL(value?: string | string[]) {
  const callbackURL = Array.isArray(value) ? value[0] : value
  if (!callbackURL?.startsWith("/") || callbackURL.includes("\\")) return "/"

  const baseURL = new URL("http://localhost")
  const destination = new URL(callbackURL, baseURL)

  return destination.origin === baseURL.origin
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : "/"
}
