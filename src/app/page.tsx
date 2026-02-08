import { Suspense } from "react";
import LembaranUtama from "./LembaranUtama";

export default function Page() {
  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <LembaranUtama />
    </Suspense>
  );
}
