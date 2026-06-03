(function () {
  const grid = document.getElementById('home-blog-grid');
  if (!grid) return;

  blogPosts.slice(0, 3).forEach(function (post) {
    const url = 'blog/posts/' + post.slug + '.html';
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML =
      '<div class="card__body">' +
        '<span class="card__tag">' + post.category + '</span>' +
        '<h3 class="card__title"><a href="' + url + '">' + post.title + '</a></h3>' +
        (post.description ? '<p class="card__text">' + post.description + '</p>' : '') +
        '<a href="' + url + '" class="card__link">View More</a>' +
      '</div>';
    grid.appendChild(card);
  });
})();
