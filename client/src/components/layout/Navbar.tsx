import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Utensils } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-bold tracking-tight">Elite Catering</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button size="sm" className="rounded-full px-6">
            Book Now
          </Button>
        </div>
      </div>
    </header>
  );
}
