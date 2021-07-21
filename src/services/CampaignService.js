// third party libs
import web3 from '../../ethereum/lib/web3';

// local libs
import factory from '../../ethereum/lib/factory';
import getCampaign from '../../ethereum/lib/campaign';

/**
 * The CampaignService helps with tasks related to the Campaign and CampaignFactory contract ABI
 */
export default class CampaignService {
    /**
     * Get a list of available accounts
     * @returns {Promise<string[]>}
     */
    static async getAccounts() {
        // NOTE: assuming metamask
        return await web3.eth.getAccounts();
    }

    /**
     * Helper to get the web3 instance
     * @returns {Object}
     */
    static get web3() {
        return web3;
    }

    /**
     * Create a new Campaign from the CampaignFactory
     * @param {number} minContribution The minimum campaign contribution
     * @returns {Promise<void>}
     */
    static async createCampaign(minContribution) {
        const [ fromAccount ] = await this.getAccounts();
        await factory.methods.createCampaign(minContribution).send({
            // NOTE: metamask is calculating the amount of gas to run this function
            from: fromAccount
        });
    }

    /**
     * Get a list of campaigns from the CampaignFactory
     * @returns {Promise<Object>}
     */
    static async getCampaigns() {
        return await factory.methods.getCampaigns().call();
    }

    /**
     * Get a Campaign by its deployed address
     * @param {string} address The campaign deployed address
     * @returns {Object}
     */
    static getCampaignByAddress(address) {
        try {
            return getCampaign(address);
        } catch (err) {
            const error = new Error('Unable to retrieve campaign by address: ' + address);
            error.previous = err;
            throw error;
        }
    }

    /**
     * Get all requests for a campaign by address
     * @param {string} address The deployed campaign address
     * @returns {Promise<Object[]>}
     */
    static async getCampaignRequestsByAddress(address) {
        return await this.getCampaignRequests(this.getCampaignByAddress(address));
    }

    /**
     * Get all requests for a campaign contract instance
     * @param {Object} campaign The campaign to get requests from
     * @returns {Promise<Object[]>} The request structs
     */
    static async getCampaignRequests(campaign) {
        const requestCount = await campaign.methods.getRequestCount().call();
        const p = [];
        for (let idx = 0; idx < requestCount; idx++) {
            p.push(campaign.methods.requests(idx).call());
        }
        return await Promise.all(p);
    }

    /**
     * Get a single campaign request for the current user account
     * @param {Object} campaign The campaign to get a request from
     * @param {number} idx The request index
     * @param {string|null} [account] The user account address to check for
     * @returns {Promise<Object>} The request struct
     */
    static async getCampaignRequestForUser(campaign, idx, account) {
        return Promise.all([
            campaign.methods.requests(idx).call(),
            this.hasUserApprovedRequest(campaign, idx, account)
        ]).then(([ request, hasApproved ]) => {
            request.hasUserApproved = hasApproved;
            return request;
        });
    }

    /**
     * See if a user account has approved a request
     * @param {Object} campaign The campaign to get a request from
     * @param {number} idx The request index
     * @param {string|null} [account] The user account address to check for
     * @returns {Promise<boolean>}
     */
    static async hasUserApprovedRequest(campaign, idx, account = null) {
        if (!account) {
            [ account ] = await this.getAccounts();
        }
        return campaign.methods.hasApprovedRequest(idx, account).call();
    }

    /**
     * Get the summary information for a Campaign by its deployed address
     * @param {string} address The campaign deployed address
     * @returns {Promise<{numApprovers: *, balance: *, manager: *, numRequests: *, minContribution: *}>}
     */
    static async getCampaignSummaryByAddress(address) {
        return await this.getCampaignSummary(this.getCampaignByAddress(address));
    }

    /**
     * Get the summary information for a Campaign by its deployed address
     * @param {Object} campaign The campaign
     * @returns {Promise<{numApprovers: *, balance: *, manager: *, numRequests: *, minContribution: *}>}
     */
    static async getCampaignSummary(campaign) {
        const summary = await campaign.methods.getSummary().call();
        const [
            minContribution,
            balance,
            numRequests,
            numApprovers,
            manager
        ] = Object.getOwnPropertyNames(summary).map(key => summary[key]);
        return {
            minContribution,
            balance,
            numRequests,
            numApprovers,
            manager
        };
    }

    /**
     * Create a request for a campaign by its deployed address
     * @param {string} address The deployed campaign address, to create a request on
     * @param {string} description The description for the request
     * @param {string|number} amount The amount of ether to request
     * @param {string} recipient The recipient address
     * @returns {Promise<void>}
     * @throws Error
     */
    static async createCampaignRequestByAddress(address, { description, amount, recipient }) {
        return await this.createCampaignRequest(
            this.getCampaignByAddress(address),
            { description, amount, recipient }
        );
    }

    /**
     * Create a request for a campaign
     * @param {Object} campaign The campaign to create a request on
     * @param {string} description The description for the request
     * @param {string|number} amount The amount of ether to request
     * @param {string} recipient The recipient address
     * @returns {Promise<void>}
     * @throws Error
     */
    static async createCampaignRequest(campaign, { description, amount, recipient }) {
        const weiAmount = web3.utils.toWei(amount, 'ether');
        const accounts = await web3.eth.getAccounts();
        await campaign.methods.createRequest(description, weiAmount, recipient).send({
            // NOTE: metamask calculates the gas for us
            from: accounts[0]
        });
    }
}