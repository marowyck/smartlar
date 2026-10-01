import { z } from 'zod'

export const clienteSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome'),
  telefone: z.string().trim().min(1, 'Telefone é obrigatório (WhatsApp)'),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, 'E-mail inválido'),
  endereco: z.string().trim().min(1, 'Informe o endereço da instalação'),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>
