// One labelled value in a status line, such as "Health 7 / 10". Use inside a <dl>.

export function Stat(props: {
  readonly label: string
  readonly value: string | number
  /** Extra class, for example to colour a warning. */
  readonly className?: string
}) {
  const { label, value, className } = props
  return (
    <div className={className ? `stat ${className}` : 'stat'}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
