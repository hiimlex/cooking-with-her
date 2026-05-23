import { http } from "@/lib/http";
import type { LoginRequest, LoginResponse } from "@/model/auth";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/auth/login", payload);
  return data;
}
