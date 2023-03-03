<?php
namespace NFTSTAKING\Controllers;

use NFTSTAKING\Controller;


class HomePageController extends Controller {


	/**
	 *
	 */
	public function handle() {
		add_action( 'template_include', array( $this, 'template' ) );


	}

	public function template($template) {
    if (is_front_page()) {
      $nftstaking_at_homepage = get_option( 'nftstaking_is_home', 'false');

      if ($nftstaking_at_homepage !== 'false') {
        return NFTSTAKING_PATH . 'templates' . DIRECTORY_SEPARATOR . 'nftstaking.php';
      } else {
        global $wp;
        if (strtolower($wp->request) == strtolower(get_option('nftstaking_slug'))) {
           return NFTSTAKING_PATH . 'templates' . DIRECTORY_SEPARATOR . 'nftstaking.php';
        }
      }
    }
    return $template;
	}





}
