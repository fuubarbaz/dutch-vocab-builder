const https = require('https');
const fs = require('fs');
const path = require('path');

const signs = {
  'stopbord': 'Nederlands_verkeersbord_B7',
  'verkeerslicht': 'Nederlands_verkeersbord_J9',
  'voorrang': 'Nederlands_verkeersbord_B6',
  'snelweg': 'Nederlands_verkeersbord_G3',
  'rotonde': 'Nederlands_verkeersbord_D12',
  'zebrapad': 'Nederlands_verkeersbord_L2',
  'parkeren': 'Nederlands_verkeersbord_E4',
  'eenrichtingsverkeer': 'Nederlands_verkeersbord_C2',
  'snelheidslimiet': 'Nederlands_verkeersbord_A1-50',
  'omleiding': 'Nederlands_verkeersbord_route_deviation', 
  'inhalen': 'Nederlands_verkeersbord_F1',
  'doodlopende_weg': 'Nederlands_verkeersbord_L8',
  'fietspad': 'Nederlands_verkeersbord_G11',
  'let_op': 'Nederlands_verkeersbord_J37',
  'verplicht': 'Nederlands_verkeersbord_G11',
  'kruising': 'Nederlands_verkeersbord_J8',
  'voorrangsweg': 'Nederlands_verkeersbord_B1',
  'gevaar': 'Nederlands_verkeersbord_J37'
};

const destDir = path.join(__dirname, 'src', 'assets', 'images', 'traffic_signs');
const USER_AGENT = 'DutchVocabApp/1.0 (https://github.com/example/dutch-vocab; example@example.com) Node.js/18';

function download(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                response.pipe(file);
                file.on('finish', () => { file.close(resolve); });
            } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307 || response.statusCode === 308) {
                 download(response.headers.location, dest).then(resolve).catch(reject);
            } else {
                reject(new Error(`Status ${response.statusCode} for ${url}`));
            }
        }).on('error', reject);
    });
}

async function run() {
    for (const [filename, title] of Object.entries(signs)) {
       try {
           const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${title}.svg`;
           const dest = path.join(destDir, `${filename}.svg`);
           console.log(`Downloading ${filename}.svg...`);
           await download(url, dest);
       } catch(e) {
           console.error(`Failed ${filename}: ${e.message}`);
       }
    }
}
run();
