import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CheckoutRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useMyOrders() {
  return useQuery({
    queryKey: [api.orders.myOrders.path],
    queryFn: async () => {
      const res = await fetch(api.orders.myOrders.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      return parseWithLogging(api.orders.myOrders.responses[200], data, "orders.myOrders");
    },
  });
}

export function useAllOrders() {
  return useQuery({
    queryKey: [api.orders.all.path],
    queryFn: async () => {
      const res = await fetch(api.orders.all.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch all orders");
      const data = await res.json();
      return parseWithLogging(api.orders.all.responses[200], data, "orders.all");
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: CheckoutRequest) => {
      const res = await fetch(api.orders.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");
      return parseWithLogging(api.orders.create.responses[201], data, "orders.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.myOrders.path] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.orders.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      return parseWithLogging(api.orders.updateStatus.responses[200], data, "orders.updateStatus");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.all.path] });
      queryClient.invalidateQueries({ queryKey: [api.orders.myOrders.path] });
    },
  });
}
