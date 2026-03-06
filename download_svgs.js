const fs = require('fs');
const https = require('https');
const path = require('path');

const signs = [
  { file: 'stopbord.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Nederlands_verkeersbord_B7.svg' },
  { file: 'verkeerslicht.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Nederlands_verkeersbord_J9.svg' },
  { file: 'voorrang.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Nederlands_verkeersbord_B6.svg' },
  { file: 'snelweg.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Nederlands_verkeersbord_G3.svg' },
  { file: 'rotonde.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Nederlands_verkeersbord_D12.svg' },
  { file: 'zebrapad.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Nederlands_verkeersbord_L2.svg' },
  { file: 'parkeren.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Nederlands_verkeersbord_E4.svg' },
  { file: 'eenrichtingsverkeer.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Nederlands_verkeersbord_C2.svg' },
  { file: 'snelheidslimiet.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Nederlands_verkeersbord_A1-50.svg' },
  { file: 'omleiding.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/archive/1/11/20161226084627%21Netherlands_road_sign_route_deviation.svg' }, // keeping as is since it's an archive link
  { file: 'inhalen.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Nederlands_verkeersbord_F1.svg' },
  { file: 'doodlopende_weg.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Nederlands_verkeersbord_L8.svg' },
  { file: 'fietspad.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Nederlands_verkeersbord_G11.svg' },
  { file: 'let_op.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Nederlands_verkeersbord_J37.svg' },
  { file: 'verplicht.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Nederlands_verkeersbord_G11.svg' },
  { file: 'kruising.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Nederlands_verkeersbord_J8.svg' },
  { file: 'voorrangsweg.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Nederlands_verkeersbord_B1.svg' },
  { file: 'gevaar.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Nederlands_verkeersbord_J37.svg' },
];

const destDir = path.join(__dirname, 'src', 'assets', 'images', 'traffic_signs');

signs.forEach(({ file, url }) => {
  const destPath = path.join(destDir, file);
  https.get(url, (response) => {
    if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        console.log(`Downloaded ${file}`);
      });
    } else {
      console.log(`Failed to download ${file}, status code: ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${file}: ${err.message}`);
  });
});
