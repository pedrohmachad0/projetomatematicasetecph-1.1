interface Props {
  className?: string
}

/** Assinatura discreta da escola onde a plataforma foi feita. Fica bem clara até o mouse passar por cima. */
export default function SchoolCredit({ className = '' }: Props) {
  return (
    <div className={`school-credit group mx-auto flex w-fit items-center gap-2 opacity-40 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 focus-within:opacity-100 focus-within:grayscale-0 ${className}`}>
      <img src="/logo-barbosa.webp" alt="Logo do Colégio Estadual Barbosa Ferraz" width={28} height={28} loading="lazy" className="h-7 w-7 shrink-0 rounded-full" />
      <p className="text-left text-[10px] leading-tight text-slate-500">
        Feito com carinho no <strong className="font-bold">Colégio Estadual Barbosa Ferraz</strong>
        <br />
        Ivaiporã · PR
      </p>
    </div>
  )
}
