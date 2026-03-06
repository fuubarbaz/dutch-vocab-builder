const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'assets', 'images', 'traffic_signs', 'extracted');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

let html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .item { border: 1px solid #ccc; padding: 10px; text-align: center; }
  img { max-width: 100px; max-height: 100px; }
</style>
</head>
<body>
<h1>Extracted Signs</h1>
<div class="grid">
`;

files.forEach(f => {
    html += `
  <div class="item">
    <img src="${f}" />
    <div>${f}</div>
  </div>
  `;
});

html += `
</div>
</body>
</html>
`;

fs.writeFileSync(path.join(dir, 'gallery.html'), html);
console.log('Gallery written to ' + path.join(dir, 'gallery.html'));
