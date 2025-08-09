import { DefaultSession } from "next-auth";

export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

export type SessionUser = DefaultSession["user"] & {
  role?: string;
};

export type Count = {
  count: number;
};

export type Eater = {
  id: number;
  name: string;
  score: number;
};
