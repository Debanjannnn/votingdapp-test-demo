#![cfg(test)]
use super::*;
use soroban_sdk::{Env, Address, String};
use soroban_sdk::testutils::Address as _;

#[test]
fn test_init_and_empty_state() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    client.init();

    assert_eq!(client.get_votes(&String::from_str(&env, "Alice")), 0);
    assert_eq!(client.get_candidates().len(), 0);
}

#[test]
fn test_vote_once() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    client.init();

    let voter = Address::generate(&env);
    client.vote(&voter, &String::from_str(&env, "Alice"));

    assert_eq!(client.get_votes(&String::from_str(&env, "Alice")), 1);
    let candidates = client.get_candidates();
    assert_eq!(candidates.len(), 1);
    assert_eq!(candidates.get(0).unwrap(), String::from_str(&env, "Alice"));
}

#[test]
fn test_double_vote_prevented() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    client.init();

    let voter = Address::generate(&env);
    client.vote(&voter, &String::from_str(&env, "Alice"));

    assert!(client.try_vote(&voter, &String::from_str(&env, "Bob")).is_err());
}

#[test]
fn test_multiple_voters_same_candidate() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    client.init();

    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);

    client.vote(&voter1, &String::from_str(&env, "Alice"));
    client.vote(&voter2, &String::from_str(&env, "Alice"));

    assert_eq!(client.get_votes(&String::from_str(&env, "Alice")), 2);
}

#[test]
fn test_multiple_candidates() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    client.init();

    let v1 = Address::generate(&env);
    let v2 = Address::generate(&env);
    let v3 = Address::generate(&env);

    client.vote(&v1, &String::from_str(&env, "Alice"));
    client.vote(&v2, &String::from_str(&env, "Bob"));
    client.vote(&v3, &String::from_str(&env, "Alice"));

    assert_eq!(client.get_votes(&String::from_str(&env, "Alice")), 2);
    assert_eq!(client.get_votes(&String::from_str(&env, "Bob")), 1);

    let candidates = client.get_candidates();
    assert_eq!(candidates.len(), 2);
}
