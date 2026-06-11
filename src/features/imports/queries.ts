import { queryOptions } from "@tanstack/react-query";
import { getImportStatuses } from "@/lib/plant.functions";

export const importQueries = {
  all: () => ["imports"] as const,
  statuses: () =>
    queryOptions({
      queryKey: [...importQueries.all(), "statuses"] as const,
      queryFn: getImportStatuses,
    }),
};
