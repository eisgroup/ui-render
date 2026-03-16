const fs = require('fs');
const path = require('path');

// Copy theme.config to semantic-ui-less so LESS can find it
const src = path.resolve(__dirname, '../override/theme.config');
const dest = path.resolve(__dirname, '../../../node_modules/semantic-ui-less/theme.config');
if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
}
