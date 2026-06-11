import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    organisationId: number;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      organisationId: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    organisationId: number;
  }
}