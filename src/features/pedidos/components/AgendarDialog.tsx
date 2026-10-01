import { useTecnicos } from '@/features/agenda/hooks/useTecnicos'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AgendarDialog({
  aberto,
  tecnicoId,
  dataLocal,
  pendente,
  onOpenChange,
  onTecnico,
  onData,
  onConfirmar,
}: {
  aberto: boolean
  tecnicoId: string
  dataLocal: string
  pendente: boolean
  onOpenChange: (aberto: boolean) => void
  onTecnico: (id: string) => void
  onData: (valor: string) => void
  onConfirmar: () => void
}) {
  const tecnicos = useTecnicos()

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar instalação</DialogTitle>
          <DialogDescription>Técnico e data são obrigatórios para sair de aprovado.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Técnico</Label>
            <Select value={tecnicoId || undefined} onValueChange={onTecnico}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {(tecnicos.data ?? []).map((tecnico) => (
                  <SelectItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nome} — {tecnico.especialidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="data-instalacao">Data e horário</Label>
            <Input id="data-instalacao" type="datetime-local" value={dataLocal} onChange={(event) => onData(event.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onConfirmar} disabled={pendente}>
            Confirmar agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
