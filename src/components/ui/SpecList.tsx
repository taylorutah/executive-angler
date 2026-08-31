/**
 * Long specialty / amenity / service phrases. A list, not a pill cloud —
 * eight-word lines do not wrap as chips on a phone.
 */
export default function SpecList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 border-t border-[var(--border)] sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="border-b border-[var(--border)] py-2.5 font-ui text-sm leading-5 text-[var(--text-1)] sm:odd:pr-6 sm:even:pl-6"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
