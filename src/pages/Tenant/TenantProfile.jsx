import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Shared/Card";

export default function TenantProfile() {
  const { user } = useAuth();
  return (
    <Card className="space-y-2">
      <h2 className="font-semibold">Profile</h2>
      <div>
        <strong>Name:</strong> {user?.displayName || "-"}
      </div>
      <div>
        <strong>Email:</strong> {user?.email}
      </div>
      <div className="text-sm text-gray-500">Edit UI left for later.</div>
    </Card>
  );
}
