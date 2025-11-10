export default function Progress({ value = 0 }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 bg-gray-200 rounded">
      <div className="h-2 bg-blue-600 rounded" style={{ width: `${v}%` }} />
    </div>
  );
}
