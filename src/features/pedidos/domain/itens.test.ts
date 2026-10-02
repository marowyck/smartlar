import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { planejarAlteracaoItens, precoParaEdicao, type ItemSalvo } from './itens.ts'

const salvos: ItemSalvo[] = [
  { id: 'linha-camera', produtoId: 'camera', quantidade: 2, precoUnitario: 450 },
  { id: 'linha-sensor', produtoId: 'sensor', quantidade: 1, precoUnitario: 180 },
]

describe('plano de alteração dos itens', () => {
  it('atualiza só a quantidade quando o produto permanece', () => {
    const plano = planejarAlteracaoItens(salvos, [
      { id: 'linha-camera', produtoId: 'camera', quantidade: 3 },
      { id: 'linha-sensor', produtoId: 'sensor', quantidade: 1 },
    ])
    assert.deepEqual(plano, {
      atualizar: [{ id: 'linha-camera', quantidade: 3 }],
      inserir: [],
      excluir: [],
    })
  })

  it('não gera operação quando nada mudou', () => {
    const plano = planejarAlteracaoItens(salvos, [
      { id: 'linha-camera', produtoId: 'camera', quantidade: 2 },
      { id: 'linha-sensor', produtoId: 'sensor', quantidade: 1 },
    ])
    assert.deepEqual(plano, { atualizar: [], inserir: [], excluir: [] })
  })

  it('exclui a linha removida e insere a linha nova', () => {
    const plano = planejarAlteracaoItens(salvos, [
      { id: 'linha-camera', produtoId: 'camera', quantidade: 2 },
      { produtoId: 'fechadura', quantidade: 1 },
    ])
    assert.deepEqual(plano, {
      atualizar: [],
      inserir: [{ produtoId: 'fechadura', quantidade: 1 }],
      excluir: ['linha-sensor'],
    })
  })

  it('troca o produto excluindo a linha antiga e inserindo outra', () => {
    const plano = planejarAlteracaoItens(salvos, [
      { id: 'linha-camera', produtoId: 'fechadura', quantidade: 2 },
      { id: 'linha-sensor', produtoId: 'sensor', quantidade: 4 },
    ])
    assert.deepEqual(plano.atualizar, [{ id: 'linha-sensor', quantidade: 4 }])
    assert.deepEqual(plano.inserir, [{ produtoId: 'fechadura', quantidade: 2 }])
    assert.deepEqual(plano.excluir, ['linha-camera'])
  })
})

describe('preço na edição do orçamento', () => {
  it('mantém o preço gravado enquanto o produto da linha não muda', () => {
    assert.equal(
      precoParaEdicao({ id: 'linha-camera', produtoId: 'camera' }, salvos, 500),
      450,
    )
  })

  it('usa o catálogo quando a linha é nova ou o produto foi trocado', () => {
    assert.equal(precoParaEdicao({ produtoId: 'fechadura' }, salvos, 320), 320)
    assert.equal(
      precoParaEdicao({ id: 'linha-camera', produtoId: 'fechadura' }, salvos, 320),
      320,
    )
  })
})
