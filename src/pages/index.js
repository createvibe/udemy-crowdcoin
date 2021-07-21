// third party libs
import React from 'react';
import { Card, Button  } from 'semantic-ui-react';

// local libs
import { Link } from '../routes';
import CampaignService from '../services/CampaignService';

/**
 * The index / home page
 */
export default class CampaignIndex extends React.Component {

    static async getInitialProps() {
        const campaigns = await CampaignService.getCampaigns();
        return { campaigns };
    }

    renderCampaigns() {
        const items = this.props.campaigns.map(address => {
            return {
                header: address,
                description: (
                    <Link route={`/campaigns/${encodeURIComponent(address)}`}>
                        <a>View Campaign</a>
                    </Link>
                ),
                fluid: true,
            }
        });
        return <Card.Group items={items} />
    }

    render() {
        return (
            <div>
                <h3>Open Campaigns</h3>
                <Link route="/campaigns/new">
                    <a>
                        <Button
                            floated="right"
                            content="Create Campaign"
                            icon="add circle"
                            primary={true}
                        />
                    </a>
                </Link>
                {this.renderCampaigns()}
            </div>
        );
    }
}
