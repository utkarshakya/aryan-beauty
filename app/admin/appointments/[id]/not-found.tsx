import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AppointmentNotFound() {
  return (
    <Container className="py-12 sm:py-16">
      <EmptyState
        title="Appointment not found"
        body="This appointment doesn't exist — it may have been removed, or the link is incorrect."
        actions={
          <ButtonLink href="/admin">Back to dashboard</ButtonLink>
        }
      />
    </Container>
  );
}
