// third party libs
import React from 'react';
import { Table, Button } from 'semantic-ui-react';

// local libs
import { Link } from '../../../routes';
import CampaignService from '../../../services/CampaignService';
import RequestTableRow from '../../../components/RequestTableRow';

/**
 * The campaign request listing
 */
export default class CampaignRequests extends React.Component {
    state = {
        error: null,
        isApprover: false,
        requests: null
    };

    static async getInitialProps(props) {
        let campaign;
        try {
            campaign = CampaignService.getCampaignByAddress(props.query.address);
        } catch (err) {
            return { error: err.message };
        }
        const [ numApprovers, requests ] = await Promise.all([
            campaign.methods.numApprovers().call(),
            CampaignService.getCampaignRequests(campaign)
        ]);
        return {
            requests,
            numApprovers,
            address: props.query.address,
        };
    }

    onModifyRequest = async (index) => {
        if (typeof this.state.requests[index] === 'undefined') {
            return;
        }
        try {
            const campaign = CampaignService.getCampaignByAddress(this.props.address);
            const request = await CampaignService.getCampaignRequestForUser(campaign, index);
            if (request) {
                const requests = this.state.requests;
                requests[index] = request;
                this.setState({ requests });
            }
        } catch (err) { }
    };

    constructor(props) {
        super(props);
        if (props.error) {
            this.state.error = props.error;
        }
    }

    async initializeRequestState() {
        // NOTE: this has to be done in the client because the server does not know the user's account address
        const campaign = CampaignService.getCampaignByAddress(this.props.address);
        const [ account ] = await CampaignService.getAccounts();
        const isApprover = await campaign.methods.approvers(account).call();
        let requests = this.props.requests;
        if (isApprover) {
            // NOTE: referencing the requests as state so we can keep track of changes
            requests = await Promise.all(this.props.requests.map((request, idx) => {
                return CampaignService.hasUserApprovedRequest(campaign, idx, account).then(hasApproved => {
                    request.hasUserApproved = hasApproved;
                    return request;
                });
            }));
        }
        this.setState({ requests, isApprover });
    }

    componentDidMount() {
        this.initializeRequestState().catch(err => {
            console.error(err);
            this.setState({ error: err.message });
        });
    }

    render() {
        if (this.state.error) {
            return <h3>Could not load campaign requests for address: {this.props.address}</h3>
        }

        if (this.state.requests === null) {
            return <h3>Loading Campaign Requests...</h3>;
        }

        let title;
        if (this.state.requests.length === 0) {
            title = <h3>There are no requests for this campaign.</h3>
        } else {
            title = <h3>The Campaign Request Listing Page</h3>;
        }
        const numRequests = this.state.requests.length;
        const { Header, HeaderCell, Row, Body } = Table;

        return (
            <div>
                {title}
                <p>
                    Requests for the campaign at address&nbsp;
                    <Link route={`/campaigns/${encodeURIComponent(this.props.address)}`}>
                        <a>{this.props.address}</a>
                    </Link>
                </p>
                <Link route={`/campaigns/${encodeURIComponent(this.props.address)}/requests/new`}>
                    <a>
                        <Button
                            primary
                            floated='right'
                            type='button'
                            style={{marginBottom: '10px'}}
                        >
                            Create Request
                        </Button>
                    </a>
                </Link>
                <Table>
                    <Header>
                        <Row>
                            <HeaderCell>ID</HeaderCell>
                            <HeaderCell>Description</HeaderCell>
                            <HeaderCell>Amount</HeaderCell>
                            <HeaderCell>Recipient</HeaderCell>
                            <HeaderCell>Approvals</HeaderCell>
                            <HeaderCell>Approve</HeaderCell>
                            <HeaderCell>Finalize</HeaderCell>
                        </Row>
                    </Header>
                    <Body>
                        {this.state.requests.map((request, idx) => (
                            <RequestTableRow
                                key={idx}
                                id={idx}
                                request={request}
                                address={this.props.address}
                                numApprovers={this.props.numApprovers}
                                isApprover={this.state.isApprover}
                                onModifyRequest={this.onModifyRequest}
                            />
                        ))}
                    </Body>
                </Table>
                <p style={{marginTop: '10px'}}>Found {numRequests} request{numRequests !== 1 ? 's' : ''}</p>
            </div>
        );
    }
}