import { Card, CardContent } from '@/components/ui/card'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="page-container flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-sm font-bold">
            N
          </div>
          <div>
            <p className="text-sm leading-tight font-semibold">NovaDrive</p>
            <p className="text-muted-foreground text-xs leading-tight">Panel de suscripciones</p>
          </div>
        </div>

        <Card className="surface-panel">
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold tracking-tight">Acceso al panel</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Inicia sesión con un usuario operador.
            </p>
            <div className="mt-6">
              <LoginForm />
            </div>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mt-4 text-center text-xs">NovaDrive · Uso interno</p>
      </div>
    </main>
  )
}
