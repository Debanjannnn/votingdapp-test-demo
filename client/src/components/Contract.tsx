"use client";

import { useEffect, useState, useCallback } from "react";
import { getCandidates, getVotes, vote, connectWallet } from "@/hooks/contract";

type Candidate = {
  name: string;
  votes: number;
};

export default function Contract() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [wallet, setWallet] = useState<string | null>(null);
  const [votingFor, setVotingFor] = useState<string | null>(null);
  const [newCandidate, setNewCandidate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const names = await getCandidates();
      const withVotes = await Promise.all(
        names.map(async (name) => ({
          name,
          votes: await getVotes(name),
        }))
      );
      setCandidates(withVotes);
    } catch {
      // contract not initialized yet — that's ok
    }
  }, []);

  useEffect(() => {
    connectWallet().then(setWallet);
    refresh();
  }, [refresh]);

  async function handleVote(candidate: string) {
    if (!wallet) {
      const addr = await connectWallet();
      if (!addr) {
        setError("Please install Freighter wallet to vote.");
        return;
      }
      setWallet(addr);
    }
    setVotingFor(candidate);
    setError(null);
    try {
      await vote(wallet!, candidate);
      await refresh();
    } catch (e: any) {
      setError(e.message ?? "Vote failed. Did you already vote?");
    } finally {
      setVotingFor(null);
    }
  }

  // Allow voting for any candidate name the user types
  const allCandidates = candidates.map((c) => c.name);
  const displayCandidates =
    newCandidate.trim() && !allCandidates.includes(newCandidate.trim())
      ? [...candidates, { name: newCandidate.trim(), votes: 0 }]
      : candidates;

  return (
    <div className="flex flex-col items-center gap-8 py-12 px-4 w-full max-w-xl mx-auto">
      <p className="text-zinc-600 dark:text-zinc-400 text-center">
        Vote for your candidate. Each address may vote only once.
      </p>

      {/* Quick candidate input */}
      <div className="w-full flex gap-2">
        <input
          type="text"
          placeholder="Type a candidate name..."
          value={newCandidate}
          onChange={(e) => setNewCandidate(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="w-full p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Candidate list */}
      {displayCandidates.length === 0 ? (
        <p className="text-zinc-400 text-sm">
          No candidates yet. Type a name above and click Vote.
        </p>
      ) : (
        <div className="w-full space-y-3">
          {displayCandidates.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex flex-col">
                <span className="font-medium">{c.name}</span>
                <span className="text-sm text-zinc-500">
                  {c.votes} vote{c.votes !== 1 ? "s" : ""}
                </span>
              </div>
              <button
                onClick={() => handleVote(c.name)}
                disabled={votingFor === c.name}
                className="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {votingFor === c.name ? "Voting..." : "Vote"}
              </button>
            </div>
          ))}
        </div>
      )}

      {!wallet && (
        <p className="text-xs text-zinc-400 text-center">
          Connect your Freighter wallet to vote.
        </p>
      )}
    </div>
  );
}
