import Link from "next/link";
import { JSX } from "react/jsx-runtime";

export function Drawer() : JSX.Element {
  return (
    <nav className="w-56 border-r p-4 flex flex-col gap-2">
      <Link href="/">Home Page</Link>
      <Link href="/vehicles">Vehicles</Link>
      <Link href="/issues">Issues</Link>
    </nav>
  );
}