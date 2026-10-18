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
    <Card className={className ? `p-4 sm:p-5 ${className}` : "p-4 sm:p-5"}>
      <p className="text-meta font-medium text-muted">{label}</p>
      <p className="mt-1 text-stat font-bold text-foreground sm:text-stat">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-meta text-muted">{detail}</p>
      ) : null}
    </Card>
  );
}
