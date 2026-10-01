import type { ReactNode } from 'react'

export type FieldProps = {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}
