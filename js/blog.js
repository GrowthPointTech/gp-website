(function () {
  const grid = document.getElementById('blog-card-grid');
  const dropdown = document.getElementById('taxonomy-dropdown');

  function postUrl(slug) {
    return 'posts/' + slug + '.html';
  }

  function renderCard(post) {
    const card = document.createElement('article');
    card.className = 'card blog-card';
    const url = postUrl(post.slug);
    card.innerHTML =
      '<a href="' + url + '" class="blog-card__image-link" tabindex="-1" aria-hidden="true">' +
        '<img class="card__image" src="' + post.image + '" alt="' + post.title + '" loading="lazy">' +
      '</a>' +
      '<div class="card__body">' +
        '<div class="blog-card__category">' +
          post.categories.map(function(c) { return '<span class="card__tag" data-cat="' + c.toLowerCase().replace(/ /g,'-') + '">' + c + '</span>'; }).join('') +
        '</div>' +
        '<h3 class="card__title">' +
          '<a href="' + url + '">' + post.title + '</a>' +
        '</h3>' +
        (post.description ? '<p class="blog-card__excerpt">' + post.description + '</p>' : '') +
      '</div>' +
      '<div class="blog-card__bottom">' +
        '<a href="' + url + '" class="card__link">View More</a>' +
      '</div>';
    return card;
  }

  function render(filter) {
    grid.innerHTML = '';
    blogPosts
      .filter(function (p) { return filter === 'all' || p.categories.indexOf(filter) !== -1; })
      .forEach(function (p) { grid.appendChild(renderCard(p)); });
  }

  if (dropdown) {
    dropdown.addEventListener('change', function () { render(dropdown.value); });
  }

  render('all');
})();
