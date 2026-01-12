// Load shared topbar HTML
(function () {
    'use strict';

    function loadTopbar() {
        // Determine the path to shared folder based on current location
        const currentPath = window.location.pathname;
        let sharedPath = 'shared/';

        // If we're in a subdirectory, adjust the path
        if (currentPath.includes('/statistics/') ||
            currentPath.includes('/faq/') ||
            currentPath.includes('/contact/') ||
            currentPath.includes('/subscribe/') ||
            currentPath.includes('/blog/') ||
            currentPath.includes('/scope/')) {
            sharedPath = '../shared/';
        }

        // Fetch and insert the topbar HTML
        fetch(sharedPath + 'topbar.html')
            .then(response => response.text())
            .then(html => {
                // Insert topbar at the beginning of body
                document.body.insertAdjacentHTML('afterbegin', html);

                // Load the topbar functionality script
                const script = document.createElement('script');
                script.src = sharedPath + 'topbar.js';
                document.head.appendChild(script);

                // Add favicon links - use absolute paths for consistency
                const faviconLinks = [
                    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
                    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
                    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
                ];

                faviconLinks.forEach(favicon => {
                    // Check if this favicon link already exists
                    const existingLink = document.querySelector(`link[rel="${favicon.rel}"][href="${favicon.href}"]`);
                    if (!existingLink) {
                        const link = document.createElement('link');
                        link.rel = favicon.rel;
                        if (favicon.type) link.type = favicon.type;
                        if (favicon.sizes) link.sizes = favicon.sizes;
                        link.href = favicon.href;
                        document.head.appendChild(link);
                    }
                });

                // Add theme-color meta tag
                if (!document.querySelector('meta[name="theme-color"]')) {
                    const themeColor = document.createElement('meta');
                    themeColor.name = 'theme-color';
                    themeColor.content = '#0066cc';
                    document.head.appendChild(themeColor);
                }
            })
            .catch(error => {
                console.error('Error loading topbar:', error);
            });
    }

    // Load topbar when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadTopbar);
    } else {
        loadTopbar();
    }
})();
