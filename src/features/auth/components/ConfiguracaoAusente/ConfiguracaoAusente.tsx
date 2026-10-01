import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ConfiguracaoAusente() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Conecte o Supabase</CardTitle>
          <CardDescription>O frontend já está pronto, mas ainda não tem as chaves do projeto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Copie `.env.example` para `.env`.</p>
          <p>2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com a chave anon.</p>
          <p>
            3. No SQL Editor do Supabase, rode nesta ordem: `0001_schema.sql`, `0002_functions.sql`,
            `0003_rls.sql` e `seed.sql`.
          </p>
          <p>4. Crie um usuário em Authentication e entre com o e-mail e a senha.</p>
        </CardContent>
      </Card>
    </div>
  )
}
