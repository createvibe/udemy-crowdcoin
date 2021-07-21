// third party libs
import React from 'react';
import { Form, Input, Button, Message } from 'semantic-ui-react';

// local libs
import { Router } from '../../routes';
import CampaignService from '../../services/CampaignService';

/**
 * The create a new campaign page
 */
export default class CampaignNew extends React.Component {

    state = {
        error: null,
        loading: false,
        minContribution: ''
    };

    onSubmit = async (evt) => {
        evt.preventDefault();
        this.setState({ loading:true, error:null });
        try {
            await CampaignService.createCampaign(this.state.minContribution);
            Router.pushRoute('/');
        } catch (err) {
            this.setState({ error:err.message });
        }
        this.setState({ loading:false });
    };

    render() {
        return (
            <Form onSubmit={this.onSubmit}>
                <h3>Create a New Campaign</h3>
                <Form.Field>
                    <label>Minimum Contribution</label>
                    <Input
                        label="wei"
                        labelPosition="right"
                        placeholder="minimum amount of wei to contribute"
                        value={this.state.minContribution}
                        onChange={evt => this.setState({ minContribution: evt.target.value })}
                    />
                </Form.Field>
                {this.state.error ? <Message error visible header="Oops!" content={this.state.error} /> : ''}
                <Button
                    primary
                    disabled={this.state.loading}
                    loading={this.state.loading}
                    type="submit"
                >
                    Create Campaign
                </Button>
            </Form>
        );
    }
}