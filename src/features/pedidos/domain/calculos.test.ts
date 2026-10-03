import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { aplicarDesconto, calcularSubtotal, calcularTotal } from './calculos.ts'

describe('cálculos do pedido', () => {
  it('soma 2 câmeras e 1 sensor como no enunciado', () => {
    assert.equal(
      calcularTotal([
        { quantidade: 2, precoUnitario: 450 },
        { quantidade: 1, precoUnitario: 180 },
      ]),
      1080,
    )
  })

  it('arredonda o subtotal em centavos', () => {
    assert.equal(calcularSubtotal(3, 89.9), 269.7)
  })

  it('desconto zero mantém o total do enunciado', () => {
    assert.equal(aplicarDesconto(1080, 0), 1080)
  })

  it('abate o desconto do total', () => {
    assert.equal(aplicarDesconto(1080, 80), 1000)
  })

  it('não deixa o total negativo quando o desconto passa da soma', () => {
    assert.equal(aplicarDesconto(1080, 2000), 0)
  })
})
