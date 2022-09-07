import { CosmWasmClient } from 'cosmwasm';
import { toStars } from '../src/utils';

const config = require('../config');

async function queryInfo() {
  const client = await CosmWasmClient.connect(config.rpcEndpoint);
  const account = toStars(config.account);
  const minter = toStars(config.minter);
  const finalizer = toStars(config.finalizer);

  const finalizerConfigResponse = await client.queryContractSmart(finalizer, {
    config: {},
  });
  console.log('finalizer configResponse: ', finalizerConfigResponse);

  const balance = await client.getBalance(account, 'ustars');
  console.log('account balance:', balance);

  const configResponse = await client.queryContractSmart(minter, {
    config: {},
  });
  console.log('minter configResponse: ', configResponse);

  const sg721 = configResponse.sg721_address;

  console.log("minter:", minter)
  console.log("sg721:", sg721)
  const whitelistContract = configResponse.whitelist;

  const numTokens = await client.queryContractSmart(sg721, { num_tokens: {} });
  console.log('num tokens:', numTokens);

  const collectionInfo = await client.queryContractSmart(sg721, {
    collection_info: {},
  });
  console.log('collection info:', collectionInfo);

  if (whitelistContract) {
    const whitelistConfig = await client.queryContractSmart(whitelistContract, {
      config: {},
    });
    console.log('whitelist config:', whitelistConfig);

    const whitelistMembers = await client.queryContractSmart(
      whitelistContract,
      {
        members: { limit: 5000 },
      }
    );
    console.log('whitelist members:', whitelistMembers);
  }

  const nfts = await client.queryContractSmart(sg721, {
    tokens: { owner: account, limit: 30 },
  });

  console.log({nfts})
  for (let id of nfts.tokens) {
    const tokenInfo = await client.queryContractSmart(sg721, {
      all_nft_info: { token_id: id },
    });
    console.log('tokenInfo:', tokenInfo);
  }

  const nftOneInfo = await client.queryContractSmart(sg721, {
    nft_info: { token_id:"1" },
  });
  console.log({nftOneInfo})

  const minterBalance = await client.getBalance(minter, 'ustars');
  console.log('minter balance:', minterBalance)
}
queryInfo();
