// local libs
import web3 from './web3';
import Campaign from '../build/Campaign.json';

/**
 * Get a Campaign contract instance with a specific address
 * @param {string} address
 * @returns {Object}
 */
const getCampaign = address => new web3.eth.Contract(Campaign.abi, address);

export default getCampaign;