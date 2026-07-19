const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function cleanFile(filePath) {
    if (filePath.endsWith('.scss')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let lines = content.split('\n');
        let modified = false;

        lines = lines.filter(line => {
            // Remove lines that look like root SCSS variable assignments which got mangled
            if (line.match(/^var\(--[a-zA-Z0-9-]+\):/)) {
                modified = true;
                return false;
            }
            // Remove leftover root SCSS vars
            if (line.match(/^\$[a-zA-Z0-9-]+:/)) {
                modified = true;
                return false;
            }
            return true;
        });

        if (modified) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log(`Cleaned: ${filePath}`);
        }
    }
}

function traverseDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else {
            cleanFile(fullPath);
        }
    });
}

traverseDirectory(directoryPath);
console.log('Done cleaning SCSS files.');
