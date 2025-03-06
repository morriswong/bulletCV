import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl border-t px-4 pt-4">
      {children}
    </div>
  );
}
