# Blog System README

## Overview
This blog system uses Markdown files for easy content creation. Each blog post is a separate `.md` file that gets converted to HTML automatically.

## How to Add a New Blog Post

### Step 1: Create the Markdown File
Create a new file in the `blog/posts/` directory with a descriptive filename (use lowercase and hyphens):
- Example: `tips-for-road-test.md`
- Example: `understanding-g2-requirements.md`

### Step 2: Write Your Content
Write your blog post using Markdown syntax. Here are some examples:

```markdown
# Main Heading

## Subheading

This is a paragraph with **bold text** and *italic text*.

- Bullet point 1
- Bullet point 2
- Bullet point 3

1. Numbered item 1
2. Numbered item 2

[Link text](https://example.com)

> This is a blockquote

` + '```' + `
Code block
` + '```' + `
```

### Step 3: Add to Configuration
Open `blog/blog-config.js` and add your new post to the `blogPosts` array:

```javascript
const blogPosts = [
    // ADD NEW POSTS HERE AT THE TOP (latest first)
    {
        id: 'your-new-post',           // Must match filename without .md
        title: 'Your Post Title',      // Display title
        date: '2025-11-20',            // Publication date (YYYY-MM-DD)
        excerpt: 'Brief description',  // Short summary for blog list
        author: 'Your Name'            // Author name
    },
    // ... older posts below
];
```

**Important**: Always add new posts at the TOP of the array. The first post in the array appears first on the blog page.

### Step 4: Test
1. Open `http://localhost:8000/blog` to see your post in the list
2. Click on it to view the full post

## File Structure
```
blog/
├── index.html              # Blog listing page
├── post.html               # Blog post template
├── blog-config.js          # Configuration (add posts here)
└── posts/                  # Markdown files
    ├── welcome-to-road-test-notify.md
    └── your-new-post.md    # Your posts here
```

## Markdown Tips
- Use `#` for headings (# is h1, ## is h2, etc.)
- Use `**text**` for bold, `*text*` for italic
- Use `[text](url)` for links
- Use `-` or `*` for bullet lists
- Use `1.`, `2.` for numbered lists
- Use `>` for blockquotes
- Use triple backticks for code blocks

## Supported Markdown Features
- Headings (h1-h6)
- Paragraphs
- Bold and italic
- Links
- Lists (ordered and unordered)
- Blockquotes
- Code blocks and inline code
- Images: `![alt text](image-url)`

## Adding Images
1. Save images to `/images/blog/` folder
2. Reference in markdown: `![Description](/images/blog/your-image.png)`

## Need Help?
If you have questions about Markdown syntax, visit: https://www.markdownguide.org/basic-syntax/
