import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteImportStatus, type ImportStatus } from "@/lib/plant.functions";
import { importQueries } from "@/features/imports/queries";
import { toast } from "sonner";

export function useDeleteImportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteImportStatus({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: importQueries.statuses().queryKey,
      });

      const previousStatuses = queryClient.getQueryData<ImportStatus[]>(
        importQueries.statuses().queryKey
      );

      queryClient.setQueryData<ImportStatus[]>(
        importQueries.statuses().queryKey,
        (old) => old?.filter((s) => s.id !== id) ?? []
      );

      return { previousStatuses };
    },
    onError: (_err, _id, context) => {
      if (context?.previousStatuses) {
        queryClient.setQueryData(
          importQueries.statuses().queryKey,
          context.previousStatuses
        );
      }
      toast.error("Failed to delete import");
    },
    onSuccess: () => {
      toast.success("Import deleted");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: importQueries.statuses().queryKey,
      });
    },
  });
}
