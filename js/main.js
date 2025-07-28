// Cache utilities
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

function getFromCache(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
    }
    return data;
}

function setInCache(key, data) {
    const cacheData = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
}

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
                
                statusDiv.className = 'p-4 text-center text-green-700 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-300';
                statusDiv.textContent = 'Thank you for your message! I will get back to you soon.';
                form.reset();
            } catch (error) {
                statusDiv.className = 'p-4 text-center text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300';
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

// Fallback configuration
const defaultConfig = {
    GITHUB_TOKEN: '',
    EMAILJS_PUBLIC_KEY: '',
    EMAILJS_SERVICE_ID: '',
    EMAILJS_TEMPLATE_ID: ''
};

// Use config if defined, otherwise use default config
const CONFIG = typeof config !== 'undefined' ? config : defaultConfig;

// GitHub API Integration
async function fetchRepoDetails(repoName, owner = 'ThomasNikos') {
    const cacheKey = `repo_${owner}_${repoName}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

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
        const data = await response.json();
        setInCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching repo details:', error);
        return null;
    }
}

async function fetchPersonalRepos() {
    const cacheKey = 'personal_repos';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

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
        const filtered = repos.filter(repo => !repo.fork && repo.owner.type !== 'Organization');
        setInCache(cacheKey, filtered);
        return filtered;
    } catch (error) {
        console.error('Error fetching personal repos:', error);
        return [];
    }
}

async function fetchOrgRepos() {
    const cacheKey = 'org_repos';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

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
        const filtered = repos.filter(repo => !repo.fork);
        setInCache(cacheKey, filtered);
        return filtered;
    } catch (error) {
        console.error('Error fetching org repos:', error);
        return [];
    }
}

async function fetchRepoLanguages(repoName, owner = 'ThomasNikos') {
    const cacheKey = `languages_${owner}_${repoName}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

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
        const data = await response.json();
        setInCache(cacheKey, data);
        return data;
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
    li.className = 'p-6 bg-white rounded-xl shadow-md transition-all duration-300 dark:bg-dark-100 hover:-translate-y-1 repo-card';
    li.style.setProperty('--animation-order', index);
    
    // Fetch languages for this repository
    const languages = await fetchRepoLanguages(repoDetails.name, repoDetails.owner.login);
    
    // Create language badges for all languages
    const languageBadges = Object.keys(languages).map(language => 
        `<span class="inline-flex items-center px-3 py-1 mr-2 mb-2 text-sm font-medium rounded-full" 
               style="background-color: ${getLanguageColor(language)}20; 
                      color: ${getLanguageColor(language)}">
            <span class="mr-2 w-2 h-2 rounded-full" style="background-color: ${getLanguageColor(language)}"></span>
            ${language}
        </span>`
    ).join('');

    li.innerHTML = `
        <h2 class="mb-3 text-xl font-semibold">
            <a href="${repoDetails.html_url}" target="_blank" class="text-blue-600 transition-colors dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400">
                ${repoDetails.name}
            </a>
        </h2>
        <p class="overflow-hidden mb-4 h-12 text-slate-600 dark:text-slate-400">
            ${repoDetails.description || 'No description available'}
        </p>
        <div class="flex flex-wrap gap-2 mb-3">
            ${languageBadges}
        </div>
        <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-slate-100 dark:bg-dark-200 text-slate-600 dark:text-slate-400">
                <i class="mr-1 far fa-star"></i>
                ${repoDetails.stargazers_count}
            </span>
            <span class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-slate-100 dark:bg-dark-200 text-slate-600 dark:text-slate-400">
                <i class="mr-1 fas fa-code-branch"></i>
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
        const cards = await Promise.all(
            repos.map((repo, index) => createRepoCard(repo, index))
        );
        cards.forEach(card => reposList.appendChild(card));
    } else {
        reposList.innerHTML = `
            <div class="col-span-full py-8 text-center text-slate-500 dark:text-slate-400">
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
        const cards = await Promise.all(
            repos.map((repo, index) => createRepoCard(repo, index))
        );
        cards.forEach(card => orgReposList.appendChild(card));
    } else {
        orgReposList.innerHTML = `
            <div class="col-span-full py-8 text-center text-slate-500 dark:text-slate-400">
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