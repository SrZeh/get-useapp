import { getAuth, type Auth } from "firebase/auth";
export function createAuth(app: any): Auth {
  return getAuth(app);
}
