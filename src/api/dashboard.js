import client from './client';

export async function getDashboard(analysisId) {
  const { data } = await client.get(`/api/dashboard/analysis/${analysisId}`);
  return data;
}

export async function getDashboardSummary(chatSessionId) {
  const { data } = await client.get(`/api/dashboard/summary/${chatSessionId}`);
  return data;
}
