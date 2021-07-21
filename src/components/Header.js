// third party libs
import React from 'react';
import { Menu } from 'semantic-ui-react';

// local libs
import { Link } from '../routes';

/**
 * The header layout component
 * @returns {JSX.Element}
 * @constructor
 */
const Header = () => {
    return (
        <header>
            <nav>
                <Menu style={{ marginTop: '10px', marginBottom: '30px' }}>
                    <Link route="/">
                        <a className="item">CrowdCoin</a>
                    </Link>
                    <Menu.Menu position="right">
                        <Link route="/">
                            <a className="item">Campaigns</a>
                        </Link>
                        <Link route="/campaigns/new">
                            <a title="Create a New Campaign" className="item">+</a>
                        </Link>
                    </Menu.Menu>
                </Menu>
            </nav>
        </header>
    );
};

export default Header;