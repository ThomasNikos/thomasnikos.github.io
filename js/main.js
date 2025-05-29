// Fallback configuration
const defaultConfig = {
    GITHUB_TOKEN: '',
    EMAILJS_PUBLIC_KEY: 'PoadtkqwQzTDZ3gKZ',
    EMAILJS_SERVICE_ID: 'service_ctewodj',
    EMAILJS_TEMPLATE_ID: 'template_cpg4yog'
};

// Use config if defined, otherwise use default config
const CONFIG = typeof config !== 'undefined' ? config : defaultConfig;

// Theme Toggle Functionality
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        html.classList.remove('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
}

// Contact Form Functionality
function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');

    if (form) {
        emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            try {
                await emailjs.sendForm(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, form);
                
                statusDiv.className = 'rounded-lg p-4 text-center bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
                statusDiv.textContent = 'Thank you for your message! I will get back to you soon.';
                form.reset();
            } catch (error) {
                statusDiv.className = 'rounded-lg p-4 text-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
                statusDiv.textContent = 'Oops! Something went wrong. Please try again later.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                statusDiv.classList.remove('hidden');
                
                setTimeout(() => {
                    statusDiv.classList.add('hidden');
                }, 5000);
            }
        });
    }
}

// GitHub API Integration
async function fetchRepoDetails(repoName, owner = 'ThomasNikos') {
    try {
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        
        if (CONFIG.GITHUB_TOKEN) {
            headers['Authorization'] = `Bearer ${CONFIG.GITHUB_TOKEN}`;
        }

        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
        if (!response.ok) {
            if (response.status === 403) {
                console.warn('Rate limit exceeded. Please check the token.');
            }
            throw new Error(`Failed to fetch repository: ${repoName} (Status: ${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching repo details:', error);
        return null;
    }
}

async function fetchPersonalRepos() {
    try {
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        
        if (CONFIG.GITHUB_TOKEN) {
            headers['Authorization'] = `Bearer ${CONFIG.GITHUB_TOKEN}`;
        }

        const response = await fetch('https://api.github.com/users/ThomasNikos/repos', { headers });
        if (!response.ok) {
            if (response.status === 403) {
                console.warn('Rate limit exceeded. Please check the token.');
            }
            throw new Error(`Failed to fetch repositories (Status: ${response.status})`);
        }
        const repos = await response.json();
        return repos.filter(repo => !repo.fork && repo.owner.type !== 'Organization');
    } catch (error) {
        console.error('Error fetching personal repos:', error);
        return [];
    }
}

async function fetchOrgRepos() {
    try {
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        
        if (CONFIG.GITHUB_TOKEN) {
            headers['Authorization'] = `Bearer ${CONFIG.GITHUB_TOKEN}`;
        }

        const response = await fetch('https://api.github.com/orgs/uniwa-software/repos', { headers });
        if (!response.ok) {
            if (response.status === 403) {
                console.warn('Rate limit exceeded. Please check the token.');
            }
            throw new Error(`Failed to fetch organization repositories (Status: ${response.status})`);
        }
        const repos = await response.json();
        return repos.filter(repo => !repo.fork);
    } catch (error) {
        console.error('Error fetching org repos:', error);
        return [];
    }
}

async function fetchRepoLanguages(repoName, owner = 'ThomasNikos') {
    try {
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        
        if (CONFIG.GITHUB_TOKEN) {
            headers['Authorization'] = `Bearer ${CONFIG.GITHUB_TOKEN}`;
        }

        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch languages for repository: ${repoName}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching repo languages:', error);
        return {};
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
        'Jupyter Notebook': '#DA5B0B',
        PHP: '#4F5D95',
        Ruby: '#701516',
        Go: '#00ADD8',
        Swift: '#ffac45',
        Kotlin: '#F18E33',
        Rust: '#dea584',
        Dart: '#00B4AB',
        Scala: '#c22d40',
        Haskell: '#5e5086',
        Lua: '#000080',
        R: '#198CE7',
        MATLAB: '#e16737',
        Assembly: '#6E4C13',
        Perl: '#0298c3',
        Elixir: '#6e4a7e',
        Clojure: '#db5855',
        OCaml: '#3be133'
    };
    return colorMap[language] || '#6c757d';
}

async function createRepoCard(repoDetails, index) {
    const li = document.createElement('li');
    li.className = 'bg-white dark:bg-dark-100 rounded-xl p-6 shadow-md hover:-translate-y-1 transition-all duration-300 repo-card';
    li.style.setProperty('--animation-order', index);
    
    // Fetch languages for this repository
    const languages = await fetchRepoLanguages(repoDetails.name, repoDetails.owner.login);
    
    // Create language badges for all languages
    const languageBadges = Object.keys(languages).map(language => 
        `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 mr-2" 
               style="background-color: ${getLanguageColor(language)}20; 
                      color: ${getLanguageColor(language)}">
            <span class="w-2 h-2 rounded-full mr-2" style="background-color: ${getLanguageColor(language)}"></span>
            ${language}
        </span>`
    ).join('');

    li.innerHTML = `
        <h2 class="text-xl font-semibold mb-3">
            <a href="${repoDetails.html_url}" target="_blank" class="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                ${repoDetails.name}
            </a>
        </h2>
        <p class="text-slate-600 dark:text-slate-400 mb-4 h-12 overflow-hidden">
            ${repoDetails.description || 'No description available'}
        </p>
        <div class="flex flex-wrap gap-2 mb-3">
            ${languageBadges}
        </div>
        <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-dark-200 text-slate-600 dark:text-slate-400">
                <i class="far fa-star mr-1"></i>
                ${repoDetails.stargazers_count}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-dark-200 text-slate-600 dark:text-slate-400">
                <i class="fas fa-code-branch mr-1"></i>
                ${repoDetails.forks_count}
            </span>
        </div>
    `;
    return li;
}

async function displayPersonalRepos() {
    const repos = await fetchPersonalRepos();
    const reposList = document.getElementById('repos-list');
    reposList.innerHTML = ''; // Clear existing content

    if (repos.length > 0) {
        // Use Promise.all to wait for all cards to be created
        const cards = await Promise.all(
            repos.map((repo, index) => createRepoCard(repo, index))
        );
        cards.forEach(card => reposList.appendChild(card));
    } else {
        reposList.innerHTML = `
            <div class="col-span-full text-center text-slate-500 dark:text-slate-400 py-8">
                No personal repositories found.
            </div>
        `;
    }
}

async function displayOrgRepos() {
    const repos = await fetchOrgRepos();
    const orgReposList = document.getElementById('org-repos-list');
    orgReposList.innerHTML = ''; // Clear existing content

    if (repos.length > 0) {
        // Use Promise.all to wait for all cards to be created
        const cards = await Promise.all(
            repos.map((repo, index) => createRepoCard(repo, index))
        );
        cards.forEach(card => orgReposList.appendChild(card));
    } else {
        orgReposList.innerHTML = `
            <div class="col-span-full text-center text-slate-500 dark:text-slate-400 py-8">
                No organization repositories found.
            </div>
        `;
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

// Update copyright year
function updateCopyrightYear() {
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initContactForm();
    initSmoothScroll();
    displayPersonalRepos();
    displayOrgRepos();
    updateCopyrightYear();
}); 