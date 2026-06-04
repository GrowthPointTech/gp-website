(function () {
  var grid = document.getElementById('home-blog-grid');
  if (!grid) return;

  blogPosts.slice(0, 3).forEach(function (post) {
    var url = 'blog/posts/' + post.slug + '.html';
    var card = document.createElement('article');
    card.className = 'blog-card card';
    var img = post.image
      ? '<a class="blog-card__image-link" href="' + url + '"><img class="card__image" src="' + post.image + '" alt="' + post.title + '" loading="lazy"></a>'
      : '';
    card.innerHTML =
      img +
      '<div class="card__body blog-card__category">' +
        '<span class="card__tag">' + post.category + '</span>' +
      '</div>' +
      '<div class="blog-card__excerpt">' +
        '<h3 class="card__title"><a href="' + url + '">' + post.title + '</a></h3>' +
      '</div>' +
      '<div class="blog-card__bottom">' +
        '<a href="' + url + '" class="card__link">View More</a>' +
      '</div>';
    grid.appendChild(card);
  });
})();
