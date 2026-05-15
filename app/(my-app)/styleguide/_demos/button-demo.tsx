"use client";

import { Button } from "@/components/ui/button";

export function ClickButtonDemo() {
  return (
    <Button variant="filled" onClick={() => alert("clicked")}>
      As button (no href)
    </Button>
  );
}
