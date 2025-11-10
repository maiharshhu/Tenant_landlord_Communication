import Card from "../Shared/Card";

const mock = [
  { id: "p1", month: "Aug 2025", amount: 1200, status: "Paid" },
  { id: "p2", month: "Sep 2025", amount: 1200, status: "Paid" },
  { id: "p3", month: "Oct 2025", amount: 1200, status: "Pending" },
];

export default function PaymentHistory() {
  return (
    <Card>
      <h3 className="font-semibold mb-3">Payment History</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">Month</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {mock.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="py-2">{r.month}</td>
              <td className="py-2">₹{r.amount}</td>
              <td className="py-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
