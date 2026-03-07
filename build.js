const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const DIST = 'dist';
const IGNORE = new Set([
    'node_modules', '.git', '.gitignore', '.DS_Store',
    'dist', 'build.js', 'package.json', 'package-lock.json'
]);

const IGNORE_PATTERNS = [/^\.env/];

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (IGNORE.has(entry.name)) continue;
        if (IGNORE_PATTERNS.some(p => p.test(entry.name))) continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// --- Clean & copy ---
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
}
console.log('Copying static files...');
copyDir('.', DIST);

// --- Load blog config ---
const configContent = fs.readFileSync('shared/blog-config.js', 'utf-8');
const blogPosts = new Function(configContent + '\nreturn blogPosts;')();

// --- Prepare template ---
let template = fs.readFileSync('blog/post.html', 'utf-8');

template = template.replace(/\.\.\/shared\//g, '/shared/');

template = template.replace(
    /\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/marked\/marked\.min\.js"><\/script>\n/,
    '\n'
);

template = template.replace(
    /\s*<script src="\/shared\/blog-config\.js"><\/script>\s*<script>[\s\S]*?<\/script>/,
    ''
);

// --- Generate blog post pages ---
console.log('Generating blog posts...');

for (const post of blogPosts) {
    const mdPath = path.join('blog', 'posts', `${post.id}.md`);
    if (!fs.existsSync(mdPath)) {
        console.warn(`  Warning: ${mdPath} not found, skipping`);
        continue;
    }

    let markdown = fs.readFileSync(mdPath, 'utf-8');
    markdown = markdown.replace(/^#\s+.+$/m, '').trim();
    const htmlContent = marked.parse(markdown);

    const canonicalUrl = `https://www.roadtestnotify.ca/blog/${encodeURIComponent(post.id)}`;
    const formattedDate = formatDate(post.date);

    const page = template
        .replace(
            /<title id="pageTitle">.*?<\/title>/,
            `<title>${post.title} - Road Test Notification</title>`
        )
        .replace(
            /<link rel="canonical" id="canonicalLink" href="[^"]*">/,
            `<link rel="canonical" href="${canonicalUrl}">`
        )
        .replace(
            /<meta property="og:url" id="ogUrl" content="[^"]*">/,
            `<meta property="og:url" content="${canonicalUrl}">`
        )
        .replace(
            /<h1 class="post-title" id="postTitle">Loading\.\.\.<\/h1>/,
            `<h1 class="post-title">${post.title}</h1>`
        )
        .replace(
            /<div class="post-meta" id="postMeta"><\/div>/,
            `<div class="post-meta">By ${post.author} \u2022 ${formattedDate}</div>`
        )
        .replace(
            /<div class="post-content" id="postContent">\s*<p>Loading blog post\.\.\.<\/p>\s*<\/div>/,
            `<div class="post-content">${htmlContent}</div>`
        );

    const outDir = path.join(DIST, 'blog', post.id);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), page);
    console.log(`  Generated: blog/${post.id}/index.html`);
}

console.log('Build complete!');
