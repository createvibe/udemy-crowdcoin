// core libs
const path = require('path');

// third party libs
const fs = require('fs-extra');
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');

// local libs
const { infuraUrl, mnemonic } = require('./lib/config');
const compiledFactory = require('./build/CampaignFactory.json');

// initialize
const provider = new HDWalletProvider(mnemonic, infuraUrl);
const web3 = new Web3(provider);

(async () => {

    const accounts = await web3.eth.getAccounts();

    const [ deployAccount ] = accounts;

    console.log('Attempting to deploy from account', deployAccount);

    const contract = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({data: compiledFactory.evm.bytecode.object})
        .send({gas: 1000000, from: deployAccount});

    const deployPath = path.resolve(__dirname, 'deployed');

    await fs.remove(deployPath);
    await fs.ensureDir(deployPath);

    await fs.outputJson(
        path.resolve(deployPath, 'CampaignFactory.json'),
        contract.options,
        {spaces: 2}
    );

    console.log('Contract deployed to', contract.options.address);

})().catch(console.error);
