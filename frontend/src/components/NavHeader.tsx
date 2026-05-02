import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, Home } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface NavHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showHomeButton?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
}

const NavHeader: React.FC<NavHeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton = false, 
  showMenuButton = false, 
  showHomeButton = false, 
  onBack,
  children 
}) => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="sticky top-0 z-50 relative overflow-hidden bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] text-white shadow-lg">
      <div className="relative z-10 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack ? onBack : () => navigate(-1)}
                className="text-white hover:bg-white/20 border border-white/30 flex-shrink-0 h-9 px-2 sm:px-3"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            
            {showHomeButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/20 border border-white/30 flex-shrink-0 h-9 px-2 sm:px-3"
              >
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            )}
            
            {showMenuButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="text-white hover:bg-white/20 border border-white/30 lg:hidden flex-shrink-0 h-9 px-2"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate hidden sm:block">{title}</h1>
              {subtitle && (
                <p className="text-white/80 text-xs sm:text-sm truncate hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          {children && (
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
