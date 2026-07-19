const fs = require('fs');
const path = require('path');
function walk(d) {
    fs.readdirSync(d).forEach(f => {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.scss')) {
            let c = fs.readFileSync(p, 'utf8');
            let modified = false;
            
            if (c.includes('$bg-panel')) {
                c = c.replace(/\$bg-panel/g, 'var(--bg-card)');
                modified = true;
            }
            if (c.includes('$border-panel')) {
                c = c.replace(/\$border-panel/g, 'var(--border-color)');
                modified = true;
            }
            if (c.includes('$bg-sidebar')) {
                c = c.replace(/\$bg-sidebar/g, 'var(--bg-card)');
                modified = true;
            }
            if (c.includes('$sidebar-hover')) {
                c = c.replace(/\$sidebar-hover/g, 'var(--bg-hover)');
                modified = true;
            }
            if (c.includes('$bg-input')) {
                c = c.replace(/\$bg-input/g, 'var(--bg-card)');
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(p, c, 'utf8');
                console.log('Fixed:', p);
            }
        }
    });
}
walk('src');
