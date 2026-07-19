const fs = require('fs');
const path = require('path');
function walk(d) {
    fs.readdirSync(d).forEach(f => {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.scss')) {
            let c = fs.readFileSync(p, 'utf8');
            if (c.includes('$accent')) {
                fs.writeFileSync(p, c.replace(/\$accent/g, 'var(--accent-blue)'), 'utf8');
                console.log('Fixed:', p);
            }
        }
    });
}
walk('src');
