import client from './client';

export async function getDashboard(analysisId) {
  const { data } = await client.get(`/api/dashboard/${analysisId}`);
  return data;
}
