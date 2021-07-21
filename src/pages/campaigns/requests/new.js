// third party libs
import React from 'react';
import { Form, Input, Button, Message } from 'semantic-ui-react';

// local libs
import { Router, Link } from '../../../routes';
import CampaignService from '../../../services/CampaignService';

/**
 * The create a new campaign request page
 */
export default class CampaignRequestNew extends React.Component {

    state = {
        error: null,
        loading: false,
        description: '',
        amount: '',
        recipient: ''
    };

    onSubmit = async (evt) => {
        evt.preventDefault();
        this.setState({ loading:true, error:null, processed:null });
        try {
            await CampaignService.createCampaignRequestByAddress(
                this.props.address,
                {
                    description: this.state.description,
                    amount: this.state.amount,
                    recipient: this.state.recipient
                }
            );
            this.setState({ processed: true });
            Router.pushRoute(`/campaigns/${encodeURIComponent(this.props.address)}/requests`);
        } catch (err) {
            this.setState({ error:err.message });
        }
        this.setState({ loading:false });
    };

    static async getInitialProps(props) {
        let error = null
        try {
            await CampaignService.getCampaignByAddress(props.query.address);
        } catch (err) {
            error = err.message;
        }
        return {
            error,
            address: props.query.address
        };
    }

    render() {
        if (this.props.error) {
            return <h3>Could not find campaign for address: {this.props.address}</h3>
        }
        return (
            <Form onSubmit={this.onSubmit}>
                <h3>Create a New Request</h3>
                <p>
                    Create a new request for the campaign at&nbsp;
                    <Link route={`/campaigns/${encodeURIComponent(this.props.address)}`}>
                        <a>{this.props.address}</a>
                    </Link>
                </p>
                <Form.Field>
                    <label>Description</label>
                    <Input
                        required
                        placeholder='description for the request'
                        value={this.state.description}
                        onChange={evt => this.setState({ description: evt.target.value })}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Request Amount</label>
                    <Input
                        required
                        label='ether'
                        labelPosition='right'
                        placeholder='amount of ether to request'
                        value={this.state.amount}
                        onChange={evt => this.setState({ amount: evt.target.value })}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Recipient</label>
                    <Input
                        required
                        label='address'
                        labelPosition='right'
                        placeholder='address of the recipient'
                        value={this.state.recipient}
                        onChange={evt => this.setState({ recipient: evt.target.value })}
                    />
                </Form.Field>
                {this.state.error
                    ? <Message error visible header="Oops!" content={this.state.error} />
                    : ''}
                {this.state.loading
                    ? <Message info visible header='Processing...' content='Please wait while we process your request.' />
                    : ''}
                {this.state.processed
                    ? <Message success visible header='Success!' content='Your request was created successfully.' />
                    : ''}
                <Button
                    primary
                    disabled={this.state.loading}
                    loading={this.state.loading}
                    type='submit'
                >
                    Create Request
                </Button>
                <Link route={`/campaigns/${encodeURIComponent(this.props.address)}/requests`}>
                    <a>
                        <Button
                            disabled={this.state.loading}
                            type='button'
                        >
                            Cancel
                        </Button>
                    </a>
                </Link>
            </Form>
        );
    }
}