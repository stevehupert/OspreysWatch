// One labelled value in a status line, such as "Health 7 / 10". Use inside a <dl>.

export function Stat({
  label,
  value,
}: {
  readonly label: string
  readonly value: string | number
}) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
