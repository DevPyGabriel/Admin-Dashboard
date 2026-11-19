import { supabase } from '@/lib/supabase/client'

/** Error thrown when an Edge Function invocation fails. */
export class EdgeFunctionError extends Error {
  readonly functionName: string

  constructor(message: string, functionName: string, cause?: unknown) {
    super(message, { cause })
    this.name = 'EdgeFunctionError'
    this.functionName = functionName
  }
}

/**
 * Invoke a Supabase Edge Function with a typed request and response.
 *
 * Feature services should call this helper instead of talking to Supabase
 * directly so errors are handled consistently across the application.
 */
export async function invokeEdgeFunction<TResponse, TRequest>(
  functionName: string,
  body: TRequest,
): Promise<TResponse> {
  const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
    body: body as Record<string, unknown>,
  })

  if (error) {
    throw new EdgeFunctionError(
      `Edge Function "${functionName}" failed: ${error.message}`,
      functionName,
      error,
    )
  }

  if (data === null) {
    throw new EdgeFunctionError(
      `Edge Function "${functionName}" returned an empty response`,
      functionName,
    )
  }

  return data
}
