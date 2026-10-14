import type { ReactNode } from "react";
import { PrivatePageLayout } from "../../components/PrivatePageLayout";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return <PrivatePageLayout>{children}</PrivatePageLayout>;
}
