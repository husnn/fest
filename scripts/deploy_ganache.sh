#!/bin/bash

_DO_RESET=false

for arg in "$@"
  do
    case $arg in
      -r|--reset)
      _DO_RESET=true
      shift
      ;;
    esac
done

# Check following packages are installed, or install them globally
declare -a _PACKAGES_REQUIRED=(
  "ganache-cli"
)

for i in "${_PACKAGES_REQUIRED[@]}"
  do
    echo "Verifying $i installation..."

    if [ `npm list -g | grep -c $i` -eq 0 ];
      then
        echo "Installing $i..."
        npm install -g --silent --no-progress $i
    fi
done

if [ ! -z "$MNEMONIC" ];
  then
    echo "Using mnemonic \"$MNEMONIC\""
else
  echo "Mnemonic is not set."
fi

_GANACHE_PATH=${VARIABLE:="$HOME/.ganache"}
_LOGS_DIR="$_GANACHE_PATH/logs"

_IS_FIRST_RUN=true
_GANACHE_PORT=8545

_CONTRACTS_PATH="./packages/ethereum/contracts/solidity"

if [ $_DO_RESET == false ];
  then
    if [ -d $_GANACHE_PATH/data ];
      then
        echo "Data exists. Using existing installation."
        _IS_FIRST_RUN=false
    fi
else
  echo "Clearing data..."
  rm -rf $_GANACHE_PATH
fi

if [ $_IS_FIRST_RUN == true ] || [ ! -d $_LOGS_DIR ];
 then
   echo "Creating logs directory..."
   mkdir -p $_LOGS_DIR;
fi

deploy_contracts() {
  echo "Deploying contracts..."
  npm run truffle:dev --prefix $_CONTRACTS_PATH
}

deploy_contracts_if_needed() {
  if [ "$_IS_FIRST_RUN" == true ];
    then
      deploy_contracts
  fi
}

start_ganache() {
  echo "Starting Ganache..."

  echo "Logging to $_LOGS_DIR/$LOG_FILENAME"

  ganache-cli \
    -h 0.0.0.0 -p $_GANACHE_PORT \
    -i 123456 \
    --db "$_GANACHE_PATH/data" \
    --accounts 10 \
    -e 100 \
    -m "$MNEMONIC"
}

{
  start_ganache &
  deploy_contracts_if_needed;
} | tee "$_LOGS_DIR/ganache-$(date +%Y-%m-%d-%H:%M:%S).log"
