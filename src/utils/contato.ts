export function apenasDigitos(telefone: string) {
  return telefone.replace(/\D/g, '')
}

export function linkTelefone(telefone: string) {
  return `tel:${apenasDigitos(telefone)}`
}

export function linkWhatsapp(telefone: string) {
  const digitos = apenasDigitos(telefone)
  const comPais = digitos.startsWith('55') ? digitos : `55${digitos}`
  return `https://wa.me/${comPais}`
}
