import { UserRole } from '../App';

export type NavigateFn = (
  page: string,
  role?: UserRole,
  state?: any
) => void;
