// search.js — поиск ТОЛЬКО по названиям формул
(function () {
    const input    = document.querySelector('.search-box input');
    const dropdown = document.getElementById('search-results');
    if (!input || !dropdown || !window.SEARCH_INDEX) return;

    const INDEX = window.SEARCH_INDEX;

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function highlight(text, q) {
        if (!q) return esc(text);
        const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('(' + safeQ + ')', 'ig');
        return esc(text).replace(re, '<mark>$1</mark>');
    }

    function norm(s) {
        return String(s).toLowerCase().replace(/ё/g, 'е');
    }

    // Поиск ТОЛЬКО по name (+ sectionTitle, чтобы можно было найти раздел)
    function search(query) {
        const q = norm(query.trim());
        if (!q) return [];

        return INDEX
            .map(item => {
                let score = 0;
                if (norm(item.name).includes(q))         score += 10;  // главное — название
                if (norm(item.sectionTitle).includes(q)) score += 3;   // бонус — раздел
                return { item, score };
            })
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(x => x.item);
    }

    function render(query) {
        const q = query.trim();
        const results = search(q);

        if (!q) {
            dropdown.innerHTML = '';
            dropdown.classList.remove('is-open');
            return;
        }

        if (results.length === 0) {
            dropdown.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
            dropdown.classList.add('is-open');
            return;
        }

        dropdown.innerHTML = results.map(item => `
            <a class="search-item" href="${esc(item.section)}.html#${esc(item.anchor)}">
                <div class="search-item-section">${esc(item.sectionTitle)}</div>
                <div class="search-item-name">${highlight(item.name, q)}</div>
            </a>
        `).join('');

        dropdown.classList.add('is-open');
    }

    input.addEventListener('input', () => render(input.value));

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box') && !e.target.closest('#search-results')) {
            dropdown.classList.remove('is-open');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdown.classList.remove('is-open');
            input.blur();
        }
    });
})();