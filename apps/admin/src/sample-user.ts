export interface User {
  id: number;
  username: string;
  role: "admin" | "editor" | "viewer";
}

export const isAdmin = (user: User): boolean => {
  return user.role === "admin";
};

