const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Backgrounds
            content = content.replace(/#0a0f1e/g, 'var(--bg-dark)');
            content = content.replace(/#070d1a/g, 'var(--bg-card2)');
            content = content.replace(/#111827/g, 'var(--bg-card)');
            content = content.replace(/#0d1526/g, 'var(--bg-card2)');
            content = content.replace(/#030712/g, 'var(--bg-card)');
            
            // Text colors
            content = content.replace(/#f1f5f9/g, 'var(--text-primary)');
            content = content.replace(/#94a3b8/g, 'var(--text-secondary)');
            // For #64748b we mapped it to text-muted in globals, so we can keep it as var(--text-muted)
            content = content.replace(/#64748b/g, 'var(--text-muted)');
            content = content.replace(/#475569/g, 'var(--text-secondary)');

            // Borders / structural
            content = content.replace(/#1e293b/g, 'var(--border)');

            // Adjust rgba for dark mode borders/bg to light mode
            content = content.replace(/rgba\(255,255,255,0\.02\)/g, 'var(--bg-card)');
            content = content.replace(/rgba\(255,255,255,0\.03\)/g, 'rgba(0,0,0,0.03)');
            content = content.replace(/rgba\(255,255,255,0\.04\)/g, 'var(--bg-card)');
            content = content.replace(/rgba\(255,255,255,0\.05\)/g, 'var(--bg-card2)');
            content = content.replace(/rgba\(255,255,255,0\.06\)/g, 'var(--border)');
            content = content.replace(/rgba\(255,255,255,0\.08\)/g, 'var(--border)');
            content = content.replace(/rgba\(255,255,255,0\.1\)/g, 'var(--border)');
            content = content.replace(/rgba\(255,255,255,0\.15\)/g, 'var(--border)');

            // There might be some with spaces
            content = content.replace(/rgba\(255, 255, 255, 0\.02\)/g, 'var(--bg-card)');
            content = content.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(0,0,0,0.03)');
            content = content.replace(/rgba\(255, 255, 255, 0\.04\)/g, 'var(--bg-card)');
            content = content.replace(/rgba\(255, 255, 255, 0\.05\)/g, 'var(--bg-card2)');
            content = content.replace(/rgba\(255, 255, 255, 0\.06\)/g, 'var(--border)');
            content = content.replace(/rgba\(255, 255, 255, 0\.08\)/g, 'var(--border)');
            content = content.replace(/rgba\(255, 255, 255, 0\.1\)/g, 'var(--border)');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

traverse(srcDir);
console.log('Done');
