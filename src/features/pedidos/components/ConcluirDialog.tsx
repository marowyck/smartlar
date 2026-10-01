import { FORMAS_PAGAMENTO, type FormaPagamento } from '@/utils/money'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ConcluirDialog({
  aberto,
  pagamento,
  pendente,
  onOpenChange,
  onPagamento,
  onConfirmar,
}: {
  aberto: boolean
  pagamento: FormaPagamento
  pendente: boolean
  onOpenChange: (aberto: boolean) => void
  onPagamento: (valor: FormaPagamento) => void
  onConfirmar: () => void
}) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Concluir instalação</DialogTitle>
          <DialogDescription>Informe como o cliente pagou para o controle do faturamento.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label>Forma de pagamento</Label>
          <Select value={pagamento} onValueChange={(value) => onPagamento(value as FormaPagamento)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAS_PAGAMENTO.map((forma) => (
                <SelectItem key={forma.value} value={forma.value}>
                  {forma.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={onConfirmar} disabled={pendente}>
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
