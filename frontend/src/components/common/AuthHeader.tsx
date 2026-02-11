import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton = false,
  showHomeButton = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 relative overflow-hidden bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] text-white shadow-lg">
      <div className="relative z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20 border border-white/30 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {showHomeButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/20 border border-white/30 flex-shrink-0"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
              {subtitle && (
                <p className="text-white/80 text-sm truncate">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHeader;
