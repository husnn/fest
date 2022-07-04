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
  "truffle"
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

: ${GANACHE_PATH:="$HOME/.ganache"}
_LOGS_DIR="$GANACHE_PATH/logs"

_IS_FIRST_RUN=true

: ${GANACHE_PORT:=8545}
: ${GANACHE_NETWORK:=123456}

: ${CONTRACTS_PATH:="./packages/ethereum/contracts"}

if [ $_DO_RESET == false ];
  then
    if [ -d $GANACHE_PATH/data ];
      then
        echo "Data exists. Using existing installation."
        _IS_FIRST_RUN=false
    fi
else
  echo "Clearing data..."
  rm -rf $GANACHE_PATH
fi

if [ $_IS_FIRST_RUN == true ] || [ ! -d $_LOGS_DIR ];
 then
   echo "Creating logs directory..."
   mkdir -p $_LOGS_DIR;
fi

deploy_contracts() {
  echo "Deploying contracts..."
  cd $CONTRACTS_PATH
  npm install
  npm run truffle:dev
}

deploy_contracts_if_needed() {
  if [ "$_IS_FIRST_RUN" == true ];
    then
      deploy_contracts
  fi
}

_LOG_FILENAME="ganache-$(date +%Y-%m-%d-%H:%M:%S).log"

start_ganache() {
  echo "Starting Ganache..."

  echo "Logging to $_LOGS_DIR/$_LOG_FILENAME"

  ganache-cli \
    -h 0.0.0.0 -p $GANACHE_PORT \
    -i $GANACHE_NETWORK \
    --db "$GANACHE_PATH/data" \
    --accounts 10 \
    -e 100 \
    -m "$MNEMONIC" \
    -- deterministic
}

{
  start_ganache &
  deploy_contracts_if_needed;
} | tee "$_LOGS_DIR/$_LOG_FILENAME"
