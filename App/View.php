<?php
namespace NFTSTAKING;
defined( 'ABSPATH' ) || exit;

class View {

	protected $data = [];

	public function __get( $name ) {

		return $this->data[ $name ] ?? null;

	}

	public function __set( $name, $value ) {

		$this->data[ $name ] = $value;
	}

	public function __isset( $name ) {
		// TODO: Implement __isset() method.
		return isset( $this->data[ $name ] );
	}

	public function render( $template, $arr = [] ) {
		ob_start();
		$this->display($template , $arr = [] );
		$content = ob_get_contents();
		ob_end_clean();
		return $content;
	}

	public function display( String $template, $arr = [] ) {
		extract( $arr );
		include NFTSTAKING_TEMPLATE_DIR . $template;
	}

}
