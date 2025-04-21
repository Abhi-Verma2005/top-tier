import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      isComplete: boolean; 
      githubUsername: string;
      githubAccessToken: string;
    };
  }

  interface JWT {
    githubAccessToken?: string | null;
  }
}
