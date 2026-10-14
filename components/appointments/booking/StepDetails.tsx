import { Field, Input } from "@/components/ui";

export default function StepDetails({
  phone,
  onPhoneChange,
  phoneError,
}: {
  phone: string;
  onPhoneChange: (phone: string) => void;
  phoneError?: string;
}) {
  return (
    <Field
      label={
        <>
          Mobile <span className="font-normal text-muted">(optional)</span>
        </>
      }
      error={phoneError}
    >
      <Input
        id="phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="numeric"
        enterKeyHint="done"
        placeholder="10-digit mobile number"
        value={phone}
        onChange={(event) => onPhoneChange(event.target.value)}
      />
    </Field>
  );
}
