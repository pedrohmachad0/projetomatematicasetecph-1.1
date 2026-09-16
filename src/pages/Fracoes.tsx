import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Divide, Lightbulb, RotateCcw, ArrowRight } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'

function gcd(a: number, b: number): number {
  let left = Math.abs(a)
  let right = Math.abs(b)
  while (right !== 0) {
    const remainder = left % right
    left = right
    right = remainder
  }
  return left || 1
}

function formatDecimal(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 4 })
}

function FractionDisplay({ numerator, denominator, className = '' }: { numerator: number; denominator: number; className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center justify-center leading-none ${className}`} aria-label={`${numerator} sobre ${denominator}`}>
      <span className="border-b-2 border-current px-3 pb-1">{numerator}</span>
      <span className="px-3 pt-1">{denominator}</span>
    </span>
  )
}

export default function Fracoes() {
  const [numerator, setNumerator] = useState(1)
  const [denominator, setDenominator] = useState(4)

  const simplified = useMemo(() => {
    const divisor = gcd(numerator, denominator)
    return { numerator: numerator / divisor, denominator: denominator / divisor }
  }, [numerator, denominator])

  const decimal = denominator === 0 ? 0 : numerator / denominator
  const percentage = decimal * 100

  function reset() {
    setNumerator(1)
    setDenominator(4)
  }

  return (
    <PresentationMode title="Explorador de Frações">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 rounded text-xs font-medium text-blue-700 hover:underline sm:mb-6 sm:text-sm"><ArrowLeft size={16} /> Voltar ao início</Link>

        <header className="mb-5 text-center sm:mb-7 sm:text-left">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-black text-indigo-800"><Divide size={15} /> FUNDAMENTAL II · 6º ANO</div>
          <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">Explorador de Frações</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">Entenda uma fração dividindo um inteiro em partes iguais e destacando somente as partes escolhidas.</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-900 sm:text-xl">Monte sua fração</h2><p className="text-xs text-slate-500 sm:text-sm">O denominador divide o inteiro em partes iguais; o numerador indica quantas partes serão destacadas.</p></div><button type="button" onClick={reset} aria-label="Resetar fração" className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"><RotateCcw size={14} /> Resetar</button></div>

            <div className="mb-6 flex items-center justify-center text-5xl font-black text-slate-900 sm:text-7xl" aria-live="polite"><FractionDisplay numerator={numerator} denominator={denominator} /></div>

            <div className="rounded-3xl bg-slate-50 p-5 sm:p-8">
              <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500"><span>Inteiro: {denominator} partes iguais</span><span>{numerator}/{denominator}</span></div>
              <div className="grid min-h-24 gap-1.5 rounded-2xl border-4 border-indigo-950 bg-white p-1.5 sm:min-h-32" style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }} role="img" aria-label={`${numerator} de ${denominator} partes do inteiro destacadas`}>
                {Array.from({ length: denominator }, (_, index) => <div key={index} className={`relative flex items-center justify-center rounded-lg border-2 text-sm font-black transition-colors sm:text-base ${index < numerator ? 'border-indigo-600 bg-indigo-500 text-white' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>{index + 1}</div>)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs font-bold sm:text-sm"><div className="rounded-xl bg-indigo-100 p-3 text-indigo-900"><strong className="block text-lg sm:text-xl">{numerator}</strong>partes destacadas</div><div className="rounded-xl bg-slate-200 p-3 text-slate-700"><strong className="block text-lg sm:text-xl">{denominator}</strong>partes no inteiro</div></div>
            </div>
            <p className="mb-5 mt-4 text-center text-xs font-semibold text-slate-500">O inteiro foi dividido em {denominator} partes iguais. {numerator} parte{numerator === 1 ? '' : 's'} está{numerator === 1 ? '' : 'ão'} destacada{numerator === 1 ? '' : 's'}.</p>
            <div className="space-y-5"><label className="block text-sm font-bold text-slate-700">Numerador: <span className="text-indigo-700">{numerator}</span><input type="range" min="0" max={denominator} value={numerator} onChange={(event) => setNumerator(Number(event.target.value))} className="mt-2 w-full accent-indigo-600" /></label><label className="block text-sm font-bold text-slate-700">Denominador: <span className="text-indigo-700">{denominator}</span><input type="range" min="1" max="12" value={denominator} onChange={(event) => { const next = Number(event.target.value); setDenominator(next); setNumerator((value) => Math.min(value, next)) }} className="mt-2 w-full accent-indigo-600" /></label></div>
          </section>

          <section className="space-y-5">
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-black text-indigo-950">Como calcular</h2>
              <div className="mt-4 rounded-2xl bg-white p-4 text-center text-indigo-950"><div className="text-sm font-bold uppercase tracking-wide text-slate-500">Numerador ÷ denominador</div><div className="mt-3 flex items-center justify-center gap-2 text-3xl font-black sm:text-5xl"><span>{numerator}</span><span>÷</span><span>{denominator}</span><span>=</span><span>{formatDecimal(decimal)}</span></div><p className="mt-3 text-sm leading-relaxed text-indigo-900">Dividimos {numerator} por {denominator} para descobrir quanto a fração representa em decimal.</p></div>
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center"><div className="rounded-2xl bg-white p-3"><div className="text-2xl font-black text-indigo-700">{formatDecimal(decimal)}</div><div className="text-[11px] font-bold text-slate-500">FORMA DECIMAL</div></div><div className="flex flex-col items-center gap-1 text-xs font-black text-indigo-700"><ArrowRight size={22} /><span>×100%</span></div><div className="rounded-2xl bg-white p-3"><div className="text-2xl font-black text-indigo-700">{formatDecimal(percentage)}%</div><div className="text-[11px] font-bold text-slate-500">PORCENTAGEM</div></div></div>
            </div>
          </section>
        </div>

        <section className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"><Lightbulb className="mt-0.5 shrink-0 text-amber-600" size={20} /><p><strong>Forma simplificada:</strong> {numerator}/{denominator} = {simplified.numerator}/{simplified.denominator}. Dividimos numerador e denominador pelo maior divisor comum ({gcd(numerator, denominator)}).</p></section>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link to="/quiz/fracoes" className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white hover:bg-indigo-700">Praticar com quiz de frações →</Link><Link to="/aprender" className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">Voltar para aprender</Link></div>
      </div>
    </PresentationMode>
  )
}
