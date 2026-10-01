import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calcularSubtotal, calcularTotal } from './calculos.ts'

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
})
