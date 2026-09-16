import Link from 'next/link';
export default function SectionHeading({
  eyebrow,
  title,
  text,
  subtitle,
  link,
  href = '/shop'
}) {
  return <div className="container-width mb-8 flex items-end justify-between gap-4">
  <div>
                {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">{eyebrow}</p>}
    <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
                {(text || subtitle) && <p className="mt-2 max-w-2xl text-sm text-slate-500">{text || subtitle}</p>}
  </div>
            {link && <Link href={href} className="shrink-0 text-sm font-bold text-[#c92532] hover:underline">
                    {link}
</Link>}
</div>;
}
