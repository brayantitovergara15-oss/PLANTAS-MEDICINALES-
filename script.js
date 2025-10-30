
document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------
  // -------------------------------------------------
  const searchInput      = document.getElementById('search-input');
  const themeToggle      = document.getElementById('theme-toggle');
  const showFavoritesBtn = document.getElementById('show-favorites');
  const favCountSpan     = document.getElementById('fav-count');
  const navList          = document.getElementById('nav-list');
  const backToTopBtn     = document.getElementById('back-to-top');
  const plantSections    = document.querySelectorAll('.plant-section');
  const favoriteBtns     = document.querySelectorAll('.favorite-btn');
  const copyBtns         = document.querySelectorAll('.copy-btn');

  // -------------------------------------------------
  // -------------------------------------------------
  const plants = Array.from(plantSections).map(sec => {
    const id = sec.id;
    const title = sec.querySelector('h2').textContent.trim();
    const description = sec.querySelectorAll('p')[1]?.textContent.trim() ?? '';
    const diseases = Array.from(sec.querySelectorAll('ul')[0]?.querySelectorAll('li') ?? [])
                     .map(li => li.textContent.trim());
    const ingredients = Array.from(sec.querySelectorAll('ul')[1]?.querySelectorAll('li') ?? [])
                       .map(li => li.textContent.trim());
    const recipeSteps = Array.from(sec.querySelectorAll('ol li') ?? [])
                       .map(li => li.textContent.trim());

    return { id, title, description, diseases, ingredients, recipeSteps };
  });

  // -------------------------------------------------
  // -------------------------------------------------
  let favorites = JSON.parse(localStorage.getItem('plantFavorites')) || [];

  const updateFavCount = () => {
    favCountSpan.textContent = favorites.length;
  };
  updateFavCount();

  const toggleFavorite = (plantId, btn) => {
    const heart = btn.querySelector('i');
    if (favorites.includes(plantId)) {
      favorites = favorites.filter(id => id !== plantId);
      heart.classList.replace('fas', 'far');
    } else {
      favorites.push(plantId);
      heart.classList.replace('far', 'fas');
    }
    localStorage.setItem('plantFavorites', JSON.stringify(favorites));
    updateFavCount();
  };

  favoriteBtns.forEach(btn => {
    const id = btn.dataset.id;
    if (favorites.includes(id)) {
      btn.querySelector('i').classList.replace('far', 'fas');
    }
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(id, btn);
    });
  });

  // -------------------------------------------------
  // -------------------------------------------------
  const applyTheme = () => {
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
  };

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme();
  });

 
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  applyTheme();

  // -------------------------------------------------
  // -------------------------------------------------
  const performSearch = () => {
    const query = searchInput.value.toLowerCase().trim();
    plantSections.forEach(sec => {
      const plant = plants.find(p => p.id === sec.id);
      const text = `${plant.title} ${plant.description} ${plant.diseases.join(' ')} ${plant.ingredients.join(' ')}`.toLowerCase();
      sec.style.display = query === '' || text.includes(query) ? '' : 'none';
    });
  };
  searchInput.addEventListener('input', performSearch);

  // -------------------------------------------------
  // -------------------------------------------------
  let showingFavorites = false;
  showFavoritesBtn.addEventListener('click', () => {
    showingFavorites = !showingFavorites;
    plantSections.forEach(sec => {
      const isFav = favorites.includes(sec.id);
      sec.style.display = showingFavorites ? (isFav ? '' : 'none') : '';
    });
    showFavoritesBtn.textContent = showingFavorites
      ? `Volver (${favorites.length})`
      : `Ver Favoritos (${favorites.length})`;
    showFavoritesBtn.style.background = showingFavorites ? '#333' : '#e91e63';
  });

  // -------------------------------------------------
  // -------------------------------------------------
  const viewCounts = JSON.parse(localStorage.getItem('plantViews')) || {};
  const saveViews = () => localStorage.setItem('plantViews', JSON.stringify(viewCounts));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        viewCounts[id] = (viewCounts[id] || 0) + 1;
        entry.target.querySelector('.view-count').textContent = `${viewCounts[id]} vista${viewCounts[id] > 1 ? 's' : ''}`;
        saveViews();
        observer.unobserve(entry.target); 
      }
    });
  }, { threshold: 0.6 });

  plantSections.forEach(sec => {
    const id = sec.id;
    const count = viewCounts[id] || 0;
    sec.querySelector('.view-count').textContent = `${count} vista${count > 1 ? 's' : ''}`;
    observer.observe(sec);
  });

  // ------------------------------------------------
  // -------------------------------------------------
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const plantId = btn.dataset.recipe;
      const plant = plants.find(p => p.id === plantId);
      if (!plant) return;

      const recipeText = `
${plant.title.toUpperCase()}

Ingredientes:
${plant.ingredients.map(i => `• ${i}`).join('\n')}

Instrucciones:
${plant.recipeSteps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}
      `.trim();

      navigator.clipboard.writeText(recipeText).then(() => {
        const original = btn.textContent;
        btn.textContent = '¡Copiado!';
        btn.style.background = '#4caf50';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
        }, 1500);
      }).catch(() => {
        alert('No se pudo copiar la receta.');
      });
    });
  });

  // ------------------------------------------------
  // -------------------------------------------------
  plants.forEach(p => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${p.id}`;
    a.textContent = p.title;
    li.appendChild(a);
    navList.appendChild(li);
  });


  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // -------------------------------------------------
  // -------------------------------------------------
  window.addEventListener('scroll', () => {
    backToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // -------------------------------------------------
  // -------------------------------------------------
  if (favorites.length > 0) {
    plantSections.forEach(sec => {
      if (!favorites.includes(sec.id)) sec.style.display = '';
    });
  }
});