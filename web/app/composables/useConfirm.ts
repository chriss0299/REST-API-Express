import { useQuasar } from 'quasar'

export function useConfirm() {
  const $q = useQuasar()

  function confermaElimina(messaggio = 'Sei sicuro di voler eliminare questo elemento?'): Promise<boolean> {
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Conferma eliminazione',
        message: messaggio,
        cancel: { label: 'Annulla', flat: true, color: 'grey' },
        ok: { label: 'Elimina', color: 'negative', unelevated: true },
        persistent: true,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
        .onDismiss(() => resolve(false))
    })
  }

  return { confermaElimina }
}
