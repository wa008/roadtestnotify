// Fixed Top Navigation Bar JavaScript
(function() {
    'use strict';

    // Wait for DOM to be ready
    function initTopbar() {
        const topbarToggle = document.getElementById('topbarToggle');
        const topbarMenu = document.getElementById('topbarMenu');
        
        // Mobile menu toggle
        if (topbarToggle && topbarMenu) {
            topbarToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                topbarMenu.classList.toggle('active');
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (topbarMenu && topbarMenu.classList.contains('active')) {
                const isClickInside = event.target.closest('.topbar-container');
                if (!isClickInside) {
                    topbarMenu.classList.remove('active');
                }
            }
        });

        // Highlight active page based on current URL
        highlightActivePage();

        // Add topbar class to body
        document.body.classList.add('has-topbar');
    }

    // Highlight the active page link
    function highlightActivePage() {
        const currentPath = window.location.pathname;
        const currentHost = window.location.host;
        const navLinks = document.querySelectorAll('.topbar-link');
        
        navLinks.forEach(link => {
            try {
                const linkUrl = new URL(link.href);
                const linkPath = linkUrl.pathname;
                
                // Check if this link matches the current page
                if (linkPath === currentPath || 
                    (currentPath === '/' && linkPath === '/') ||
                    (currentPath.includes('/index.html') && linkPath === '/')) {
                    link.classList.add('active');
                }
                
                // Also check by data-page attribute for more flexible matching
                const dataPage = link.getAttribute('data-page');
                if (dataPage) {
                    if ((dataPage === 'home' && (currentPath === '/' || currentPath.includes('index.html'))) ||
                        (dataPage === 'subscribe' && currentPath.includes('subscribe')) ||
                        (dataPage === 'statistics' && currentPath.includes('statistics')) ||
                        (dataPage === 'faq' && currentPath.includes('faq')) ||
                        (dataPage === 'contact' && currentPath.includes('contact'))) {
                        link.classList.add('active');
                    }
                }
            } catch (e) {
                // Handle relative URLs or parsing errors
                console.warn('Could not parse URL:', link.href);
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTopbar);
    } else {
        initTopbar();
    }
})();
