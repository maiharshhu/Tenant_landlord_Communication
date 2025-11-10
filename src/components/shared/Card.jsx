export default function Card({ className = "", children }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow p-4 border border-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}
