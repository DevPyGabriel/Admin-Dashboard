import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createClient,
  deleteClient,
  listClients,
  updateClient,
} from '@/features/clients/api/clients.api'
import type { ClientFormValues } from '@/features/clients/schemas/client.schema'

export const clientsQueryKey = ['clients'] as const

export function useClients() {
  return useQuery({
    queryKey: clientsQueryKey,
    queryFn: listClients,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ClientFormValues) => createClient(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientsQueryKey }),
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ClientFormValues }) =>
      updateClient(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientsQueryKey }),
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientsQueryKey }),
  })
}
