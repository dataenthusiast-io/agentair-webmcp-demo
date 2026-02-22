import type { MenuItem as MenuItemType } from '../lib/menu'
import MenuItem from './MenuItem'

export default function MenuSection({
  title,
  items,
}: {
  title: string
  items: MenuItemType[]
}) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-bold text-yellow-300 mb-4 uppercase tracking-wide border-b-4 border-yellow-300 pb-2 inline-block">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
