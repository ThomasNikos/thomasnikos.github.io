// Theme Toggle Functionality
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference, otherwise use dark theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        html.classList.remove('dark');
    }

    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
}

// Contact Form Functionality
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };

            // Here you would typically send the data to your server
            // For now, we'll just log it and show a success message
            console.log('Form submitted:', data);
            
            // Clear form
            form.reset();
            
            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
        });
    }
}

// GitHub API Integration
async function fetchRepoDetails(repoName) {
    try {
        const response = await fetch(`https://api.github.com/repos/ThomasNikos/${repoName}`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error(`Failed to fetch repository: ${repoName}`);
    } catch (error) {
        console.error(error);
        return null;
    }
}

function getLanguageColor(language) {
    const colorMap = {
        JavaScript: '#f7df1e',
        HTML: '#e34c26',
        CSS: '#563d7c',
        'C++': '#f34b7d',
        Java: '#b07219',
        Roff: '#ecdebe',
        VHDL: '#adb2cb',
        Shell: '#89e051',
        C: '#555555',
        Python: '#3572A5',
        TypeScript: '#2b7489',
    };
    return colorMap[language] || '#6c757d';
}

async function displayRepoDetails(repoName, index) {
    const repoDetails = await fetchRepoDetails(repoName);
    const reposList = document.getElementById('repos-list');

    if (repoDetails) {
        try {
            const languagesResponse = await fetch(repoDetails.languages_url);
            const languagesData = await languagesResponse.json();
            const languages = Object.keys(languagesData);

            const li = document.createElement('li');
            li.className = 'bg-white dark:bg-dark-100 rounded-xl p-6 shadow-md hover:-translate-y-1 transition-all duration-300 repo-card';
            li.style.setProperty('--animation-order', index);
            
            li.innerHTML = `
                <h2 class="text-xl font-semibold mb-3">
                    <a href="${repoDetails.html_url}" target="_blank" class="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                        ${repoDetails.name}
                    </a>
                </h2>
                <p class="text-slate-600 dark:text-slate-400 mb-4">${repoDetails.description || 'No description available'}</p>
                <div class="flex flex-wrap -m-1">
                    ${languages.map(language => `
                        <span class="language-tag" style="background-color: ${getLanguageColor(language)}">
                            <i class="fas fa-code mr-2"></i>${language}
                        </span>
                    `).join('')}
                </div>
            `;
            reposList.appendChild(li);
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
    }
}

async function displayAllRepoDetails() {
    const repos = ['uniwa', 'thomasnikos.github.io', 'ai', 'discord.js'];
    for (let i = 0; i < repos.length; i++) {
        await displayRepoDetails(repos[i], i);
    }
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initContactForm();
    initSmoothScroll();
    displayAllRepoDetails();
}); 