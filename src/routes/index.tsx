import { createFileRoute } from '@tanstack/react-router'
import { menu, categories, categoryLabels } from '../lib/menu'
import MenuSection from '../components/MenuSection'
import Cart from '../components/Cart'
import WebMCPStatus from '../components/WebMCPStatus'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen bg-green-950 pb-12">
      <section className="bg-gradient-to-r from-green-800 to-green-950 text-white py-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-2">
          Philly's Finest
        </h1>
        <p className="text-green-300 text-lg">
          Authentic cheesesteaks, straight from South Philly
        </p>
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
