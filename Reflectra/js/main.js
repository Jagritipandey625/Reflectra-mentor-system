// Add to main.js
function setupAllButtons() {
    // Make all "Learn More" buttons work
    document.querySelectorAll('a.btn').forEach(btn => {
        if (!btn.hasAttribute('href') || btn.getAttribute('href') === '#') {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const btnText = this.textContent.trim();
                
                // Route based on button text
                if (btnText.includes('Learn more') || btnText.includes('Learn More')) {
                    window.location.href = 'features.html';
                } else if (btnText.includes('Get Started') || btnText.includes('Start Free Trial')) {
                    window.location.href = 'signin.html';
                } else if (btnText.includes('Try Demo') || btnText.includes('Start Reflection')) {
                    window.location.href = 'demo.html';
                } else if (btnText.includes('Sign In')) {
                    window.location.href = 'signin.html';
                } else {
                    window.location.href = 'demo.html';
                }
            });
        }
    });
    
    // Make all navigation work
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
                e.preventDefault();
                const page = this.textContent;
                const pageMap = {
                    'Home': 'index.html',
                    'Features': 'features.html',
                    'Demo': 'demo.html',
                    'Feedback': 'feedback.html',
                    'Blog': 'blog.html'
                };
                
                if (pageMap[page]) {
                    window.location.href = pageMap[page];
                }
            }
        });
    });
}

// Call on DOM ready
document.addEventListener('DOMContentLoaded', setupAllButtons);