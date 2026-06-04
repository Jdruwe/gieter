import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import type { ComponentProps } from "react";
import { ImportPlantForm } from "@/components/plants/import-plant-form.tsx";

interface ImportPlantDialogProps extends ComponentProps<typeof Dialog> {}

function ImportPlantDialog({ ...props }: ImportPlantDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import new plant</DialogTitle>
          <DialogDescription>
            Enter the name of your plant to automatically create a maintenance
            plan with recommended watering, fertilizing, pruning, and inspection
            tasks.
          </DialogDescription>
        </DialogHeader>
        <ImportPlantForm />
      </DialogContent>
    </Dialog>
  );
}

export { ImportPlantDialog, type ImportPlantDialogProps };
