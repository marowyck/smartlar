import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { textoOrcamentoWhatsapp } from './orcamento.ts'

describe('texto do orçamento', () => {
  it('inclui o total do enunciado e o desconto quando existe', () => {
    const texto = textoOrcamentoWhatsapp({
      numero: 9,
      clienteNome: 'Elena Rocha',
      itens: [
        { quantidade: 2, nome: 'Câmera IP', subtotal: 900 },
        { quantidade: 1, nome: 'Sensor de presença', subtotal: 180 },
      ],
      desconto: 0,
      valorTotal: 1080,
    })
    assert.match(texto, /Elena Rocha/)
    assert.match(texto, /#009/)
    assert.match(texto, /R\$\s*1\.080,00/)
    assert.doesNotMatch(texto, /Desconto/)
  })
})
