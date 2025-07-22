import { createAuthClient } from "better-auth/client"

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env['BASE_URL']) return process.env['BASE_URL']
  return `http://localhost:${process.env['PORT'] ?? 4200}`
}

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  fetchOptions: {
    onSuccess: (response) => {
      localStorage.setItem('token', response.data.accessToken);
    }
  }
})
