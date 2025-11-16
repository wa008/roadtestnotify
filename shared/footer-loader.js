// Load shared footer HTML
(function() {
    'use strict';

    function loadFooter() {
        // Determine the path to shared folder based on current location
        const currentPath = window.location.pathname;
        let sharedPath = 'shared/';
        
        // If we're in a subdirectory, adjust the path
        if (currentPath.includes('/statistics/') || 
            currentPath.includes('/faq/') || 
            currentPath.includes('/contact/') || 
            currentPath.includes('/subscribe/')) {
            sharedPath = '../shared/';
        }

        // Fetch and insert the footer HTML
        fetch(sharedPath + 'footer.html')
            .then(response => response.text())
            .then(html => {
                // Find the footer placeholder or insert before closing body tag
                const footerPlaceholder = document.getElementById('footer-placeholder');
                if (footerPlaceholder) {
                    footerPlaceholder.outerHTML = html;
                } else {
                    // Insert before the last script tag or at the end of body
                    const scripts = document.getElementsByTagName('script');
                    if (scripts.length > 0) {
                        scripts[0].insertAdjacentHTML('beforebegin', html);
                    } else {
                        document.body.insertAdjacentHTML('beforeend', html);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading footer:', error);
            });
    }

    // Load footer when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadFooter);
    } else {
        loadFooter();
    }
})();
