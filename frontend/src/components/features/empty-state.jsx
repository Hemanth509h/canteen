import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  iconeact.ReactNode;
  titletring;
  descriptiontring;
  actionLabel?tring;
  onAction?: () => void;
  data_testid?tring;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  data_testid,
}mptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center" data-testid={data_testid}>
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid={`button-${actionLabel.toLowerCase().replace(/\s+/g, '-')}`}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
