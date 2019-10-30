// Find out if the div exists
const FILTERS = document.querySelectorAll('.filter input[type=checkbox]');
const REVIEWS = document.querySelectorAll('.review__full');
const REVIEW_GRID = document.querySelector(".reviews-grid");
const LOADER = document.querySelector(".loading");

// add change handlers to the checkboxes
FILTERS.forEach(filter => {
  filter.addEventListener("change", updateSelectedFilters);
});

document.getElementById("term_all").addEventListener("change", (e) => {
  displayReviews(e.target.checked);
});

function getSelectedFilters() {
  let selectedFilters = [];

  // Get an array of the selected filters
  FILTERS.forEach(filter => {
    if (filter.checked) selectedFilters.push(filter.value);
  });

  return selectedFilters;
}

function updateSelectedFilters() {
  let selectedFilters = getSelectedFilters();
  showFilters(selectedFilters);
}

function displayReviews(display) {
  if (display) {
    REVIEWS.forEach(review => {
      review.classList.remove("hide");
    });
    // uncheck the other filters
    FILTERS.forEach(filter => {
      filter.checked = false;
    });
  } else {
    REVIEWS.forEach(review => {
      review.classList.add("hide");
    });
  }
}

function showFilters(filters) {
  if (filters.length > 0) {
    document.getElementById("term_all").checked = false;
  }

  REVIEWS.forEach(review => {
    review.classList.add("hide");
  });

  filters.map(filter => {
    document.querySelectorAll(`.${filter}`).forEach(review => {
      review.classList.remove("hide");
    })
  });
}

function getShows(page) {
  return new Promise((resolve, reject) => {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        resolve(JSON.parse(this.responseText));
      }
    };
    xmlhttp.open('GET', "/wp-json/bababrinkman/v1/reviews/" + page);
    xmlhttp.send();
  });
}

function getShowsByPage(page) {
  const request = async () => {                 // async function always returns a promise
    const reviews = await getShows(page);          // await can be only used inside async functions
    showReviews(reviews);
  }
  request().catch((error) => { alert(error) }); // catch rejected promise
}
let page = 1;

function isLoaderInView() {
  const rect = LOADER.getBoundingClientRect();

  const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
  const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

  return (vertInView && horInView);
}

const handleScroll = document.addEventListener("scroll", () => {
  checkLoadMore();
});

function checkLoadMore() {
  if (isLoaderInView()) {
    getShowsByPage(page);
    page++;
  }
}
checkLoadMore();

function showReviews(reviews) {
  reviews.map((review, index) => {
    elm = createReview(review, index);
    REVIEW_GRID.append(elm);
  });
}

function createReview(review, index) {
  let rating = parseInt(review.acf.star_rating);
  let type = rating > 0 ? "review" : "press";

  const div = document.createElement("div");
  div.classList.add("review");

  const a = document.createElement("a");
  a.classList.add('review__full');
  a.classList.add(`row-item-${index}`);
  a.classList.add(type);
  div.append(a);

  if (Math.floor(rating) !== rating) a.classList.add("half");
  a.href = review.link;

  // Add a class for each show slug for filtering.
  for (show in review.shows) {
    a.classList.add(review.shows[show].slug);
  }

  // THUMBNAIL
  if (review.image.length > 0) {
    var img_div = document.createElement("div");
    img_div.classList.add("review__thumbnail");

    var img = document.createElement("img");
    img.src = review.image;

    img_div.append(img);
    a.append(img_div);
  }

  // SOURCE
  var title = document.createElement("p");
  title.classList.add("review__link");
  title.innerHTML = review.post_title;

  var show_title = document.createElement("span");
  show_title.classList.add("review__show");
  for (show in review.shows) {
    show_title.innerHTML = review.shows[show].name;
  }
  title.append(show_title);
  a.append(title);

  // QUOTE
  var quote = document.createElement("span");
  quote.classList.add("review__quote");
  quote.innerHTML = "<p>" + review.post_content + "</p>";
  a.append(quote);

  // RATING
  var review_rating = document.createElement("span");
  review_rating.classList.add("review__rating");
  var rating_content = "";
  for ($x = 0; $x < Math.floor(rating); $x++) {
    rating_content += "★";
  }
  review_rating.innerHTML = rating_content;
  a.append(review_rating);

  // REVIEW DATE
  if (review.acf.review_date && review.acf.review_date.length > 0) {
    var review_date = document.createElement("span");
    review_date.classList.add("review__date");
    review_date.innerHTML = review.review_date;
    a.append(review_date);
  }

  // View More Button
  var review_more = document.createElement("span");
  review_more.classList.add("review__more");
  review_more.innerHTML = "view more ";
  var arrow = document.createElement("span");
  arrow.classList.add("arrow");
  review_more.append(arrow);
  a.append(review_more);

  return div;
}

function objToUrl(obj) {
  let url = "";
  for (var key in obj) {
    if (url != "") {
      url += "&";
    }
    url += key + "=" + encodeURIComponent(obj[key]);
  }
  return url;
}
