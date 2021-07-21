// third party libs
import React from 'react';
import { Container } from 'semantic-ui-react';

// local libs
import Header from './Header';

/**
 * The Layout component
 * @constructor
 */
const Layout = (props) => {
    return (
        <Container>
            <Header />
            <section>
                {props.children}
            </section>
        </Container>
    );
};

export default Layout;