#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec};

#[contracttype]
pub enum DataKey { Votes, Voters, Candidates }

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn init(env: Env) {
        let votes: Map<String, u32> = Map::new(&env);
        let voters: Map<Address, bool> = Map::new(&env);
        let candidates: Vec<String> = Vec::new(&env);
        env.storage().instance().set(&DataKey::Votes, &votes);
        env.storage().instance().set(&DataKey::Voters, &voters);
        env.storage().instance().set(&DataKey::Candidates, &candidates);
    }

    pub fn vote(env: Env, voter: Address, candidate: String) {
        voter.require_auth();
        let mut voters: Map<Address, bool> = env.storage().instance().get(&DataKey::Voters).unwrap();
        assert!(!voters.get(voter.clone()).unwrap_or(false), "already voted");

        let mut votes: Map<String, u32> = env.storage().instance().get(&DataKey::Votes).unwrap();
        let count = votes.get(candidate.clone()).unwrap_or(0);
        votes.set(candidate.clone(), count + 1);

        let mut candidates: Vec<String> = env.storage().instance().get(&DataKey::Candidates).unwrap();
        if count == 0 {
            candidates.push_back(candidate.clone());
        }

        voters.set(voter, true);
        env.storage().instance().set(&DataKey::Votes, &votes);
        env.storage().instance().set(&DataKey::Voters, &voters);
        env.storage().instance().set(&DataKey::Candidates, &candidates);
    }

    pub fn get_votes(env: Env, candidate: String) -> u32 {
        let votes: Map<String, u32> = env.storage().instance().get(&DataKey::Votes).unwrap();
        votes.get(candidate).unwrap_or(0)
    }

    pub fn get_candidates(env: Env) -> Vec<String> {
        env.storage().instance().get(&DataKey::Candidates).unwrap()
    }
}

mod test;
