export function apenasDigitos(telefone: string) {
  return telefone.replace(/\D/g, '')
}

export function linkTelefone(telefone: string) {
  return `tel:${apenasDigitos(telefone)}`
}

export function linkWhatsapp(telefone: string, texto?: string) {
  const digitos = apenasDigitos(telefone)
  const comPais = digitos.startsWith('55') ? digitos : `55${digitos}`
  const base = `https://wa.me/${comPais}`
  if (!texto) return base
  return `${base}?text=${encodeURIComponent(texto)}`
}
