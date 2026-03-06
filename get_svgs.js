const fs = require('fs');
const https = require('https');
const path = require('path');

const signs = {
  'stopbord': 'File:Nederlands_verkeersbord_B7.svg',
  'verkeerslicht': 'File:Nederlands_verkeersbord_J9.svg',
  'voorrang': 'File:Nederlands_verkeersbord_B6.svg',
  'snelweg': 'File:Nederlands_verkeersbord_G3.svg',
  'rotonde': 'File:Nederlands_verkeersbord_D12.svg',
  'zebrapad': 'File:Nederlands_verkeersbord_L2.svg',
  'parkeren': 'File:Nederlands_verkeersbord_E4.svg',
  'eenrichtingsverkeer': 'File:Nederlands_verkeersbord_C2.svg',
  'snelheidslimiet': 'File:Nederlands_verkeersbord_A1-50.svg',
  'omleiding': 'File:Netherlands_road_sign_route_deviation.svg',
  'inhalen': 'File:Nederlands_verkeersbord_F1.svg',
  'doodlopende_weg': 'File:Nederlands_verkeersbord_L8.svg',
  'fietspad': 'File:Nederlands_verkeersbord_G11.svg',
  'let_op': 'File:Nederlands_verkeersbord_J37.svg',
  'verplicht': 'File:Nederlands_verkeersbord_G11.svg', // Duplication of G11 in the prompt conceptually
  'kruising': 'File:Nederlands_verkeersbord_J8.svg',
  'voorrangsweg': 'File:Nederlands_verkeersbord_B1.svg',
  'gevaar': 'File:Nederlands_verkeersbord_J37.svg' // Duplication of J37
};

const destDir = path.join(__dirname, 'src', 'assets', 'images', 'traffic_signs');

async function downloadImage(filename, wikimediaFileTitle) {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikimediaFileTitle)}&prop=imageinfo&iiprop=url&format=json`;
    
    return new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId].imageinfo && pages[pageId].imageinfo.length > 0) {
                        const fileUrl = pages[pageId].imageinfo[0].url;
                        
                        // Download actual file
                        https.get(fileUrl, { headers: { 'User-Agent': 'VocabApp/1.0' } }, (fileRes) => {
                           if (fileRes.statusCode === 200) {
                               const destPath = path.join(destDir, `${filename}.svg`);
                               const fileStream = fs.createWriteStream(destPath);
                               fileRes.pipe(fileStream);
                               fileStream.on('finish', () => {
                                   console.log(`Successfully downloaded ${filename}.svg`);
                                   resolve();
                               });
                           } else {
                               reject(new Error(`Failed to download ${filename}, status code: ${fileRes.statusCode}`));
                           }
                        }).on('error', reject);
                    } else {
                        reject(new Error(`Could not find image URL for ${wikimediaFileTitle}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    for (const [filename, fileTitle] of Object.entries(signs)) {
        try {
            await downloadImage(filename, fileTitle);
        } catch (e) {
            console.error(e.message);
        }
    }
}

run();
