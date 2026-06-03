import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { importPlant } from "@/lib/plant.functions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

const formSchema = z.object({
  name: z.string().min(1, "Plant name is required."),
});

interface ImportPlantProps {
  onSuccess?: () => void;
}

function ImportPlant({ onSuccess }: ImportPlantProps) {
  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await importPlant({ data: { plant: value.name } });
      toast.success(`Import started for "${value.name}".`);
      form.reset();
      onSuccess?.();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import new plant</CardTitle>
      </CardHeader>
      <CardContent>
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
                      disabled={form.state.isSubmitting}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="import-plant-form"
          disabled={form.state.isSubmitting}
        >
          {form.state.isSubmitting ? "Starting..." : "Import"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export { ImportPlant };
