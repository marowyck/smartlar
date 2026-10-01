import { z } from 'zod'

export const produtoSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome'),
  categoria: z.string().trim().min(1, 'Informe a categoria'),
  preco_unitario: z.number().positive('O preço precisa ser maior que zero'),
  descricao: z.string(),
})

export type ProdutoFormValues = z.infer<typeof produtoSchema>
