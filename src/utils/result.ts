type ErroSupabase = { message: string } | null

export function garantir<T>(data: T | null, error: ErroSupabase): T {
  if (error) throw new Error(error.message)
  if (data == null) throw new Error('Resposta vazia do Supabase')
  return data
}

export function um<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export function termoBusca(busca: string): string {
  return busca.trim().replace(/[%_,]/g, '')
}
