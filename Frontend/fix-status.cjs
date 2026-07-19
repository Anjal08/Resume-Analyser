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
            
            if (c.includes('$warning')) {
                c = c.replace(/\$warning/g, 'var(--warning)');
                modified = true;
            }
            if (c.includes('$success')) {
                c = c.replace(/\$success/g, 'var(--success)');
                modified = true;
            }
            if (c.includes('$danger')) {
                c = c.replace(/\$danger/g, 'var(--danger)');
                modified = true;
            }
            if (c.includes('$error')) {
                c = c.replace(/\$error/g, 'var(--danger)');
                modified = true;
            }
            if (c.includes('$info')) {
                c = c.replace(/\$info/g, 'var(--accent-blue)');
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
