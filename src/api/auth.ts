import { http } from '@/lib/http';
import { ENDPOINTS } from '@shared/api';
import type { LoginRequest, LoginResponse } from '@/model/auth';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>(ENDPOINTS.auth.login, payload);
  return data;
}
