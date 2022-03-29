//import { IRule } from "./rule.interface";

export interface IAuthToken {
  accessToken: string;
  status: string;
  expiresIn: number
}

export interface IUserDetail {
  email: string;
  name?: string;
  password: string;
}