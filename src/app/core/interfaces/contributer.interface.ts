import { IRule } from './rule.interface';

export interface IContributersData {
  userId?: string;
  avatar: string;
  name: string;
  role?: IRule;
  userIsAdded?: boolean;
}
