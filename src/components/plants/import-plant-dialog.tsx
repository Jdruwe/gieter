import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import type { ComponentProps } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importPlant } from "@/lib/plant.functions.ts";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button.tsx";
import z from "zod";
import { Spinner } from "@/components/ui/spinner.tsx";

const formSchema = z.object({
  name: z.string().min(1, "Plant name is required."),
});

interface ImportPlantDialogProps extends ComponentProps<typeof Dialog> {}

function ImportPlantDialog({ ...props }: ImportPlantDialogProps) {
  const queryClient = useQueryClient();

  const importPlantMutation = useMutation({
    mutationFn: (name: string) => importPlant({ data: { plant: name } }),
    onSuccess: () => {
      toast.success(`Import started for "${form.state.values.name}".`);
      void queryClient.invalidateQueries({ queryKey: ["importStatuses"] });
      form.reset();
    },
    onError: () => {
      toast.error("Import failed");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("OnSubmit called");
      await importPlantMutation.mutateAsync(value.name);
    },
  });

  return (
    <Dialog {...props}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>Import new plant</DialogTitle>
            <DialogDescription>
              Enter the name of your plant to automatically create a maintenance
              plan with recommended watering, fertilizing, pruning, and
              inspection tasks.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g. Monstera deliciosa"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting && <Spinner data-icon="inline-start" />} Submit
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ImportPlantDialog, type ImportPlantDialogProps };
