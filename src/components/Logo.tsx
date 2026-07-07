/**
 * Collection logo mark (Compasso DS) — the two "smile / dot" shapes.
 * Paths lifted verbatim from the production Collection Logo; on the
 * splashscreen the mark renders white and recolors via `color`.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 23.372 26.876"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Collection"
    >
      <path
        d="M0.00441 13.0922C-0.10217 9.14865 1.72604 5.37606 5.02046 2.74033L5.12224 2.66255C7.11079 1.20402 9.16465 0.371534 11.4009 0.117083C13.3991 -0.145049 15.3454 0.0335484 17.1851 0.647111L18.1741 0.976457L18.2711 1.01678C20.6303 1.9885 22.1349 3.10136 23.3716 4.98334L18.66 8.73289C18.1232 7.91481 17.1928 7.19754 16.0348 6.704L15.2532 6.44379C14.2786 6.11925 13.2723 6.03187 12.1758 6.17878L12.1096 6.18646C10.9544 6.31513 9.89823 6.74913 8.78825 7.55185C7.03302 8.97774 6.05842 11.0988 6.1122 13.0931H0.00441Z"
        fill="currentColor"
      />
      <path
        transform="translate(12.517 18.06)"
        d="M0.53771 8.81649C0.15939 8.81649 0.37352 8.79824 0 8.76176V2.68086C1.69378 2.84601 3.62089 2.22573 5.03045 1.06198C5.41357 0.74608 5.76404 0.38888 6.07322 0L10.855 3.80237C10.2808 4.52443 9.62977 5.18696 8.91827 5.7746C6.56388 7.71899 3.50182 8.81649 0.53771 8.81649Z"
        fill="currentColor"
      />
    </svg>
  );
}
