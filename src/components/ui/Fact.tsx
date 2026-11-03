interface Props {
  label: string
  value: string
  detail?: string
  highlight?: boolean
}

/** Uma medida em destaque: rótulo pequeno, valor grande e detalhe opcional. */
export default function Fact({ label, value, detail, highlight = false }: Props) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
      <dt className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="break-words font-mono text-lg font-black text-slate-900">{value}</dd>
      {detail && <dd className="text-xs leading-snug text-slate-600">{detail}</dd>}
    </div>
  )
}
