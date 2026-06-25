# 🗳️ Voting DApp

A decentralized voting application built on **Soroban** (Stellar smart contracts) with a **Next.js** frontend.

Voters connect their Freighter wallet, type a candidate name, and cast a vote. Each address may vote only once. Results update in real-time.

## Smart Contract

| Network | Address |
|---|---|
| Testnet | `CA56RHLVPQFU32CAF7BFQNSV6AODHNBIIILGWLSQXR4BROXTZNLRY4P2` |

### Contract Functions

- **`init`** — initializes contract storage
- **`vote(voter, candidate)`** — casts a vote for a candidate (requires auth)
- **`get_votes(candidate)`** — returns the vote count for a candidate
- **`get_candidates`** — returns the list of all candidates

## Project Structure

```
├── contract/                          # Soroban smart contract (Rust)
│   ├── Cargo.toml
│   └── contracts/contract/src/
│       ├── lib.rs                     # Contract logic
│       └── test.rs                    # Tests
└── client/                            # Next.js frontend (TypeScript)
    ├── src/
    │   ├── app/                       # Next.js App Router pages
    │   ├── components/                # React components
    │   ├── hooks/                     # Contract integration hooks
    │   └── lib/                       # Utilities
    └── packages/contract/             # Generated TypeScript bindings
```

## Getting Started

### Prerequisites

- [Freighter Wallet](https://freighter.app) browser extension
- [Bun](https://bun.sh) package manager

### Run the Frontend

```bash
cd client
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000), connect your Freighter wallet, and start voting.

### Deploy the Contract

```bash
cd contract
stellar contract build
stellar keys generate dev --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32v1-none/release/contract.wasm \
  --source-account dev --network testnet
```

## Tech Stack

- **Blockchain**: Stellar Soroban (Rust, `soroban-sdk` v25)
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Wallet**: Freighter API
- **Client SDK**: `@stellar/stellar-sdk` v14
