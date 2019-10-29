<?php

  $rating = get_field('star_rating', false, false);

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

?>

<div class="review__simple <?php echo $add_class; ?>">
  <span class="review__quote"><?php echo the_content(); ?></span>

  <span class="review__rating">
    <?php
      for ($x = 0; $x < floor($rating); $x++) {
        echo "★";
      }
    ?>
  </span>

  <span class="review__link">
    — <a href="<?php echo the_field('article_link'); ?>" target="_blank"><?php echo the_title(); ?></a>
  </span>

</div>
