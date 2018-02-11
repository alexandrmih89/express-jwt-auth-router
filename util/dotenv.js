const dotenv = require('dotenv');
const fs = require('fs');

const envPath = '.env.' + process.env.NODE_ENV;

fs.existsSync(envPath) ? dotenv.config({ path: envPath }) : dotenv.config();