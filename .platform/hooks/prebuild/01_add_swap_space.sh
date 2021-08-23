#!/bin/bash
SWAP_FILE=/var/swapfile
SWAP_SIZE=1024

if [ -f $SWAP_FILE ]; then
  echo "Swapfile $SWAP_FILE already exists. Skipping..."
  exit;
fi

/bin/dd if=/dev/zero of=$SWAP_FILE bs=1M count=$SWAP_SIZE

/sbin/mkswap $SWAP_FILE
chmod 600 $SWAPFILE

/sbin/swapon $SWAP_FILE
