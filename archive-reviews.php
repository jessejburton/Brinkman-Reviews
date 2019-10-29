<?php

$loop = new WP_Query( array(
  'posts_per_page'    => 30,
  'post_type'         => 'reviews',
  'orderby'           => 'menu_order title',
  'order'             => 'ASC',
  'tax_query'         => array( array(
      'taxonomy'  => 'shows',
      'field'     => 'slug',
      'terms'     => array( sanitize_title( $atts['show'] ) )
  ) )
) );

get_header();
nectar_page_header($post->ID);

//full page
$fp_options = nectar_get_full_page_options();
extract($fp_options);

?>

<div class="container-wrap dark">

	<div class="<?php if($page_full_screen_rows != 'on') echo 'container'; ?> main-content">

		<div class="row">

       <h2>PRESS</h2>

       <div id="show-filters-container">
          <?php echo get_genre_filters(); ?>
       </div>

      <div class="reviews-grid">

        <?php echo do_shortcode('[reviews display="full"]'); ?>

      </div><!--/reviews-grid-->

		</div><!--/row-->

	</div><!--/container-->

</div><!--/container-wrap-->

<?php get_footer(); ?>