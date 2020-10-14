<?php

/*
* Plugin Name: Baba Brinkman Videos
* Plugin URI: https://www.burtonmediainc.com/plugins/brinkmanvideos (TODO)
* Description: A plugin created to add a shortcode for displaying reviews
* on the website bababrinkman.com. It currently requries Custom Post Type
* and Advanced Custom Fields plugin with some configuration as outlined
* on the website.
*
* Version: 2.0.0
* Author: Jesse James Burton
* Author URI: https://www.burtonmediainc.com
* License: GPLv2 or Later
* Text Domain: brinkman-videos
* GIT: https://github.com/jessejburton/Brinkman-Reviews
*/

/*
 * Include Styles
*/
function add_review_plugin_styles() {
  wp_enqueue_style( 'brinkman-reviews-styles', plugins_url('brinkman-reviews.css',__FILE__ ), array(), '1.1', 'all');
}
add_action( 'wp_enqueue_scripts', 'add_review_plugin_styles' );

/*
 * Include Scripts
*/
function add_review_plugin_script() {
  wp_enqueue_script( 'brinkman-reviews-scripts', plugins_url('brinkman-reviews.js',__FILE__ ), array(), '1.1', 'all', false);
}
add_action( 'wp_enqueue_scripts', 'add_review_plugin_script' );

function get_reviews( $data ) {

	// setup query argument
	$args = array(
    "posts_per_page"   => 20,
    "paged"            => $data['page'],
    'post_type'        => 'reviews',
    'meta_key'			   => 'review_date',
    'orderby'			     => 'meta_value'
  );

	// get posts
	$posts = get_posts($args);

	// add custom field data to posts array
	foreach ($posts as $key => $post) {
      $posts[$key]->acf = get_fields($post->ID);
      $posts[$key]->review_date = date('F Y', strtotime(get_field('review_date', $post->ID, false, false)));
			$posts[$key]->link = get_field('article_link', $post->ID, false, false);
			$posts[$key]->image = get_the_post_thumbnail_url($post->ID);
      $posts[$key]->shows = get_the_terms($post, 'shows');
	}
	return $posts;
}

/*
 * Register the Endpoint
*/
add_action( 'rest_api_init', function(){
	register_rest_route( 'bababrinkman/v1', '/reviews/(?P<page>\d+)', array(
		'methods' => 'GET',
    'callback' => 'get_reviews'
	));
});

/*
 * Register review shortcode
*/
function burtonmedia_shortcodes() {
  add_shortcode( 'reviews', 'shortcode_review' );
}
add_action( 'init', 'burtonmedia_shortcodes' );

/*
* Review Shortcode Callback
*/
function shortcode_review( $atts ) {
  global $wp_query,
         $post;

  $atts = shortcode_atts( array(
      'show' => '',
      'display' => 'simple',
      'max_posts' => 30,
      'wrapper_class' => 'review',
      'exceptions' => '',
      'sort' => 'review',
      'order' => 'ASC'
  ), $atts );

  if($atts['show'] === ''){
    // get all terms in the taxonomy
    $terms = get_terms( 'shows' );
    // convert array of term objects to array of term IDs
    $term_slugs = wp_list_pluck( $terms, 'slug' );

    // Remove any exceptions that are passed in
    foreach(explode(",", $atts['exceptions']) as $exception){
      if (($key = array_search($exception, $term_slugs)) !== false) {
          unset($term_slugs[$key]);
      }
    }

  } else {
    $term_slugs = array( sanitize_title( $atts['show'] ) );
  }

  $loop = new WP_Query( array(
      'posts_per_page'    => sanitize_title( $atts['max_posts'] ),
      'post_type'         => 'reviews',
      'meta_key'			    => 'review_date',
      'orderby'           => $atts['sort'] === 'review' ? 'meta_value' : 'date',
      'order'             => $atts['order'],
      'tax_query'         => array( array(
          'taxonomy'  => 'shows',
          'field'     => 'slug',
          'terms'     => $term_slugs
      ) )
  ) );

  if( ! $loop->have_posts() ) {
    ob_start();
      echo 'No reviews found';
    return ob_get_clean();
  }

  ob_start();
    if($atts['display'] === 'full') {
      ?><div class="review-container"><?php
    }

      while( $loop->have_posts() ) {
          $loop->the_post();

      if($atts['wrapper_class'] !== '') { ?><div class="<?php echo $atts['wrapper_class'] ?>"><?php }
        require('templates/' . $atts['display'] . '.php');       // Use the passed in template
      if($atts['wrapper_class'] !== '') { ?></div><?php }

      }
    if($atts['display'] === 'full'){
      ?></div><?php
    }
  return ob_get_clean();

  wp_reset_postdata();

}

/*
* add Review Archive template page
*/
function reviews_template( $template ) {
  if ( is_post_type_archive('reviews') ) {
    $theme_files = array('archive-reviews.php', 'brinkman-reviews/archive-reviews.php');
    $exists_in_theme = locate_template($theme_files, false);
    if ( $exists_in_theme != '' ) {
      return $exists_in_theme;
    } else {
      return plugin_dir_path(__FILE__) . 'archive-reviews.php';
    }
  }
  return $template;
}
add_filter('template_include', 'reviews_template');

/*
* STARTING TO ADD FUNCTIONALITY FOR AJAX FILTERING
*/
function get_show_filters($exceptions = [])
{
    $terms = get_terms('shows');
    $filters_html = false;

    if( $terms ):
        $filters_html = '<ul id="show_filters">';

        $filters_html .= '<li class="show-all"><input type="checkbox" id="term_all" checked><label for="term_all">All</label></li>';

        foreach( $terms as $term )
        {
          $term_id = $term->term_id;
          $term_name = $term->name;
          $term_slug = $term->slug;

          if(!in_array($term_name, $exceptions)){
            $filters_html .= '<li class="filter term_id_'.$term_id.'"><input type="checkbox" name="show_filter[]" id="term_'.$term_id.'" value="'.$term_slug.'"><label for="term_'.$term_id.'">'.$term_name.'</label></li>';
          }
        }

        $filters_html .= '</ul>';

        return $filters_html;
    endif;
}

/*
* UTILITIES
*/
function lowDash($value){
  return strtolower(preg_replace('/[[:space:]]+/', '-', $value));
}

?>