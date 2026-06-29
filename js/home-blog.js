(function () {
  var grid = document.getElementById('home-blog-grid');
  if (!grid) return;

  blogPosts.forEach(function (post) {
    var url      = 'blog/posts/' + post.slug + '.html';
    var category = (post.categories && post.categories[0]) || 'INSIGHTS';
    var desc     = post.description || '';

    var card = document.createElement('article');
    card.className = 'blog-card';

    var imgHtml = post.image
      ? '<a class="blog-card__img-wrap" href="' + url + '" tabindex="-1">' +
          '<img class="blog-card__img" src="' + post.image + '" alt="' + post.title + '" loading="lazy">' +
        '</a>'
      : '<div class="blog-card__img-wrap blog-card__img-wrap--empty"></div>';

    card.innerHTML =
      imgHtml +
      '<div class="blog-card__body">' +
        '<h3 class="blog-card__title"><a href="' + url + '">' + post.title + '</a></h3>' +
        (desc ? '<p class="blog-card__desc">' + desc + '</p>' : '') +
        '<a href="' + url + '" class="blog-card__link">Read More &#8250;</a>' +
      '</div>';

    grid.appendChild(card);
  });
})();
