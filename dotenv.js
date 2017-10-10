import dotenv from 'dotenv';
let path = '.env';

if(process.env.NODE_ENV !== 'production') {
  path = path + '.' + process.env.NODE_ENV;
}

console.log(`Getting config from ${path}`);

dotenv.config({ path });