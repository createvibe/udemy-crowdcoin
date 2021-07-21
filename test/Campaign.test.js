// core libs
const assert = require('assert');

// third party libs
const ganache = require('ganache-cli');
const Web3 = require('web3');

// init
const web3 = new Web3(ganache.provider());

const compiledCampaign = require('../ethereum/build/Campaign.json');
const compiledFactory = require('../ethereum/build/CampaignFactory.json');

let accounts;
let deployAccount;
let factory;
let campaign;
let campaignAddress;

beforeEach(async () => {

    accounts = await web3.eth.getAccounts();

    [ deployAccount ] = accounts;

    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data:compiledFactory.evm.bytecode.object })
        .send({ from:deployAccount, gas:1000000 });

    await factory.methods.createCampaign('100').send({
        from: deployAccount,
        gas: 1000000
    });

    [ campaignAddress ] = await factory.methods.getCampaigns().call();

    campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);

});

describe('Campaigns', () => {

   it('deploys a factory and a campaign', () => {
       assert.ok(factory.options.address);
       assert.ok(campaign.options.address);
   });

   it('marks factory caller as the campaign manager', async () => {
       const manager = await campaign.methods.manager().call();
       assert.strictEqual(deployAccount, manager);
   });

   it('requires a minimum contribution', async () => {
       try {
           await campaign.methods.contribute().send({
               from: accounts[1],
               value: '5'
           });
           assert(false);
       } catch (e) {
           assert(!(e instanceof assert.AssertionError));
       }
   });

   it('allows people to contribute money and marks them as approvers', async () => {
       await campaign.methods.contribute().send({
           from: accounts[1],
           value: '200'
       });
       const isContributor = await campaign.methods.approvers(accounts[1]).call();
       assert(isContributor);
   });

    it('allows a manager to make a payment request', async () => {
        await campaign.methods.createRequest('test', '100', accounts[2])
            .send({ from: deployAccount, gas:1000000 });
        const request = await campaign.methods.requests(0).call();
        assert.strictEqual(request.description, 'test');
        assert.strictEqual(request.value, '100');
        assert.strictEqual(request.recipient, accounts[2]);
    });

    it('processes a request', async () => {
        const contributorAccount = accounts[2];
        const vendorAccount = accounts[3];
        const requestAmount = web3.utils.toWei('5.1231231', 'ether');

        await campaign.methods.contribute().send({
            from: contributorAccount,
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods.createRequest('test', requestAmount, vendorAccount)
            .send({ from:deployAccount, gas:1000000 });

        await campaign.methods.approveRequest(0)
            .send({ from:contributorAccount, gas:1000000 });

        const vendorBalanceBeforeRequest = web3.utils.toBN(await web3.eth.getBalance(vendorAccount));

        await campaign.methods.finalizeRequest(0)
            .send({ from:deployAccount, gas:1000000 });

        const vendorBalanceAfterRequest = web3.utils.toBN(await web3.eth.getBalance(vendorAccount));
        const difference = vendorBalanceAfterRequest.sub(vendorBalanceBeforeRequest).toString();
        assert.strictEqual(difference, requestAmount);

        const request = await campaign.methods.requests(0).call();
        assert(request.isComplete);
    });

});