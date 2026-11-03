import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import CartesianPlane from '../components/graph/CartesianPlane'
import { createScale, plotPath } from '../logic/plane'
import {
  affineBehavior,
  affineRoot,
  discriminant,
  evaluate,
  formatCoefficient as fmt,
  formatLaw,
  quadraticRoots,
  vertex,
  type Coefficients,
  type FunctionKind,
} from '../logic/funcoes'

const scale = createScale(-10, 10)
const CURVE = '#be185d'
const defaults: Record<FunctionKind, Coefficients> = {
  afim: { a: 2, b: -4, c: 0 },
  quadratica: { a: 1, b: -2, c: -3 },
}

function Fact({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <dt className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="font-mono text-lg font-black text-slate-900">{value}</dd>
      {detail && <dd className="text-xs text-slate-600">{detail}</dd>}
    </div>
  )
}

export default function Funcoes() {
  const [kind, setKind] = useState<FunctionKind>('afim')
  const [coefficients, setCoefficients] = useState<Coefficients>(defaults.afim)
  const [pointX, setPointX] = useState(1)
  const { a, b, c } = coefficients
  const isQuadratic = kind === 'quadratica' && a !== 0
  const f = (x: number) => evaluate(kind, coefficients, x)
  const pointY = f(pointX)

  const roots = kind === 'afim' ? (affineRoot(a, b) === null ? [] : [affineRoot(a, b) as number]) : isQuadratic ? quadraticRoots(coefficients) : b !== 0 ? [-c / b] : []
  const top = isQuadratic ? vertex(coefficients) : null
  const delta = discriminant(coefficients)

  function changeKind(next: FunctionKind) {
    setKind(next)
    setCoefficients(defaults[next])
  }

  function set(key: keyof Coefficients, value: number) {
    setCoefficients((current) => ({ ...current, [key]: value }))
  }

  return (
    <PresentationMode title="Explorador de Funções">
      <SimulatorHeader id="funcoes" />

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_380px]">
        <Panel>
          <p className="mb-2 text-center font-mono text-2xl font-black sm:text-3xl" aria-live="polite">
            <span className="accent-text" style={{ ['--accent' as string]: CURVE }}>{formatLaw(kind, coefficients)}</span>
          </p>
          <CartesianPlane scale={scale} label={`Gráfico de ${formatLaw(kind, coefficients)}`}>
            <path d={plotPath(f, scale)} fill="none" stroke={CURVE} strokeWidth={3.5} strokeLinecap="round" />
            {roots.map((root) => (
              <circle key={root} cx={scale.toX(root)} cy={scale.toY(0)} r={6} fill="#ffffff" stroke={CURVE} strokeWidth={3} />
            ))}
            <circle cx={scale.toX(0)} cy={scale.toY(f(0))} r={6} fill="#0f766e" stroke="#ffffff" strokeWidth={2} />
            {top && <rect x={scale.toX(top.x) - 6} y={scale.toY(top.y) - 6} width={12} height={12} fill="#7c3aed" stroke="#ffffff" strokeWidth={2} transform={`rotate(45 ${scale.toX(top.x)} ${scale.toY(top.y)})`} />}
            <line x1={scale.toX(pointX)} x2={scale.toX(pointX)} y1={scale.toY(0)} y2={scale.toY(pointY)} stroke="#2563eb" strokeWidth={2} strokeDasharray="5 4" />
            <circle cx={scale.toX(pointX)} cy={scale.toY(pointY)} r={7} fill="#2563eb" stroke="#ffffff" strokeWidth={2} />
          </CartesianPlane>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 bg-white" style={{ borderColor: CURVE }} /> raiz (corta o eixo x)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#0f766e]" /> corta o eixo y</span>
            {top && <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rotate-45 bg-[#7c3aed]" /> vértice</span>}
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#2563eb]" /> ponto P</span>
          </div>
        </Panel>

        <div className="space-y-4 sm:space-y-5">
          <Panel title="Coeficientes">
            <SegmentedControl
              label="Tipo de função"
              options={[
                { id: 'afim', label: 'Afim (1º grau)' },
                { id: 'quadratica', label: 'Quadrática (2º grau)' },
              ]}
              value={kind}
              onChange={changeKind}
            />
            <div className="mt-4 space-y-4">
              <NumberControl label="a" value={a} min={-3} max={3} step={kind === 'afim' ? 0.5 : 0.25} onChange={(value) => set('a', value)} format={fmt} />
              <NumberControl label="b" value={b} min={-10} max={10} step={1} onChange={(value) => set('b', value)} format={fmt} />
              {kind === 'quadratica' && <NumberControl label="c" value={c} min={-10} max={10} step={1} onChange={(value) => set('c', value)} format={fmt} />}
              <NumberControl label="x do ponto P" value={pointX} min={-10} max={10} step={0.5} onChange={setPointX} format={fmt} />
            </div>
            <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 font-mono text-sm font-bold text-blue-800">
              P = ({fmt(pointX)}, {fmt(pointY)}) → f({fmt(pointX)}) = {fmt(pointY)}
            </p>
            <button type="button" onClick={() => setCoefficients(defaults[kind])} className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <RotateCcw size={15} /> Restaurar exemplo
            </button>
          </Panel>

          <Panel title="O que o gráfico mostra">
            <dl className="grid gap-2">
              {kind === 'afim' ? (
                <>
                  <Fact label="Comportamento" value={affineBehavior(a)} detail={a === 0 ? 'a = 0: a reta é horizontal.' : `a ${a > 0 ? '>' : '<'} 0: cada passo em x muda y em ${fmt(a)}.`} />
                  <Fact label="Raiz" value={roots.length ? `x = ${fmt(roots[0])}` : 'não há'} detail={roots.length ? `resolve ${formatLaw(kind, coefficients).replace('f(x) = ', '')} = 0` : 'uma reta horizontal fora do zero nunca corta o eixo x'} />
                  <Fact label="Corta o eixo y" value={`(0, ${fmt(b)})`} detail="o coeficiente b é o valor de f(0)" />
                </>
              ) : isQuadratic ? (
                <>
                  <Fact label="Concavidade" value={a > 0 ? 'para cima' : 'para baixo'} detail={`a ${a > 0 ? '>' : '<'} 0`} />
                  <Fact label="Discriminante (Δ)" value={`Δ = ${fmt(delta)}`} detail={"Δ = b² − 4ac · " + (delta > 0 ? 'Δ > 0: duas raízes reais' : delta === 0 ? 'Δ = 0: uma raiz real (dupla)' : 'Δ < 0: nenhuma raiz real')} />
                  <Fact label="Raízes" value={roots.length ? roots.map((root) => `x = ${fmt(root)}`).join(' e ') : 'não há raízes reais'} />
                  <Fact label="Vértice" value={`(${fmt(top!.x)}, ${fmt(top!.y)})`} detail={`ponto de ${a > 0 ? 'mínimo' : 'máximo'}: x = −b ÷ 2a`} />
                </>
              ) : (
                <Fact label="Atenção" value="a = 0" detail="Sem o termo x², a função deixa de ser quadrática e o gráfico vira uma reta." />
              )}
            </dl>
          </Panel>
        </div>
      </div>

      <TipBox>
        <strong>Experimente:</strong> na função afim, mude só o <strong>b</strong> e veja a reta subir ou descer sem mudar a inclinação. Na quadrática, deixe <strong>Δ</strong> negativo e observe a parábola deixar de tocar o eixo x.
      </TipBox>
    </PresentationMode>
  )
}
