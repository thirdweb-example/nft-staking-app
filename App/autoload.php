<?php
defined( 'ABSPATH' ) || exit;

spl_autoload_register( function ( $class ) {

	if ( strpos( $class, 'NFTSTAKING' ) !== false ) {
		require __DIR__ . '/../' . str_replace( [ '\\', 'NFTSTAKING' ], [ '/', 'App' ], $class ) . '.php';

	}
} );

foreach ( glob( __DIR__ . '/Controllers/*.php' ) as $file ) {
	$class = '\NFTSTAKING\Controllers\\' . basename( $file, '.php' );
	if ( class_exists( $class ) ) {
		$obj = new $class;
	}

}