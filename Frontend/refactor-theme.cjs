const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
    { pattern: /\$bg-page|#0d1117/g, replacement: 'var(--bg-page)' },
    { pattern: /\$bg-card|rgba\(22, 27, 34, 0\.8\)|#161b22/g, replacement: 'var(--bg-card)' },
    { pattern: /\$text-primary|#e6edf3/g, replacement: 'var(--text-primary)' },
    { pattern: /\$text-muted|#8b949e/g, replacement: 'var(--text-secondary)' },
    { pattern: /\$border-color|rgba\(255, 255, 255, 0\.1\)|#30363d/g, replacement: 'var(--border-color)' },
    { pattern: /\$accent-blue|#58a6ff/g, replacement: 'var(--accent-blue)' },
    { pattern: /\$accent-purple|#8b5cf6/g, replacement: 'var(--accent-purple)' },
    { pattern: /#4ade80/g, replacement: 'var(--success)' },
    { pattern: /#facc15/g, replacement: 'var(--warning)' },
    { pattern: /#f87171|#d20d3b/g, replacement: 'var(--danger)' },
    // Hover backgrounds
    { pattern: /rgba\(255, 255, 255, 0\.05\)|rgba\(255, 255, 255, 0\.1\)/g, replacement: 'var(--bg-hover)' },
    // A few manual adjustments where lightened backgrounds are used
    { pattern: /rgba\(255, 255, 255, 0\.03\)/g, replacement: 'var(--bg-card)' },
    { pattern: /rgba\(255, 255, 255, 0\.08\)/g, replacement: 'var(--border-color)' },
];

function processFile(filePath) {
    if (filePath.endsWith('.scss')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        replacements.forEach(({ pattern, replacement }) => {
            if (pattern.test(content)) {
                content = content.replace(pattern, replacement);
                modified = true;
            }
        });

        // Also clean up SCSS variable imports/declarations if they exist
        const scssVarDecl = /^\$.*?;\n/gm;
        if (scssVarDecl.test(content) && filePath.includes('interview.scss')) {
            content = content.replace(scssVarDecl, '');
            modified = true;
        }

        // Deal with `lighten` sass function which breaks with CSS vars
        // We will just replace `lighten(var(--text-secondary), X%)` with `var(--text-primary)` 
        // because it's usually used for hover states or active states.
        const lightenTextSecondary = /lighten\(var\(--text-secondary\), [0-9]+%\)/g;
        if (lightenTextSecondary.test(content)) {
            content = content.replace(lightenTextSecondary, 'var(--text-primary)');
            modified = true;
        }

        const lightenBorder = /lighten\(var\(--border-color\), [0-9]+%\)/g;
        if (lightenBorder.test(content)) {
            content = content.replace(lightenBorder, 'var(--accent-blue)');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    }
}

function traverseDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else {
            processFile(fullPath);
        }
    });
}

traverseDirectory(directoryPath);
console.log('Done refactoring SCSS files.');
