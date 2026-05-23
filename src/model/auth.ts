export interface AuthUser {
  id: string;
  personId: 'alex' | 'yuka';
  name: string;
  color: string;
}

export interface AuthCouple {
  id: string;
  startedDate: string;
  weekGoal: number;
}

export interface LoginRequest {
  code: string;
  who: 'alex' | 'yuka';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  couple: AuthCouple;
}
