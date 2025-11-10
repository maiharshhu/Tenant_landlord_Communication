import MaintenanceRequestForm from "../../components/Maintenance/MaintenanceRequestForm";

export default function NewRequest() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">New Maintenance Request</h1>
      <MaintenanceRequestForm />
    </div>
  );
}
