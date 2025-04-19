'use client'

import { Session } from "next-auth"
import { SessionProvider, useSession } from "next-auth/react";
import { createContext, useContext } from "react";

type AuthContextType = {
    session: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    status: 'loading',
    isAuthenticated: false
})

const InnerAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession()
    const value: AuthContextType = {
        session,
        status,
        isAuthenticated: status === "authenticated"
    }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return <SessionProvider><InnerAuthProvider>{children}</InnerAuthProvider></SessionProvider>

}

export const useAuth = () => useContext(AuthContext)