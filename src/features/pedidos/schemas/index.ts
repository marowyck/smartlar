import { z } from 'zod'

export const pedidoSchema = z
  .object({
    cliente_id: z.string().uuid('Selecione um cliente'),
    observacoes: z.string(),
    forma_pagamento: z.string(),
    desconto: z.number().min(0, 'Desconto não pode ser negativo'),
    itens: z
      .array(
        z.object({
          id: z.string().uuid().optional(),
          produto_id: z.string().uuid('Selecione um produto'),
          quantidade: z.number().int().positive('Quantidade inválida'),
        }),
      )
      .min(1, 'Adicione pelo menos um produto'),
  })
  .superRefine((value, ctx) => {
    const ids = value.itens.map((item) => item.produto_id).filter(Boolean)
    const repetido = ids.find((id, index) => ids.indexOf(id) !== index)
    if (repetido) {
      ctx.addIssue({
        code: 'custom',
        message: 'Não repita o mesmo produto. Aumente a quantidade na linha existente.',
        path: ['itens'],
      })
    }
  })

export type PedidoFormValues = z.infer<typeof pedidoSchema>
