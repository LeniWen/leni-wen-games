import { useSnapshot } from 'valtio'
import { Close } from './icons/close'
import type { Notification as INotification } from '~/store/notificationStore'
import { notificationStore, remove } from '~/store/notificationStore'

export function Notifications() {
  const { notifications } = useSnapshot(notificationStore)

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-end justify-end space-y-4 px-4 py-6 sm:p-6">
      {notifications.map(n => (
        <Notification key={n.id} notification={n} />
      ))}
    </div>
  )
}

function Notification({ notification }: { notification: INotification }) {
  return (
    <div className="flex items-center gap-3 rounded-sm border-l-4 border-l-[#5b9bd5] bg-[#f0f4f8] px-4 py-2 text-[#333]">
      <p>{notification.message}</p>
      <button className="hover:text-[#ff4d4f]" onClick={() => remove(notification.id)}>
        <Close />
      </button>
    </div>
  )
}
