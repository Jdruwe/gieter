import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { importPlant } from "@/lib/plant.functions";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

const formSchema = z.object({
  name: z.string().min(1, "Plant name is required."),
});

interface ImportPlantFormProps {
  onSubmitted?: () => void;
}

function ImportPlantForm({ onSubmitted }: ImportPlantFormProps) {
  const queryClient = useQueryClient();

  const importPlantMutation = useMutation({
    mutationFn: (name: string) => importPlant({ data: { plant: name } }),
    onSuccess: () => {
      toast.success(`Import started for "${form.state.values.name}".`);
      void queryClient.invalidateQueries({ queryKey: ["importStatuses"] });
      form.reset();
      onSubmitted?.();
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
      await importPlantMutation.mutateAsync(value.name);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      id="import-plant-form"
    >
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
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting && <Spinner data-icon="inline-start" />} Submit
          </Button>
        )}
      />
    </form>
  );
}

export { ImportPlantForm, type ImportPlantFormProps };
