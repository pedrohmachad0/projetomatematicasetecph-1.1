import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Página não encontrada</p>
      <h1 className="mt-2 text-2xl font-black text-slate-900">Este caminho não existe</h1>
      <p className="mt-2 text-sm text-slate-600">O endereço pode ter mudado. Volte ao catálogo para escolher um simulador.</p>
      <Link to="/" className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700">
        Ver simuladores
      </Link>
    </section>
  )
}
