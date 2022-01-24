# Fest

### Deploy Ganache

Set a different `GANACHE_NETWORK` in env variables for each development machine to avoid overriding the network config in the build artifact (as it's committed to version control).

Run `scripts/deploy_ganache.sh` from root dir to start the Ganache instance and deploy contracts. It will also install Ganache, Truffle and any other dependencies specified in the contracts dir _package.json_.

It is advised to also specify a valid `MNEMONIC` in env vars to persist the accounts and deployments across runs.

Here are all the vars that can be explictly set:

`GANACHE_PATH`
`GANACHE_PORT`
`GANACHE_NETWORK`
`CONTRACTS_PATH`

You may also run the script with the `-r (or --reset)` flag to delete Ganache's persisted data in `GANACHE_PATH` and re-deploy all contracts.
