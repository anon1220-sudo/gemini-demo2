export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Log {
  _id?: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LogFormData {
  title: string;
  content: string;
  tags: string; // Handle as comma-separated string in form
  date: string;
  image?: string;
}