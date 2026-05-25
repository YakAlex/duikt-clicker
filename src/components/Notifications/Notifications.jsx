import { useEffect } from 'react';
import styles from './Notifications.module.scss';

const TYPE_STYLE = {
  bonus:       { icon: '🎁', cls: 'bonus'       },
  success:     { icon: '✅', cls: 'success'     },
  danger:      { icon: '⚠️', cls: 'danger'      },
  info:        { icon: 'ℹ️', cls: 'info'        },
  achievement: { icon: '🏆', cls: 'achievement' },
  prestige:    { icon: '✨', cls: 'prestige'    },
};

function Toast({ notification, onDismiss }) {
  const { icon, cls } = TYPE_STYLE[notification.type] ?? TYPE_STYLE.info;

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => onDismiss(notification.id), 4000);
    return () => clearTimeout(t);
  }, [notification.id, onDismiss]);

  return (
    <div
      className={`${styles.toast} ${styles[cls]}`}
      onClick={() => onDismiss(notification.id)}
      role="alert"
    >
      <span className={styles.toastIcon}>{icon}</span>
      <span className={styles.toastMsg}>{notification.message}</span>
      <button className={styles.toastClose} onClick={() => onDismiss(notification.id)}>✕</button>
    </div>
  );
}

export default function Notifications({ notifications, onDismiss }) {
  // Keep only the latest 5 to avoid screen flooding
  const visible = notifications.slice(-5);
  if (!visible.length) return null;

  return (
    <div className={styles.stack} aria-live="polite">
      {visible.map((n) => (
        <Toast key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
