'use client';

/**
 * Example: Como Integrar Modal & Button Animations
 *
 * Este arquivo mostra exemplos práticos de como usar as novas animações
 * Modal/Dialog Animations e Button Ripple Effects
 */

// ============================================
// EXEMPLO 1: Dialog com Animação Modal
// ============================================

/*
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ExampleModalAnimation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="button-ripple">
        Abrir Modal
      </Button>

      {* A animação modal-scale-in é aplicada automaticamente via CSS *}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modal com Animação</DialogTitle>
            <DialogDescription>
              Esta caixa de diálogo tem animação de entrada e saída
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <p>Conteúdo do modal aqui</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
*/

// ============================================
// EXEMPLO 2: Usando Button com Ripple Effect
// ============================================

/*
import { Button } from '@/components/ui/button';

export function ExampleButtonRipple() {
  return (
    <div className="flex gap-4">
      {* O ripple effect está habilitado por padrão em todos os buttons *}
      <Button variant="default">Clique e veja o efeito ripple</Button>
      <Button variant="outline">Outline Button com Ripple</Button>
      <Button variant="ghost">Ghost Button com Ripple</Button>
      <Button variant="destructive">Destrutivo com Ripple</Button>
    </div>
  );
}
*/

// ============================================
// EXEMPLO 3: AlertDialog com Animação
// ============================================

/*
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function ExampleAlertDialogAnimation() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="button-ripple">
          Excluir Item
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isto excluirá permanentemente o item.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-4 justify-end">
          <AlertDialogCancel className="button-ripple">Cancelar</AlertDialogCancel>
          <AlertDialogAction className="button-ripple">Excluir</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
*/

// ============================================
// EXEMPLO 4: Modal com Ripple em Múltiplos Buttons
// ============================================

/*
export function ExampleFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="button-ripple">
        Criar Novo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Item</DialogTitle>
          </DialogHeader>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Digite o nome..."
              />
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="button-ripple"
              >
                Cancelar
              </Button>
              <Button 
                variant="default"
                className="button-ripple"
              >
                Criar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
*/

// ============================================
// RESUMO DE ANIMAÇÕES DISPONÍVEIS
// ============================================

/*
MODAL ANIMATIONS:
- .modal-transition-wrapper    → Scale in (300ms)
- .modal-scale-in              → Keyframe de entrada
- .modal-scale-out             → Keyframe de saída
- .dialog-fade-in              → Fade para diálogo
- .dialog-overlay              → Backdrop com fade
- .modal-exit                  → Saída do modal

BUTTON RIPPLE:
- .button-ripple               → Classe para aplicar ripple
- Efeito ondulação ao clicar   → Automático

PADRÃO:
Todas as animações são CSS-based (0 overhead no JS)
GPU-accelerated (usa transform/opacity)
Funciona em todos os navegadores modernos
*/

export default function ExamplesPlaceholder() {
  return (
    <div className="p-4 text-center text-muted-foreground">
      <p>Veja os exemplos comentados neste arquivo para implementar modal e button animations</p>
    </div>
  );
}
