(function () {
  const grid = document.getElementById('blog-card-grid');
  const dropdown = document.getElementById('taxonomy-dropdown');

  function postUrl(slug) {
    return 'posts/' + slug + '.html';
  }

  function renderCard(post) {
    const card = document.createElement('article');
    card.className = 'blog-card';
    const url = postUrl(post.slug);
    const imgWrapClass = post.image ? 'blog-card__img-wrap' : 'blog-card__img-wrap blog-card__img-wrap--empty';
    card.innerHTML =
      '<div class="' + imgWrapClass + '">' +
        (post.image ? '<img class="blog-card__img" src="' + post.image + '" alt="' + post.title + '" loading="lazy">' : '') +
      '</div>' +
      '<div class="blog-card__body">' +
        '<div class="blog-card__tags">' +
          post.categories.map(function(c) {
            return '<span class="blog-card__tag" data-cat="' + c.toLowerCase().replace(/ /g, '-') + '">' + c + '</span>';
          }).join('') +
        '</div>' +
        '<h3 class="blog-card__title">' +
          '<a href="' + url + '">' + post.title + '</a>' +
        '</h3>' +
        (post.description ? '<p class="blog-card__desc">' + post.description + '</p>' : '') +
        '<a href="' + url + '" class="blog-card__link">View More</a>' +
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
