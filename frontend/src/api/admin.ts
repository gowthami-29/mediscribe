import { apiClient } from './client'

export const adminApi = {
  getOrganizations: () =>
    apiClient.get('/admin/organizations').then((r) => r.data),

  createOrganization: (data: any) =>
    apiClient.post('/admin/organizations', data).then((r) => r.data),

  getDoctors: () =>
  apiClient.get('/admin/doctors').then((r) => r.data),

  getPatients: () =>
  apiClient.get('/admin/patients').then((r) => r.data),

  getSubscriptions: () =>
  apiClient.get('/admin/subscriptions').then((r) => r.data),

createSubscription: (data: any) =>
  apiClient.post('/admin/subscriptions', data).then((r) => r.data),

updateSubscription: (
  subscriptionId: string,
  data: any
) =>
  apiClient.put(
    `/admin/subscriptions/${subscriptionId}`,
    data
  ).then((r) => r.data),

  getUsage: () =>
  apiClient.get('/admin/usage').then((r) => r.data),

  getUpgradeRequests: () =>
  apiClient.get('/admin/upgrade-requests').then((r) => r.data),

approveUpgradeRequest: (requestId: string) =>
  apiClient.put(
    `/admin/upgrade-requests/${requestId}/approve`
  ).then((r) => r.data),

  getDashboard: () =>
  apiClient.get('/admin/dashboard').then((r) => r.data),
}