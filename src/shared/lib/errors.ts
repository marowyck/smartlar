export function mensagemErro(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Erro inesperado'
  const texto = raw.replace(/^.*ERROR:\s*/i, '').trim()

  if (/invalid login credentials/i.test(texto)) return 'E-mail ou senha incorretos.'
  if (/email not confirmed/i.test(texto)) return 'Confirme o e-mail antes de entrar.'
  if (/duplicate key/i.test(texto)) return 'Esse registro já existe.'
  if (/jwt|session/i.test(texto)) return 'Sua sessão expirou. Entre de novo.'
  if (/permission denied|row-level security/i.test(texto)) {
    return 'Sem permissão para esta operação. Confira se você está autenticado e se o RLS foi aplicado.'
  }

  return texto || 'Erro inesperado'
}
