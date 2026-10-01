import { House } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { ConfiguracaoAusente } from '@/features/auth/components/ConfiguracaoAusente'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function LoginPage() {
  const { session, loading, configurado } = useAuth()

  if (!configurado) return <ConfiguracaoAusente />
  if (!loading && session) return <Navigate to="/" replace />

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15">
            <House className="size-5" />
          </span>
          <p className="text-lg font-semibold">SmartLar</p>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Instalações residenciais, do orçamento ao faturado.
          </h1>
          <p className="mt-4 text-primary-foreground/80">
            Rafael acompanha o que entrou, o que está na agenda e o que ainda tem a receber. Lucas e Pedro atualizam o serviço do dia.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">Orçamento, agenda e conclusão no mesmo fluxo.</p>
      </section>
      <section className="flex items-center justify-center bg-background p-4 sm:p-8">
        <Card className="w-full max-w-md border-0 shadow-none ring-0 lg:shadow-sm lg:ring-1">
          <CardHeader>
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>Use o usuário criado no Supabase Authentication.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
