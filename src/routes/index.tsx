import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '../lib/store'
import { categories, categoryLabels } from '../lib/menu'
import MenuSection from '../components/MenuSection'
import Cart from '../components/Cart'
import WebMCPStatus from '../components/WebMCPStatus'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const menu = useStore((s) => s.menu)

  return (
    <div className="min-h-screen bg-indigo-950 pb-12">
      <section className="bg-red-600 text-white py-10 px-6 text-center border-b-4 border-black">
        <h1 className="text-2xl md:text-3xl font-black mb-3 uppercase tracking-wide">
          Philly's Finest
        </h1>
        <p className="text-xs text-yellow-300 uppercase tracking-widest">
          ~ Authentic cheesesteaks since 1968 ~
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {['*', '*', '*', '*', '*'].map((s, i) => (
            <span key={i} className="text-yellow-300 text-lg">{s}</span>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        <main className="flex-1 min-w-0">
          {categories.map((cat) => (
            <MenuSection
              key={cat}
              title={categoryLabels[cat]}
              items={menu.filter((i) => i.category === cat)}
            />
          ))}
        </main>

        <aside className="w-full lg:w-80 shrink-0">
          <Cart />
        </aside>
      </div>

      <WebMCPStatus />
    </div>
  )
}
