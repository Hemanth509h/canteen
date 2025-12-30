import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  openoolean;
  onOpenChange: (openoolean) => void;
  titletring;
  descriptiontring;
  confirmText?tring;
  cancelText?tring;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  isLoading?oolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  isLoading = false,
}onfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full">
        
          <DialogTitle className="text-lg sm:text-base">{title}</DialogTitle>
          <DialogDescription className="text-sm">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 flex-col-reverse sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            data-testid="button-cancel-confirm"
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isLoading}
            data-testid="button-confirm-action"
            className="w-full sm:w-auto"
          >
            {isLoading ? "Please wait..." onfirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
