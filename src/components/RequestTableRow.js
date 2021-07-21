// third party libs
import React from 'react';
import { Icon, Table, Button } from 'semantic-ui-react';

// local libs
import CampaignService from '../services/CampaignService';

const { web3 } = CampaignService;

export default class RequestTableRow extends React.Component {
    state = {
        isApprovingError: null,
        isApproving: false,
        isApproved: false,
        isFinalizing: false,
        isFinalizingError: false,
        isFinalized: false,
        canFinalize: false,
    };

    approvingTimeout = null;
    finalizingTimeout = null;

    onApprove = async (evt) => {
        evt.preventDefault();
        if (this.hasFlag()) {
            return;
        }
        this.setState({ isApprovingError: null, isApproving: true });
        try {
            const campaign = CampaignService.getCampaignByAddress(this.props.address);
            const accounts = await CampaignService.getAccounts();
            await campaign.methods.approveRequest(this.props.id).send({
                from: accounts[0]
            });
            this.setState({ isApproving: false, isApproved: true });
            if (typeof this.props.onModifyRequest === 'function') {
                this.props.onModifyRequest(this.props.id);
            }
        } catch (err) {
            this.setState({ isApproving: false, isApprovingError: err.message });
            if (this.approvingTimeout) {
                clearTimeout(this.approvingTimeout);
            }
            this.approvingTimeout = setTimeout(() => this.setState({ isApprovingError: null }), 5000);
        }
    };

    onFinalize = async (evt) => {
        evt.preventDefault();
        if (this.state.isApproving || this.state.isFinalizing || this.state.isFinalized) {
            return;
        }
        this.setState({ isFinalizingError: null, isFinalizing: true });
        try {
            const campaign = CampaignService.getCampaignByAddress(this.props.address);
            const accounts = await CampaignService.getAccounts();
            await campaign.methods.finalizeRequest(this.props.id).send({
                from: accounts[0]
            });
            this.setState({ isFinalizing: false, isFinalized: true });
            if (typeof this.props.onModifyRequest === 'function') {
                this.props.onModifyRequest(this.props.id);
            }
        } catch (err) {
            console.error(err);
            this.setState({ isFinalizing: false, isFinalizingError: err.message });
            if (this.finalizingTimeout) {
                clearTimeout(this.finalizingTimeout);
            }
            this.finalizingTimeout = setTimeout(() => this.setState({ isFinalizingError: null }), 5000);
        }
    };

    constructor(props) {
        super(props);
        this.state.isFinalized = props.request.isComplete;
        this.state.isApproved = props.request.hasUserApproved;
    }

    hasFlag() {
        return (
            this.state.isApproving ||
            this.state.isApproved ||
            this.state.isFinalizing ||
            this.state.isFinalized
        );
    }

    componentWillUnmount() {
        if (this.approvingTimeout) {
            clearTimeout(this.approvingTimeout);
            this.approvingTimeout = null;
        }
        if (this.finalizingTimeout) {
            clearTimeout(this.finalizingTimeout);
            this.finalizingTimeout = null;
        }
    }

    render() {
        const { Row, Cell } = Table;
        const {
            description,
            value,
            recipient,
            isComplete,
            approvalCount
        } = this.props.request;
        const canFinalize = approvalCount > (this.props.numApprovers / 2);
        return (
            <Row
                disabled={isComplete}
                positive={!isComplete && canFinalize}
                negative={!!this.state.isApprovingError || !!this.state.isFinalizingError}
            >
                <Cell>{this.props.id + 1}</Cell>
                <Cell>{description}</Cell>
                <Cell>{web3.utils.fromWei(value || '', 'ether')}</Cell>
                <Cell>{recipient}</Cell>
                <Cell>{approvalCount} / {this.props.numApprovers}</Cell>
                <Cell>
                    {this.state.isApproved ? <Icon disabled color='green' name='check' /> : (
                        <Button
                            basic
                            color={this.state.isApprovingError ? 'red' : 'green'}
                            type='button'
                            disabled={!this.props.isApprover || this.hasFlag()}
                            loading={this.state.isApproving}
                            onClick={this.onApprove}
                        >
                            {this.state.isApproved ? 'Approved' : 'Approve'}
                            {this.state.isApprovingError ? 'Error' : ''}
                        </Button>
                    )}
                </Cell>
                <Cell>
                    {this.state.isFinalized ? <Icon disabled color='teal' name='check' /> : (
                        <Button
                            basic
                            color={this.state.isFinalizingError ? 'red' : 'teal'}
                            type='button'
                            disabled={!canFinalize || this.state.isApproving || this.state.isFinalizing || this.state.isFinalized}
                            loading={this.state.isFinalizing}
                            onClick={this.onFinalize}
                        >
                            {this.state.isFinalized ? 'Finalized' : 'Finalize'}
                            {this.state.isFinalizingError ? 'Error' : ''}
                        </Button>
                    )}
                </Cell>
            </Row>
        );
    }
}