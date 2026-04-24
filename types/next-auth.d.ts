import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  // Augment the User object returned from authorize()
  interface User {
    username:     string;
    role:         string;
    status:       string;
    staff_id:     number | null;
    accessToken:  string;
    refreshToken: string;
  }

  // Augment the Session object available via useSession()
  interface Session {
    accessToken:  string;
    refreshToken: string;
    user: {
      name?:    string | null;
      image?:   string | null;
      userId:   string;
      username: string;
      role:     string;
      status:   string;
      staff_id: number | null;
    };
  }
}

declare module "next-auth/jwt" {
  // Augment the JWT token stored server-side
  interface JWT {
    accessToken:  string;
    refreshToken: string;
    userId:       string;
    username:     string;
    role:         string;
    status:       string;
    staff_id:     number | null;
  }
}