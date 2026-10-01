import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calcularSubtotal, calcularTotal } from './money.ts'

describe('cálculo do pedido', () => {
  it('soma 2 câmeras e 1 sensor como no enunciado', () => {
    assert.equal(
      calcularTotal([
        { quantidade: 2, precoUnitario: 450 },
        { quantidade: 1, precoUnitario: 180 },
      ]),
      1080,
    )
  })

  it('calcula subtotal com centavos', () => {
    assert.equal(calcularSubtotal(3, 89.9), 269.7)
  })

  it('ignora quantidade inválida sem quebrar o total', () => {
    assert.equal(calcularTotal([{ quantidade: Number.NaN, precoUnitario: 100 }]), 0)
  })
})
