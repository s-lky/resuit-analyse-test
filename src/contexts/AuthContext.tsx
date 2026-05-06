import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/api';
// 注意：authApi 是实际值，不是类型，保持普通导入即可
import { authApi } from '../api/auth';

interface AuthContextType{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () =>{
    const context = useContext(AuthContext);
    if(context === undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps{
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) =>{
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = (token: string, userData: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () =>{
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const checkAuth = async () => {
        try{
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');

            if(token && storedUser){
                const currentUser = await authApi.getCurrentUser();
                setUser(currentUser);
            }else{
                setUser(null);
            }
        }catch(error){
            console.error('Auth check failed:', error);
            logout();
        }finally{
            setIsLoading(false);
        }
    };

    useEffect(() =>{
        checkAuth();
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};