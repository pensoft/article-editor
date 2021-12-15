export interface IAuthToken {
  accessToken: string;
  status: string;
  expiresIn: number
}

export interface IUserDetail {
  email: string;
  password: string;
}

