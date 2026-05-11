import { Notify } from 'quasar'

export function useToast() {
  return {
    toastErrore: (msg: string) =>
      Notify.create({ type: 'negative', message: msg, timeout: 4000, position: 'top-right' }),
    toastSuccesso: (msg: string) =>
      Notify.create({ type: 'positive', message: msg, timeout: 3000, position: 'top-right' }),
    toastInfo: (msg: string) =>
      Notify.create({ type: 'info', message: msg, timeout: 3000, position: 'top-right' }),
  }
}
