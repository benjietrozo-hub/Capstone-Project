import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="lg:hidden text-white hover:bg-white/20 border border-white/30 h-9 w-9 p-0"
      aria-label="Toggle menu"
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
}
