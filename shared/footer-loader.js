// Load shared footer HTML
(function() {
    'use strict';

    function loadFooter() {
        const sharedPath = '/shared/';

        // Fetch and insert the footer HTML
        fetch(sharedPath + 'footer.html')
            .then(response => response.text())
            .then(html => {
                // Parse HTML to separate scripts from other content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                
                // Extract scripts
                const scripts = tempDiv.querySelectorAll('script');
                const scriptContents = [];
                scripts.forEach(script => {
                    scriptContents.push({
                        content: script.textContent,
                        src: script.src,
                        defer: script.defer
                    });
                    script.remove(); // Remove from tempDiv
                });
                
                // Insert the non-script HTML
                const footerPlaceholder = document.getElementById('footer-placeholder');
                if (footerPlaceholder) {
                    footerPlaceholder.outerHTML = tempDiv.innerHTML;
                } else {
                    // Insert before the last script tag or at the end of body
                    const existingScripts = document.getElementsByTagName('script');
                    if (existingScripts.length > 0) {
                        existingScripts[0].insertAdjacentHTML('beforebegin', tempDiv.innerHTML);
                    } else {
                        document.body.insertAdjacentHTML('beforeend', tempDiv.innerHTML);
                    }
                }
                
                // Now execute scripts
                scriptContents.forEach(scriptInfo => {
                    const newScript = document.createElement('script');
                    if (scriptInfo.src) {
                        newScript.src = scriptInfo.src;
                    }
                    if (scriptInfo.defer) {
                        newScript.defer = true;
                    }
                    if (scriptInfo.content) {
                        newScript.textContent = scriptInfo.content;
                    }
                    document.body.appendChild(newScript);
                });
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
