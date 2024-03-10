import { proxy } from 'valtio'

const MAX_CLOSE_TIMEOUT = 5000

export interface Notification {
  type: 'error' | 'info' | 'success'
  message: string
  id: string
  title?: string
}
interface NotificationStore {
  notifications: Notification[]
}

export const notificationStore = proxy<NotificationStore>({
  notifications: [],
})

export function notify(n: Omit<Notification, 'id'>, autoClose: boolean = true) {
  const id = crypto.randomUUID()

  notificationStore.notifications.push({ ...n, id })
  if (autoClose) {
    setTimeout(() => {
      remove(id)
    }, MAX_CLOSE_TIMEOUT)
  }
}

export function remove(id: string) {
  const index = notificationStore.notifications.findIndex(n => n.id === id)

  if (index === -1)
    return
  notificationStore.notifications.splice(index, 1)
}
