import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps{
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps){
    const { isAuthenticated, isLoading } = useAuth();

    if(isLoading){
        return(
            <div className="flex items-center justify-center h-screen bg-bg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                    <p className="mt-4 text-text-secondary">加载中...</p>
                </div>
            </div>
        );
    }

    if(!isAuthenticated){
        return <Navigate to="login" replace/>;
    }

    return <>{children}</>;
}