export default function MessageBubble({ mine, text, time }) {
  return (
    <div
      className={`max-w-[75%] rounded-2xl px-4 py-2 mb-2 ${
        mine ? "bg-blue-600 text-white ml-auto" : "bg-gray-100"
      }`}
    >
      <div className="text-sm">{text}</div>
      <div className="text-[10px] opacity-70 mt-1 text-right">{time}</div>
    </div>
  );
}
