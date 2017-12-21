import dotenv from 'dotenv';
import fs from 'fs';

const envPath = '.env.' + process.env.NODE_ENV;

fs.existsSync(envPath) ? dotenv.config({ path: envPath }) : dotenv.config();