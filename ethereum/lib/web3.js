// third party libs
const Web3 = require('web3');

let web3;

if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
    const provider = new Web3.providers.HttpProvider(require('./config').infuraUrl);
    web3 = new Web3(provider);
} else {
    window.ethereum.request({ method: 'eth_requestAccounts' });
    web3 = new Web3(window.ethereum);
}

export default web3;