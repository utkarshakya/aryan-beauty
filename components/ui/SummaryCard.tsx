import { Card } from "./Card";

export type SummaryCardProps = {
  label: string;
  value: number;
  detail?: string;
  className?: string;
};

export function SummaryCard({
  label,
  value,
  detail,
  className,
}: SummaryCardProps) {
  return (
    <Card className={className ? `p-3 sm:p-5 ${className}` : "p-3 sm:p-5"}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-[11px] text-muted sm:text-xs">{detail}</p>
      ) : null}
    </Card>
  );
}
