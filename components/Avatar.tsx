import Image from "next/image";

export function Avatar({ src, name, size }: { src: string | null | undefined; name: string; size: 32 | 40 | 48 | 64 | 96 }) {
  const dims = { 32: "size-8", 40: "size-10", 48: "size-12", 64: "size-16", 96: "size-24" }[size];
  return (
    <span className={`relative inline-flex ${dims} shrink-0 items-center justify-center overflow-hidden rounded-full bg-sunk text-label text-ink-2`}>
      {src ? (
        <Image src={src} alt={`Photo of ${name}`} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}
