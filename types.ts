export interface Log {
  _id?: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LogFormData {
  title: string;
  content: string;
  tags: string; // Handle as comma-separated string in form
  date: string;
}