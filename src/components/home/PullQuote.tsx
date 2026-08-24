import type { Article } from "@/types/entities";

interface Props {
  article: Article;
}

/** Dead positioning from Brand Bible v4 — never set this in display type. */
const BANNED =
  /river intelligence|intelligence platform|fly fishing intelligence|upgrade to|founders|premium tier/i;

/** First sentence of a real field note — no invented speech, no banned copy. */
export function quoteFromArticle(article: Article): string | null {
  const raw = (article.excerpt ?? "").replace(/\s+/g, " ").trim();
  if (!raw || BANNED.test(raw)) return null;
  const match = raw.match(/^[\s\S]+?[.!?](?=\s|$)/);
  const text = (match?.[0] ?? raw).trim();
  if (!text || BANNED.test(text)) return null;
  return text;
}

export function pickQuote(articles: Article[]): Article | null {
  for (const article of articles) {
    if (quoteFromArticle(article)) return article;
  }
  return null;
}

export default function PullQuote({ article }: Props) {
  const text = quoteFromArticle(article);
  if (!text) return null;

  return (
    <section data-lane="resource" className="bg-[var(--surface-raised)] py-20 sm:py-28">
      <figure className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <blockquote className="font-heading text-[2.5rem] font-medium leading-[1.15] text-[var(--text-primary)]">
          {text}
        </blockquote>
        <figcaption className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
          — {article.author}
        </figcaption>
      </figure>
    </section>
  );
}
