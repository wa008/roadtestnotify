# How to Use the Shared Top Navigation Bar

## Quick Start

The fixed top navigation bar has been created as a reusable component. It's already integrated into your main `index.html` page.

## Files Created

- **`shared/topbar.html`** - The HTML structure of the navigation bar
- **`shared/topbar.css`** - All styling for the navigation bar
- **`shared/topbar.js`** - JavaScript for mobile menu toggle and active page highlighting

## How to Add the Topbar to Other Pages

To add the topbar to any page (like FAQ or Statistics pages), follow these 3 simple steps:

### Step 1: Add the CSS link in the `<head>` section

```html
<head>
    <!-- Your other head content -->
    <link rel="stylesheet" href="shared/topbar.css">
    <!-- Or use ../shared/topbar.css if the page is in a subfolder -->
</head>
```

### Step 2: Add the topbar HTML right after the `<body>` tag

```html
<body>
    <!-- Fixed Top Navigation Bar -->
    <nav id="topbar" class="topbar">
        <div class="topbar-container">
            <a href="https://www.roadtestnotify.ca/" class="topbar-brand">Road Test Notify</a>
            
            <button class="topbar-toggle" id="topbarToggle" aria-label="Toggle navigation">
                <span class="hamburger-icon">☰</span>
            </button>
            
            <ul class="topbar-menu" id="topbarMenu">
                <li class="topbar-item">
                    <a href="https://www.roadtestnotify.ca/" class="topbar-link" data-page="home">Home</a>
                </li>
                <li class="topbar-item">
                    <a href="https://www.roadtestnotify.ca/statistics" class="topbar-link" data-page="statistics">Release Statistics</a>
                </li>
                <li class="topbar-item">
                    <a href="https://www.roadtestnotify.ca/faq" class="topbar-link" data-page="faq">FAQ</a>
                </li>
                <!-- Add more navigation items here as needed -->
            </ul>
        </div>
    </nav>

    <!-- Your page content starts here -->
```

### Step 3: Add the JavaScript before the closing `</body>` tag

```html
    <!-- Your page content -->
    
    <script src="shared/topbar.js"></script>
    <!-- Or use ../shared/topbar.js if the page is in a subfolder -->
</body>
</html>
```

### Step 4 (Optional): Add padding to your body

If your page content appears behind the fixed topbar, add this CSS:

```css
body {
    padding-top: 60px;
}
```

Or the JavaScript will automatically add the class `has-topbar` to the body, so you can use:

```css
body.has-topbar {
    padding-top: 60px;
}
```

## How to Add More Navigation Items

To add a new button to the navigation bar, simply add a new `<li>` item inside the `<ul class="topbar-menu">`:

```html
<ul class="topbar-menu" id="topbarMenu">
    <li class="topbar-item">
        <a href="https://www.roadtestnotify.ca/" class="topbar-link" data-page="home">Home</a>
    </li>
    <li class="topbar-item">
        <a href="https://www.roadtestnotify.ca/statistics" class="topbar-link" data-page="statistics">Release Statistics</a>
    </li>
    <li class="topbar-item">
        <a href="https://www.roadtestnotify.ca/faq" class="topbar-link" data-page="faq">FAQ</a>
    </li>
    <!-- NEW ITEM - Just copy this pattern -->
    <li class="topbar-item">
        <a href="https://www.roadtestnotify.ca/contact" class="topbar-link" data-page="contact">Contact</a>
    </li>
</ul>
```

**Important:** Add the new item to ALL pages where you use the topbar to keep navigation consistent.

## Features

✅ **Fixed Position** - Stays at the top when scrolling  
✅ **Blue Background** - Professional blue (#0066cc) with white text  
✅ **Mobile Responsive** - Hamburger menu on small screens  
✅ **Active Page Highlighting** - Automatically highlights the current page  
✅ **Easy to Extend** - Just add new `<li>` items to add more buttons  
✅ **Consistent Design** - Matches your site's color scheme  

## Customization

### Change Colors

Edit `shared/topbar.css`:

```css
.topbar {
    background-color: #0066cc; /* Change this for different blue */
}

.topbar-link:hover {
    background-color: #0052a3; /* Hover color */
}

.topbar-link.active {
    background-color: #004080; /* Active page color */
}
```

### Change Height

Edit `shared/topbar.css`:

```css
.topbar {
    height: 60px; /* Change height here */
}

body.has-topbar {
    padding-top: 60px; /* Match the height */
}
```

### Change Brand Text

Simply edit the text in the HTML:

```html
<a href="https://www.roadtestnotify.ca/" class="topbar-brand">Road Test Notify</a>
```

## Browser Compatibility

Works on all modern browsers including:
- Chrome, Firefox, Safari, Edge
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Need Help?

If you encounter any issues or need to customize further, check the CSS and JavaScript files in the `shared/` folder. The code is well-commented and easy to modify.
