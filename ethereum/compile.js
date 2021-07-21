// core libs
const path = require('path');

// third party libs
const fs = require('fs-extra');
const solc = require('solc');

const solcInput = {
    language: 'Solidity',
    sources: {
        'Campaign.sol': {
            content: fs.readFileSync(path.resolve(__dirname, 'contracts', 'Campaign.sol'), 'utf8')
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};
const { errors, contracts } = JSON.parse(solc.compile(JSON.stringify(solcInput)));

if (errors) {
    errors.forEach(err => console.error(err.formattedMessage));
}

if (contracts) {
    const buildPath = path.resolve(__dirname, 'build');
    fs.removeSync(buildPath);
    fs.ensureDirSync(buildPath);
    const campaignContracts = contracts['Campaign.sol'];
    for (const name of Object.getOwnPropertyNames(campaignContracts)) {
        fs.outputJsonSync(
            path.resolve(buildPath, name + '.json'),
            campaignContracts[name],
            { spaces: 2 }
        );
    }
}