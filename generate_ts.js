const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'assets', 'images', 'traffic_signs', 'all', 'scraped_data.json');
const outputPath = path.join(__dirname, 'src', 'data', 'traffic_categories.ts');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

let tsContent = `// Auto-generated traffic signs from Wikipedia\nimport { Category } from '../types';\n\nexport const TRAFFIC_CATEGORIES: Category[] = [\n`;

data.forEach((cat, index) => {
    // Clean up category title
    const cleanTitle = cat.title.replace(/"/g, '\\"').replace(/&amp;/g, '&');

    tsContent += `    {\n`;
    tsContent += `        id: '${cat.id}',\n`;
    tsContent += `        title: 'Traffic Signs: ${cleanTitle}',\n`;
    tsContent += `        titleDutch: 'Verkeersborden: ${cat.words[0].dutch.charAt(0)}',\n`; // Just use the letter for Dutch title
    tsContent += `        description: '${cleanTitle} road signs',\n`;
    tsContent += `        iconName: 'Octagon',\n`;
    tsContent += `        words: [\n`;

    cat.words.forEach(w => {
        // Clean up text
        const cleanEnglish = w.english.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, ' ');
        const cleanDutch = `Verkeersbord ${w.dutch}`; // e.g. "Verkeersbord A1"

        // Ensure the file exists before require
        const imgPath = `../assets/images/traffic_signs/all/${w.filename}`;

        tsContent += `            { id: '${w.id}', dutch: '${cleanDutch}', english: '${cleanEnglish}', exampleDutch: '', exampleEnglish: '', imageAsset: require('${imgPath}') },\n`;
    });

    tsContent += `        ],\n`;
    tsContent += `    }${index < data.length - 1 ? ',' : ''}\n`;
});

tsContent += `];\n`;

fs.writeFileSync(outputPath, tsContent);
console.log(`Generated TS file at ${outputPath}`);
