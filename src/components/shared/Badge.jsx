export default function Badge({ children, color = "gray" }) {
  const cls =
    {
      gray: "bg-gray-100 text-gray-800",
      blue: "bg-blue-100 text-blue-800",
      amber: "bg-amber-100 text-amber-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      violet: "bg-violet-100 text-violet-800",
    }[color] || "bg-gray-100 text-gray-800";
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}
