const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

const DIST = 'dist';
const POSTS_DIR = path.join('blog', 'posts');
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

function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// --- Clean & copy ---
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
}
console.log('Copying static files...');
copyDir('.', DIST);

// --- Discover blog posts from .md files ---
console.log('Discovering blog posts...');
const postFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
const blogPosts = [];
for (const file of postFiles) {
    const id = path.basename(file, '.md');
    const mdPath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(mdPath, 'utf-8');
    const { data, content } = matter(raw);
    const title = data.title;
    const date = data.date;
    const author = data.author;
    if (!title || !date || !author) {
        console.warn(`  Warning: ${mdPath} missing title/date/author in frontmatter, skipping`);
        continue;
    }
    const excerpt = data.excerpt != null ? String(data.excerpt) : '';
    let body = content.replace(/^#\s+.+$/m, '').trim();
    blogPosts.push({ id, title, date, excerpt, author, body });
}
blogPosts.sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0));

// --- Write generated blog config (for post pages that still load it) ---
const configJs = '// Blog configuration (auto-generated from blog/posts/*.md)\nconst blogPosts = ' +
    JSON.stringify(blogPosts.map(p => ({ id: p.id, title: p.title, date: p.date, excerpt: p.excerpt, author: p.author })), null, 4) + ';\n';
fs.mkdirSync(path.join(DIST, 'shared'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'shared', 'blog-config.js'), configJs);

// --- Prepare post template ---
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
    const htmlContent = marked.parse(post.body);
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

// --- Generate static blog index page ---
console.log('Generating blog index...');
const indexPath = path.join(DIST, 'blog', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

const listItems = blogPosts.length === 0
    ? '<p style="text-align: center; color: #666; padding: 50px;">No blog posts yet. Check back soon!</p>'
    : blogPosts.map(post => {
        const postUrl = `/blog/${encodeURIComponent(post.id)}`;
        const formattedDate = formatDate(post.date);
        const t = escapeHtml(post.title);
        const e = escapeHtml(post.excerpt);
        const a = escapeHtml(post.author);
        return `<div class="blog-card"><h2 class="blog-title"><a href="${postUrl}">${t}</a></h2><div class="blog-meta">By ${a} • ${formattedDate}</div><p class="blog-excerpt">${e}</p><a href="${postUrl}" class="read-more">Read more →</a></div>`;
    }).join('\n        ');

indexHtml = indexHtml.replace(
    /<div class="blog-list" id="blogList">\s*<!-- Blog posts will be dynamically loaded here -->\s*<\/div>/,
    `<div class="blog-list" id="blogList">\n        ${listItems}\n    </div>`
);
indexHtml = indexHtml.replace(
    /\s*<script src="\/shared\/blog-config\.js"><\/script>\s*<script>\s*\/\/ Generate blog list from config[\s\S]*?window\.addEventListener\('load', loadBlogList\);\s*<\/script>/,
    ''
);
fs.writeFileSync(indexPath, indexHtml);
console.log('  Generated: blog/index.html (static list)');

console.log('Build complete!');
