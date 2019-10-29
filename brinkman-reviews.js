// Find out if the div exists
const FILTERS = document.querySelectorAll('.filter input[type=checkbox]');
const REVIEWS = document.querySelectorAll('.review__full');

// add change handlers to the checkboxes
FILTERS.forEach(filter => {
  filter.addEventListener("change", updateSelectedFilters);
});

document.getElementById("term_all").addEventListener("change", (e) => {
  displayReviews(e.target.checked);
});

function updateSelectedFilters() {
  let selectedFilters = [];

  // Get an array of the selected filters
  FILTERS.forEach(filter => {
    if (filter.checked) selectedFilters.push(filter.value);
  });

  // Pass it to the showFilters function
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
  })

  filters.map(filter => {
    document.querySelectorAll(`.${filter}`).forEach(review => {
      review.classList.remove("hide");
    })
  })
}