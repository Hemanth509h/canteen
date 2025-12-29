import { cn } from "@/lib/utils";

export function LoadingSpinner({ size = "md", className }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("relative animate-in fade-in duration-300", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
    </div>
  );
}

export function PageLoader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 animate-in fade-in duration-300">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm">
        {text}
      </p>
    </div>
  );
}

export function CardSkeleton({ className }) {
  return (
    <div className={cn("rounded-md bg-muted p-4 space-y-3 animate-in fade-in duration-300", className)}>
      <div className="h-4 bg-muted-foreground/10 rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-muted-foreground/10 rounded w-1/2 animate-pulse" />
      <div className="h-8 bg-muted-foreground/10 rounded w-full animate-pulse" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2 animate-in fade-in duration-300">
      <div className="h-10 bg-muted rounded animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 bg-muted/60 rounded animate-pulse"
        />
      ))}
    </div>
  );
}
