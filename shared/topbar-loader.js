// Load shared topbar HTML
(function() {
    'use strict';

    function loadTopbar() {
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
