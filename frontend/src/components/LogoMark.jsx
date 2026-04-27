export function LogoMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img">
        <path className="logo-line" d="M32 12v35" />
        <path className="logo-line" d="M22 18h20" />
        <path className="logo-line" d="M18 48h28" />
        <path className="logo-line" d="M26 18 15 34" />
        <path className="logo-line" d="M38 18 49 34" />
        <path className="logo-pan" d="M8 34h20c-1 6-4 10-10 10S9 40 8 34Z" />
        <path className="logo-pan" d="M36 34h20c-1 6-4 10-10 10s-9-4-10-10Z" />
        <path className="logo-book" d="M12 30c4-2 8-2 12 0v8c-4-2-8-2-12 0v-8Z" />
        <path className="logo-book" d="M24 30c-4-2-8-2-12 0v8c4-2 8-2 12 0v-8Z" />
        <circle className="logo-lens" cx="45" cy="34" r="4.5" />
        <path className="logo-lens" d="m48.5 37.5 4.5 4.5" />
      </svg>
    </span>
  );
}
