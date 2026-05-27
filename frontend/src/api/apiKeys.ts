import { apiClient } from './client'

export const apiKeysApi = {

  generate: () => {

    return apiClient.post(
      '/api-keys/generate'
    ).then((r) => r.data)
  },

  getAll: () => {

    return apiClient.get(
      '/api-keys'
    ).then((r) => r.data)
  },

  revoke: (
    apiKeyId: string
  ) => {

    return apiClient.post(
      `/api-keys/${apiKeyId}/revoke`
    ).then((r) => r.data)
  }
}