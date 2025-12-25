import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div class="animate-in fade-in duration-300" div
      className={cn("relative", sizeClasses[size], className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div class="animate-in fade-in duration-300" div
        className="absolute inset-0 rounded-full border-2 border-primary/20"
      />
      <div class="animate-in fade-in duration-300" div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>div>
  );
}

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = "Loading..." }: PageLoaderProps) {
  return (
    <div class="animate-in fade-in duration-300" div 
      className="flex flex-col items-center justify-center min-h-[400px] gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingSpinner size="lg" />
      <div class="animate-in fade-in duration-300" p 
        className="text-muted-foreground text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {text}
      </div>p>
    </div>div>
  );
}

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div class="animate-in fade-in duration-300" div
      className={cn("rounded-md bg-muted p-4 space-y-3", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-4 bg-muted-foreground/10 rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-muted-foreground/10 rounded w-1/2 animate-pulse" />
      <div className="h-8 bg-muted-foreground/10 rounded w-full animate-pulse" />
    </div>div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div class="animate-in fade-in duration-300" div
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-10 bg-muted rounded animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div class="animate-in fade-in duration-300" div
          key={i}
          className="h-14 bg-muted/60 rounded animate-pulse"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </div>div>
  );
}
