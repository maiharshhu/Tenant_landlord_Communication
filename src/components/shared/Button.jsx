export default function Button({
  as: Tag = "button",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-xl shadow text-sm font-medium transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white";
  return <Tag className={`${base} ${className}`} {...props} />;
}
