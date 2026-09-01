import Link from "next/link";

const linkClass =
  "text-[var(--text-1)] underline decoration-[var(--border)] hover:text-[var(--accent)]";

const rows = [
  {
    slug: "madison-river",
    name: "Madison",
    type: "Freestone (upper) / mixed below Ennis",
    fish: "Rainbow, brown, whitefish",
    months: "Jun–Oct",
    difficulty: "Intermediate",
    access: "Excellent FAS (Three Dollar Bridge, Varney, Ennis)",
    pick: "You want the classic Montana meadow float or wade",
  },
  {
    slug: "gallatin-river",
    name: "Gallatin",
    type: "Freestone pocket water",
    fish: "Rainbow, brown, cutthroat",
    months: "Jul–Oct",
    difficulty: "Beginner–intermediate",
    access: "Excellent (Hwy 191 parallels the canyon)",
    pick: "You want easy day-trip wading near Bozeman",
  },
  {
    slug: "yellowstone-river",
    name: "Yellowstone",
    type: "Big freestone",
    fish: "Yellowstone cutthroat, rainbow, brown",
    months: "Jul–Sep",
    difficulty: "Intermediate–advanced",
    access: "Good boat ramps in Paradise Valley",
    pick: "You want a float and native cutthroat",
  },
] as const;

/**
 * SEO 2026-09-01 comparison block. Montana destinations page only.
 * Copy is locked in the ticket. Do not invent hatch months or spots.
 */
export default function MontanaComparison() {
  return (
    <div>
      <p className="max-w-[var(--prose)] text-lg leading-relaxed text-[var(--text-1)]">
        Montana&apos;s best first-week waters are the{" "}
        <Link href="/rivers/madison-river" className={linkClass}>
          Madison
        </Link>{" "}
        (broad freestone meadow water), the{" "}
        <Link href="/rivers/gallatin-river" className={linkClass}>
          Gallatin
        </Link>{" "}
        (highway-parallel pocket water), and the{" "}
        <Link href="/rivers/yellowstone-river" className={linkClass}>
          Yellowstone
        </Link>{" "}
        through Paradise Valley (big freestone with native cutthroat). Peak
        window is June through October. Pick the Madison for numbers and access,
        the Gallatin for easy wade pocket water near Bozeman, or the Yellowstone
        when you want a float and Yellowstone cutthroat.
      </p>

      <h2 className="mt-12 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">
        Madison vs Gallatin vs Yellowstone
      </h2>

      <p className="mt-4 max-w-[var(--prose)] leading-relaxed text-[var(--text-2)]">
        For a first Montana week, fish the Madison if you want the classic
        freestone riffle with strong public FAS access, the Gallatin if you want
        pocket-water wading with Highway 191 parking, and the Yellowstone if you
        want a Paradise Valley float and native cutthroat. All three peak June
        through October. Salmonfly crowds hit Madison and Yellowstone hardest in
        June and early July. Fall is quieter and better for brown trout on
        streamers.
      </p>

      <div className="desk-table-wrap mt-8 overflow-x-auto">
        <table className="ea-table">
          <thead>
            <tr>
              <th scope="col">River</th>
              <th scope="col">Type</th>
              <th scope="col">Primary fish</th>
              <th scope="col">Best months</th>
              <th scope="col">Difficulty</th>
              <th scope="col">Access</th>
              <th scope="col">Pick it when</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug}>
                <td>
                  <Link href={`/rivers/${row.slug}`} className={linkClass}>
                    {row.name}
                  </Link>
                </td>
                <td>{row.type}</td>
                <td>{row.fish}</td>
                <td>{row.months}</td>
                <td>{row.difficulty}</td>
                <td>{row.access}</td>
                <td>{row.pick}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-[var(--text-2)]">
        <Link href="/flies/for/madison-river" className={linkClass}>
          Flies for the Madison
        </Link>
        {" · "}
        <Link href="/flies/library" className={linkClass}>
          Fly library
        </Link>
      </p>
    </div>
  );
}
