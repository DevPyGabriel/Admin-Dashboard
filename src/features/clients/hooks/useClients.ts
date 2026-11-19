import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createClientService,
  deleteClient,
  listClientServices,
  registerPayment,
  unregisterPayment,
  updateClientService,
  type ClientService,
} from '@/features/clients/api/clients.api'
import type { ClientFormValues } from '@/features/clients/schemas/client.schema'

export const clientServicesQueryKey = ['client-services'] as const

function useInvalidateServices() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: clientServicesQueryKey })
}

export function useClientServices() {
  return useQuery({
    queryKey: clientServicesQueryKey,
    queryFn: listClientServices,
  })
}

export function useCreateClientService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: (values: ClientFormValues) => createClientService(values),
    onSuccess: invalidate,
  })
}

export function useUpdateClientService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: ({
      clientId,
      subscriptionId,
      values,
    }: {
      clientId: string
      subscriptionId: string
      values: ClientFormValues
    }) => updateClientService(clientId, subscriptionId, values),
    onSuccess: invalidate,
  })
}

export function useDeleteClient() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: (clientId: string) => deleteClient(clientId),
    onSuccess: invalidate,
  })
}

export function useRegisterPayment() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: (service: ClientService) => registerPayment(service),
    onSuccess: invalidate,
  })
}

export function useUnregisterPayment() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: (paymentId: string) => unregisterPayment(paymentId),
    onSuccess: invalidate,
  })
}
