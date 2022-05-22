import { Decimal } from '@stargazezone/types/contracts/minter/instantiate_msg';
import { Coin, Timestamp } from '@stargazezone/types/contracts/minter/shared-types';
import { coins } from 'cosmwasm';
import inquirer from 'inquirer';
import { getClient } from '../src/client';
import { isValidHttpUrl, toStars } from '../src/utils';

const config = require('../config');

const NEW_COLLECTION_FEE = coins('0', 'ustars');

function isValidIpfsUrl(uri: string) {
  let url;

  try {
    url = new URL(uri);
  } catch (_) {
    return false;
  }

  return url.protocol === 'ipfs:';
}

function clean(obj: any) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
  return obj;
}

function formatRoyaltyInfo(
  royaltyPaymentAddress: null | string,
  royaltyShare: string
) {
  if (royaltyPaymentAddress === null) {
    return null;
  } else {
    if (royaltyShare === undefined || royaltyShare == '') {
      throw new Error('royaltyPaymentAddress present, but no royaltyShare');
    }
    return { payment_address: royaltyPaymentAddress, share: royaltyShare };
  }
}

async function init() {
  const account = toStars(config.account);

  const client = await getClient();

  // time expressed in nanoseconds (1 millionth of a millisecond)
  // const startTime: Timestamp = (
  //   new Date(config.startTime).getTime() * 1_000_000
  // ).toString();
  const startTime:Timestamp =((Date.now() + 10*1000 )* 1_000_000).toString();


  const tempMsg={
    owner:'stars1up88jtqzzulr6z72cq6uulw9yx6uau6ew0zegy',
    signer:'stars1up88jtqzzulr6z72cq6uulw9yx6uau6ew0zegy',
  }

  const msg = clean(tempMsg);

  // Get confirmation before preceding
  console.log(
    'Please confirm the settings for your finalizer.'
  );
  console.log(JSON.stringify(msg, null, 2));
  console.log(
    'Cost of finalizer instantiation: ' +
      NEW_COLLECTION_FEE[0].amount +
      ' ' +
      NEW_COLLECTION_FEE[0].denom
  );
  const answer = await inquirer.prompt([
    {
      message: 'Ready to submit the transaction?',
      name: 'confirmation',
      type: 'confirm',
    },
  ]);
  if (!answer.confirmation) return;

  const result = await client.instantiate(
    account,
    config.finalizerCodeId,
    msg,
    config.name,
    'auto',
    { admin: account }
  );
  const wasmEvent = result.logs[0].events.find((e) => e.type === 'wasm');
  console.info(
    'The `wasm` event emitted by the contract execution:',
    wasmEvent
  );
  if (wasmEvent != undefined) {
    console.info('wasm output', wasmEvent);
  }

  //   console.info(wasmEvent.message);
}

const args = process.argv.slice(2);
if (args.length == 0) {
  init();
}
