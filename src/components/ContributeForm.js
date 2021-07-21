// third party libs
import React from 'react';
import { Form, Input, Button, Message } from 'semantic-ui-react';

// local libs
import { Router } from '../routes';
import web3 from '../../ethereum/lib/web3';
import CampaignService from '../services/CampaignService';

export default class ContributeForm extends React.Component {
    campaign = null;

    timeout = null;

    state = {
        error: null,
        value: '',
        loading: true,
        processed: null,
    };

    onSubmit = async (evt) => {
        evt.preventDefault();
        this.setState({ loading: true, error: null, processed: null });
        try {
            const accounts = await CampaignService.getAccounts();
            await this.campaign.methods.contribute().send({
                // NOTE: gas is computed by metamask
                from: accounts[0],
                value: web3.utils.toWei(this.state.value, 'ether')
            });
            this.setState({ value: '', processed: true });
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => { this.setState({ processed: null }) }, 10000);
            Router.replaceRoute(`/campaigns/${encodeURIComponent(this.props.address)}`);
        } catch (err) {
            this.setState({ error: err.message });
        }
        this.setState({ loading: false });
    };

    componentDidMount() {
        try {
            this.campaign = CampaignService.getCampaignByAddress(this.props.address);
            this.setState({ loading: false });
        } catch (err) {
            this.setState({ error: err.message });
        }
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    render() {
        if (!this.campaign) {
            if (this.loading) {
                return '';
            }
            return <Message error visible header='Oops!' content={this.state.error || 'Could not find campaign'} />
        }
        return (
            <Form onSubmit={this.onSubmit}>
                <Form.Field>
                    <label>Amount To Contribute</label>
                    <Input
                        label='ether'
                        labelPosition='right'
                        value={this.state.value}
                        onChange={evt => this.setState({ value: evt.target.value })}
                        placeholder='amount of ether to contribute'
                    />
                </Form.Field>
                {this.state.error
                    ? <Message error visible header='Oops!' content={this.state.error} />
                    : ''}
                {this.state.loading
                    ? <Message info visible header='Processing...' content='Please wait while we process your transaction.' />
                    : ''}
                {this.state.processed
                    ? <Message success visible header='Success!' content='Thank you for contributing. Your transaction was successful.' />
                    : ''}
                <Button
                    primary
                    disabled={this.state.loading}
                    loading={this.state.loading}
                    type='submit'
                >
                    Contribute
                </Button>
            </Form>
        );
    }
}