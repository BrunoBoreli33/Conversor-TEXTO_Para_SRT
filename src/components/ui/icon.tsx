import { cn } from "@/lib/utils";
type IconName =
  | "spark"
  | "arrow"
  | "download"
  | "copy"
  | "trash"
  | "file"
  | "check"
  | "clock";
export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg className={cn("icon", className)} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
