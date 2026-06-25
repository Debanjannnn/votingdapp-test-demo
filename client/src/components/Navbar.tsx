"use client";

import { useEffect, useState } from "react";
import { connectWallet } from "@/hooks/contract";
import { truncateAddress } from "@/lib/utils";

export default function Navbar() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    connectWallet().then(setAddress);
  }, []);

  async function handleConnect() {
    const addr = await connectWallet();
    setAddress(addr);
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
      <h1 className="text-xl font-bold tracking-tight">🗳️ Voting DApp</h1>
      <div>
        {address ? (
          <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
            {truncateAddress(address)}
          </span>
        ) : (
          <button
            onClick={handleConnect}
            className="text-sm px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-80 transition-opacity"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
