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
            li.className = 'bg-white rounded-xl p-6 shadow-md hover:-translate-y-1 transition-transform duration-300 repo-card';
            li.style.setProperty('--animation-order', index);
            
            li.innerHTML = `
                <h2 class="text-xl font-semibold mb-3">
                    <a href="${repoDetails.html_url}" target="_blank" class="text-blue-600 hover:text-blue-700 transition-colors">
                        ${repoDetails.name}
                    </a>
                </h2>
                <p class="text-slate-600 mb-4">${repoDetails.description || 'No description available'}</p>
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

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', displayAllRepoDetails); 