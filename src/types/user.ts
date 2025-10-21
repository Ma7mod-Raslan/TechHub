// src/types/user.ts
export type Role = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: Role;
}
