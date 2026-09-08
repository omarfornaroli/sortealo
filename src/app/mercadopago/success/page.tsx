import { Suspense } from "react";
import { SuccessContent } from "./SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
