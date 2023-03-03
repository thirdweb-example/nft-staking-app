<?php
namespace NFTSTAKING;

defined( 'ABSPATH' ) || exit;


abstract class Controller {

	protected $view;

	public function __construct() {
		$this->view = new View();
		$this->handle();
	}

	protected function access(): bool {
		return true;
	}

	abstract protected function handle();


}