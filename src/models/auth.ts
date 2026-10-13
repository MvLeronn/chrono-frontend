export interface PublicUser {
  id: string;
  timezone: string;
}

export interface LoginResponse {
  token: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: PublicUser;
}
