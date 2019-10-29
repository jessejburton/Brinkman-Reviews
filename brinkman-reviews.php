<?php

/**
 * @package BrinkmanReviews
 *
**/
/*
Plugin Name: Baba Brinkman Reviews
Plugin URI: https://www.burtonmediainc.com/plugins/brinkmanreviews
Description: A plugin created to add a shortcode for displaying reviews on the website
             bababrinkman.com. It currently requries Custom Post Type and Advanced
             Custom Fields plugin with some configuration as outlined on the website.
Version: 1.0.0
Author: Jesse James Burton
Author URI: https://www.burtonmediainc.com
License: GPLv2 or Later
Text Domain: brinkman-reviews
GIT: https://github.com/jessejburton/Brinkman-Reviews
*/

/* Include Styles */
function add_review_plugin_styles() {
  wp_enqueue_style( 'brinkman-reviews-styles', plugins_url('brinkman-reviews.css',__FILE__ ), array(), '1.1', 'all');
}
add_action( 'wp_enqueue_scripts', 'add_review_plugin_styles' );

/* Include Scripts */
function add_review_plugin_script() {
  wp_enqueue_script( 'brinkman-reviews-scripts', plugins_url('brinkman-reviews.js',__FILE__ ), array(), '1.1', 'all', false);
}
add_action( 'wp_enqueue_scripts', 'add_review_plugin_script' );

/**
 * Register review shortcode
 *
 * @return null
 */
function burtonmedia_shortcodes() {
  add_shortcode( 'reviews', 'shortcode_review' );
}
add_action( 'init', 'burtonmedia_shortcodes' );

/**
* Review Shortcode Callback
* @param Array $atts
* @return string
*/
function shortcode_review( $atts ) {
  global $wp_query,
         $post;

  $atts = shortcode_atts( array(
      'show' => '',
      'display' => 'simple',
      'max_posts' => 30
  ), $atts );

  if($atts['show'] === ''){
    // get all terms in the taxonomy
    $terms = get_terms( 'shows' );
    // convert array of term objects to array of term IDs
    $term_slugs = wp_list_pluck( $terms, 'slug' );
  } else {
    $term_slugs = array( sanitize_title( $atts['show'] ) );
  }

  $loop = new WP_Query( array(
      'posts_per_page'    => sanitize_title( $atts['max_posts'] ),
      'post_type'         => 'reviews',
      'orderby'           => 'menu_order title',
      'order'             => 'ASC',
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
    while( $loop->have_posts() ) {
        $loop->the_post();

      // Use the passed in template
      require('templates/' . $atts['display'] . '.php');

    }
  return ob_get_clean();

  wp_reset_postdata();

}

/**
* add Review Archive template page
* @param Array $atts
* @return string
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

/* STARTING TO ADD FUNCTIONALITY FOR AJAX FILTERING */
//Get Genre Filters
function get_genre_filters()
{
    $terms = get_terms('shows');
    $filters_html = false;

    if( $terms ):
        $filters_html = '<ul id="show_filters">';

        foreach( $terms as $term )
        {
            $term_id = $term->term_id;
            $term_name = $term->name;

            $filters_html .= '<li class="term_id_'.$term_id.'"><input type="checkbox" name="show_filter[]" id="term_'.$term_id.'" value="'.$term_id.'"><label for="term_'.$term_id.'">'.$term_name.'</label></li>';
        }
        $filters_html .= '<li class="show-all"><input type="checkbox" id="term_all"><label for="term_all">Show All</label></li>';
        $filters_html .= '</ul>';

        return $filters_html;
    endif;
}


?>

