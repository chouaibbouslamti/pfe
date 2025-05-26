"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HangarsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/hangars");
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redirection vers la page des hangars...</p>
      </div>
    </div>
  );
}
