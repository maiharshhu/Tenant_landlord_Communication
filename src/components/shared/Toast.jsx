import { Link } from "react-router-dom";

export default function Toast({
  title = "Notification",
  message,
  onClose,
  link,
}) {
  return (
    <div className="fixed right-4 bottom-4 bg-white border shadow rounded-2xl p-4 w-80 animate-in fade-in zoom-in">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm text-gray-700">{message}</div>
      <div className="flex justify-end gap-2 mt-3">
        {link ? (
          <Link className="text-sm underline" to={link}>
            Open
          </Link>
        ) : null}
        <button className="text-sm" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
