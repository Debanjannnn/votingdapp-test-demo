"use client";

import Navbar from "@/components/Navbar";
import Contract from "@/components/Contract";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <Contract />
      </main>
    </div>
  );
}
