import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { STATUS_PEDIDO, podeTransitar } from './status.ts'

describe('fluxo de status', () => {
  it('permite só o caminho definido no enunciado', () => {
    assert.equal(podeTransitar('orcamento', 'aprovado'), true)
    assert.equal(podeTransitar('orcamento', 'cancelado'), true)
    assert.equal(podeTransitar('aprovado', 'agendado'), true)
    assert.equal(podeTransitar('aprovado', 'cancelado'), true)
    assert.equal(podeTransitar('agendado', 'em_andamento'), true)
    assert.equal(podeTransitar('em_andamento', 'concluido'), true)
  })

  it('não deixa pular etapa nem voltar', () => {
    assert.equal(podeTransitar('orcamento', 'em_andamento'), false)
    assert.equal(podeTransitar('orcamento', 'agendado'), false)
    assert.equal(podeTransitar('orcamento', 'concluido'), false)
    assert.equal(podeTransitar('aprovado', 'em_andamento'), false)
    assert.equal(podeTransitar('agendado', 'concluido'), false)
    assert.equal(podeTransitar('agendado', 'cancelado'), false)
    assert.equal(podeTransitar('em_andamento', 'cancelado'), false)
    assert.equal(podeTransitar('concluido', 'orcamento'), false)
    assert.equal(podeTransitar('cancelado', 'aprovado'), false)
  })

  it('cobre todos os status na matriz', () => {
    for (const origem of STATUS_PEDIDO) {
      for (const destino of STATUS_PEDIDO) {
        assert.equal(typeof podeTransitar(origem, destino), 'boolean')
      }
    }
  })
})
