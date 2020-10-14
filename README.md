# Brinkman Reviews Shortcode

~Current Version: 2.0~

## Description
A plugin that adds shortcodes to display the custom post type "Reviews".

Reviews can be categorized by "Show"

## Usage
You can display the reviews using the following shortcode:

`[reviews /]`

This will by default display all of the reviews in a simple format (as seen in the dropdowns) from the most recent review date

## Options
You can set options using attributes on the short code. The available attributes are:

* show
* display
* max_posts
* wrapper_class
* exceptions
* sort

---
### show
Filter the results by a specific show, so for example to display only the reviews that are associated with "Rap Up" you will add the slug (usually the name, all lowercase with -'s instead of spaces) for that show:

`[reviews show="rap-up" /]`

*Default ~* display's all reviews

---
### display
Determine's how the review will be displayed. Options are:

* simple
* full



### Custom Post Type
The custom post type has been added using the Custom Post Type UI plugin, additional fields have been added via the Advanced Custom Fields Plugin