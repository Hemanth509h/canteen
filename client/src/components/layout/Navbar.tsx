import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Utensils, Calendar, Phone, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { title: "Home", href: "/", icon: Utensils },
    { title: "Track Booking", href: "/check-booking", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold tracking-tight">Ravi Canteen</span>
          </Link>
        </div>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                location === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
          <ThemeToggle />
          <Button size="sm" className="hidden sm:flex">
            Book Now
          </Button>
        </div>
      </div>
    </header>
  );
}
