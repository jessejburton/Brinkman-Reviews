<?php

  $rating = get_field('star_rating', false, false);
  $review_date = get_field('review_date', false, false);

  // Set the class to be a review or press (add " for reviews)
  if($rating > 0){
    $add_class = 'review ';
  } else {
    $add_class = 'press';
  }

  /* Find out if there is a half star */
  if(floor($rating) != $rating){
    $add_class = $add_class . ' half';
  }

  $shows = array();
  foreach(get_the_terms($post, 'shows') as $show){
    if($show->name !== 'FEATURED'){
      array_push($shows, strtolower($show->name));
    }
  }

?>

<a
  class="review__full
  <?php echo $add_class; ?>
  <?php
    foreach(get_the_terms($post, 'shows') as $show){
      echo strtolower(preg_replace('/[[:space:]]+/', '-', $show->name)) . ' ';
    }
  ?>
  "
  href="<?php echo the_field('article_link'); ?>"
>

  <?php if(has_post_thumbnail()){ ?>
    <div class="review__thumbnail"><?php the_post_thumbnail( 'medium' ); ?></div>
  <?php } ?>

  <p class="review__link">
    <?php echo the_title(); ?><span class="review__show"><?php echo implode($shows); ?></span>
  </p>

  <span class="review__quote"><?php echo the_content(); ?></span>
  <span class="review__rating">
    <?php
      for ($x = 0; $x < floor($rating); $x++) {
        echo "★";
      }
    ?>
  </span>

  <?php if(trim($review_date) !== ""){ ?>
    <span class="review__date">
      <?php echo date('F Y', strtotime($review_date)); ?>
    </span>
  <?php } ?>

  <span class="review__more">
    view more <span class="arrow"></span>
  </span>

</a>