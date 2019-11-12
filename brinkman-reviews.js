// References
const REVIEW_GRID = document.querySelector(".reviews-grid");
const FILTERS = document.querySelectorAll('.filter input[type=checkbox]');
const LOADER = document.querySelector(".loading");

// Variables
let review_array = [];
let fetching = false;
let all_reviews_loaded = false;
let page = 1;
let fetchedPages = [];

// Check to see if the page has reviews to display
if (REVIEW_GRID !== null) {
  initReviews();
}

function initReviews() {
  // add change handlers to the checkboxes
  FILTERS.forEach(filter => {
    filter.addEventListener("change", filterHandleChange);
  });

  // add change handler for the show all filter
  document.getElementById("term_all").addEventListener("change", (e) => {
    showAllReviews(e.target.checked);
  });

  // Check if we need to load more reviews
  checkLoadMore();
  document.addEventListener("scroll", checkLoadMore);
}

function filterHandleChange() {
  document.getElementById("term_all").checked = false;
  let filters = getFilters();
  filterReviews(filters);
}

function getFilters() {
  let filters = {
    checked: [],
    unchecked: []
  };

  // Get an array of the selected filters
  FILTERS.forEach(filter => {
    if (filter.checked) filters.checked.push(filter.value);
    if (!filter.checked) filters.unchecked.push(filter.value);
  });

  return filters;
}

// uncheck the existing filters
function showAllReviews(show) {
  FILTERS.forEach(filter => filter.checked = false);

  filters = getFilters();
  allFilters = filters.checked.concat(filters.unchecked);

  if (show) {
    console.log(show);
    filterReviews({
      checked: allFilters,
      unchecked: []
    });
  } else {
    console.log(show);
    filterReviews({
      checked: [],
      unchecked: allFilters
    });
  }
}

function filterReviews({ checked, unchecked }) {
  // Unchecked
  for (filter in unchecked) {
    const toHide = document.querySelectorAll("." + unchecked[filter]);
    toHide.forEach(review => review.classList.remove("show"));
    toHide.forEach(review => review.classList.add("hide"));
  }

  // Checked
  for (filter in checked) {
    const toShow = document.querySelectorAll("." + checked[filter]);
    toShow.forEach(review => review.classList.remove("hide"));
    toShow.forEach(review => review.classList.add("show"));
  }
}

/* FETCHING */
/********************************
 * Get the review data by page
 ********************************/
function getReviews(page) {
  return new Promise((resolve, reject) => {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let reviews = JSON.parse(this.responseText).map(review => {
          return {
            star_rating: review.acf.star_rating || "0",
            link: review.link,
            shows: review.shows,
            image: review.image,
            title: review.post_title,
            content: review.post_content,
            date: review.acf.review_date
          }
        });
        resolve(reviews);
      }
    };
    xmlhttp.open('GET', "/wp-json/bababrinkman/v1/reviews/" + page);
    xmlhttp.send();
  });
}

/********************************
 * Fetch and format reviews async
 ********************************/
function getNextReviews() {
  if (all_reviews_loaded || fetchedPages.includes(page)) return // Check if reviews have already been loaded
  fetching = true;

  const request = async () => {
    const reviews = await getReviews(page);

    fetchedPages.push(page);
    page++;

    // Display the new reviews
    showReviews(reviews);

    // Add reviews to review_array
    reviews.map(review => {
      review_array.push(review);
    });

    // Stop fetching if all reviews have loaded
    if (reviews.length === 0) {
      allReviewsLoaded();
    }

    fetching = false;
  }
  request().catch((error) => { alert(error) }); // catch rejected promise
}

function allReviewsLoaded() {
  document.removeEventListener("scroll", checkLoadMore);
  LOADER.style.display = "none";
  all_reviews_loaded = true;
}

/* DISPLAYING */
/********************************
 * Loop and display reviews
 ********************************/
function showReviews(reviews) {
  reviews.map((review, index) => {
    elm = createReview(review, index);
    REVIEW_GRID.append(elm);
  });
}

/********************************
 * Return a formatted review element
 ********************************/
function createReview(review, index) {
  let rating = parseInt(review.star_rating);
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
  a.target = "_blank";

  // SLUG
  for (show in review.shows) {
    div.classList.add(review.shows[show].slug);
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
  title.innerHTML = review.title;

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
  quote.innerHTML = "<p>" + review.content + "</p>";
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
  if (review.date && review.date.length > 0) {
    var review_date = document.createElement("span");
    review_date.classList.add("review__date");
    review_date.innerHTML = review.date;
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

  // Check Filters
  let filters = getFilters();
  if (filters.checked.length > 0) {
    for (show in review.shows) {
      console.log(review.shows[show].slug);
      if (filters.unchecked.includes(review.shows[show].slug)) {
        div.classList.add("hide");
      }
    }
  }

  return div;
}

/* LOADING */
/********************************
 * Find out if the loader is in view
 ********************************/
function isLoaderInView() {
  const rectTop = getOffsetTop(LOADER);
  const scrollBottom = window.innerHeight + (window.pageYOffset || document.documentElement.scrollTop);

  console.log(scrollBottom);

  return scrollBottom + window.innerHeight > rectTop;
}

/* Get top of element relative to document
recursive function since offsetTop is a reference to the
first relative parent */
function getOffsetTop(elem) {
  var offsetTop = 0;
  do {
    if (!isNaN(elem.offsetTop)) {
      offsetTop += elem.offsetTop;
    }
  } while (elem = elem.offsetParent);
  return offsetTop;
}

/********************************
 * Check if more reviews need to
 * be loaded
 ********************************/
function checkLoadMore() {
  if (isLoaderInView() && !fetching) {
    getNextReviews();
  }
}