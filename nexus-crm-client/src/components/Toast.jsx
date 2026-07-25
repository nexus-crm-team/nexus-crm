import React from 'react';
import '../styles/toast.css';

export default function Toast({ notifications, onDismiss }) {
  return (
    <div className="toast-container">
      {notifications.map((notif) => (
        <div key={notif.id} className={`toast toast-${notif.type || 'info'}`}>
          <div className="toast-title">{notif.title}</div>
          <div className="toast-message">{notif.message}</div>
          <button
            className="toast-close"
            onClick={() => onDismiss(notif.id)}
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
