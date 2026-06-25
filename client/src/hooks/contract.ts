"use client";

import {
  rpc,
  TransactionBuilder,
  scValToNative,
  Address,
  nativeToScVal,
  Contract,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const CONTRACT_ADDRESS = "CCJZKZ5S5V6J3Z5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5";

const server = new rpc.Server(RPC_URL);

// ── Helpers ─────────────────────────────────────────────────────────

export function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function toScValString(v: string) {
  return nativeToScVal(v, { type: "string" });
}

// ── Wallet ──────────────────────────────────────────────────────────

export async function connectWallet(): Promise<string | null> {
  const conn = await isConnected();
  if (!conn.isConnected) return null;
  const { address } = await getAddress();
  return address;
}

// ── Simulate + Assemble + Sign + Send ───────────────────────────────

async function buildSimulateSignSend(
  method: string,
  args: any[],
  publicKey: string,
): Promise<void> {
  const account = await server.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ADDRESS);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);

  // Handle simulation errors
  if ("error" in sim && typeof (sim as any).error === "string") {
    throw new Error(`Simulation error: ${(sim as any).error}`);
  }

  // Check for result
  const successSim = sim as rpc.Api.SimulateTransactionSuccessResponse;
  if (!successSim.result) {
    throw new Error("Simulation returned no result");
  }

  const prepared = rpc.assembleTransaction(tx, sim).build();

  // Sign with Freighter
  const { signedTxXdr } = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  // Send
  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const send = await server.sendTransaction(signedTx);

  if (send.status !== "PENDING") {
    throw new Error("Transaction send failed. Ensure your account is funded.");
  }

  // Wait for completion
  let result = await server.getTransaction(send.hash);
  while (result.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1000));
    result = await server.getTransaction(send.hash);
  }
  if (result.status !== "SUCCESS") {
    throw new Error(`Transaction failed. Hash: ${send.hash}`);
  }
}

// ── State-changing ─────────────────────────────────────────────────

export async function initContract(): Promise<void> {
  const { address } = await getAddress();
  return buildSimulateSignSend("init", [], address);
}

export async function vote(voter: string, candidate: string): Promise<void> {
  return buildSimulateSignSend("vote", [
    new Address(voter).toScVal(),
    toScValString(candidate),
  ], voter);
}

// ── Read-only ───────────────────────────────────────────────────────

async function simulateRead(method: string, args: any[] = []) {
  const dummyAddr = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
  const account = await server.getAccount(dummyAddr);
  const contract = new Contract(CONTRACT_ADDRESS);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);

  if ("error" in sim && typeof (sim as any).error === "string") {
    throw new Error(`Simulation error: ${(sim as any).error}`);
  }

  const successSim = sim as rpc.Api.SimulateTransactionSuccessResponse;
  if (!successSim.result) {
    throw new Error("Simulation returned no result");
  }

  return scValToNative(successSim.result.retval);
}

export async function getCandidates(): Promise<string[]> {
  try {
    const val = await simulateRead("get_candidates");
    if (Array.isArray(val)) return val as string[];
    return [];
  } catch {
    return [];
  }
}

export async function getVotes(candidate: string): Promise<number> {
  try {
    const val = await simulateRead("get_votes", [toScValString(candidate)]);
    return Number(val);
  } catch {
    return 0;
  }
}
