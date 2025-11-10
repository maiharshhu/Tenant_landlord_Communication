import MaintenanceRequestForm from "../../components/Maintenance/MaintenanceRequestForm.jsx";
import RequestTimeline from "../../components/Maintenance/RequestTimeline.jsx";
import AppointmentScheduler from "../../components/Maintenance/AppointmentScheduler.jsx";
import ChatInterface from "../../components/Messaging/ChatInterface.jsx";
import PaymentHistory from "../../components/Payments/PaymentHistory.jsx";
import RentCalendar from "../../components/Payments/RentCalendar.jsx";
import RequestList from "../../components/Maintenance/RequestList.jsx";
import Card from "../../components/Shared/Card.jsx";

export default function TenantDashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <MaintenanceRequestForm />
        <AppointmentScheduler />
        <PaymentHistory />
      </div>
      <div className="space-y-4">
        <RequestList />
        <Card>
          <h2 className="font-semibold mb-2">Tracking (pick a request)</h2>
          <RequestTimeline requestId={null} />
        </Card>
        <RentCalendar />
        <ChatInterface />
      </div>
    </div>
  );
}
