// third party libs
import React from 'react';
import { Button, Card, Grid } from 'semantic-ui-react';

// local libs
import { Link } from '../../routes';
import web3 from '../../../ethereum/lib/web3';
import ContributeForm from '../../components/ContributeForm';
import CampaignService from '../../services/CampaignService';

/**
 * The campaign details page component
 */
export default class CampaignDetails extends React.Component {

    static async getInitialProps(props) {
        let error = null
        let summary = null;
        try {
            summary = await CampaignService.getCampaignSummaryByAddress(props.query.address);
        } catch (err) {
            error = err.message;
        }
        return {
            error,
            summary,
            address: props.query.address
        };
    }

    renderCards() {
        const summary = this.props.summary;
        const items = [
            {
                header: summary.manager,
                meta: 'Address of Manager',
                description: 'The manager created this campaign and can create requests to withdraw money.',
                style: {overflowWrap: 'break-word'}
            },
            {
                header: summary.minContribution,
                meta: 'Minimum Contribution (wei)',
                description: 'You must contribute at least this much wei to become an approver.'
            },
            {
                header: summary.numRequests,
                meta: 'Number Of Requests',
                description: 'A request attempts to withdraw money from a contract. Approvers must approve a request.'
            },
            {
                header: summary.numApprovers,
                meta: 'Number Of Approvers',
                description: 'Number of people who have already donated to this campaign.'
            },
            {
                header: web3.utils.fromWei(summary.balance, 'ether'),
                meta: 'Campaign Balance (ether)',
                description: 'The balance is the amount of money left to spend in the campaign.'
            }
        ];
        return <Card.Group items={items} />
    }

    render() {
        if (this.props.error) {
            return <h3>Could not find campaign details for address: {this.props.address}</h3>
        }
        return (
            <div>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={11}>
                            <h3>Campaign Details</h3>
                            {this.renderCards()}
                        </Grid.Column>
                        <Grid.Column width={5}>
                            <h3>Make a Contribution</h3>
                            <p>
                                If you would like to contribute to this campaign, please specify the amount of Ether you would like to give.
                            </p>
                            <ContributeForm address={this.props.address} />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <Link route={`/campaigns/${encodeURIComponent(this.props.address)}/requests`}>
                                <a>
                                    <Button primary type='button'>View Requests</Button>
                                </a>
                            </Link>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}