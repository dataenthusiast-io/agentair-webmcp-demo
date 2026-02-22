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
      <h2 className="text-2xl font-bold text-green-100 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
