"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function RootLoading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
