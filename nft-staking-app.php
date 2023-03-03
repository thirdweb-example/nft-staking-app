<?php
/**
Plugin Name: NFT Staking
Description: Blockchain NFT Staking
Requires PHP: 7.1
Text Domain: nft-staking-app
Domain Path: /lang
Version: 1.0.1
 */

/* Define Plugin Constants */
defined( 'ABSPATH' ) || exit;
define( 'NFTSTAKING_TEMPLATE_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'templates' );
define( 'NFTSTAKING_BASE_DIR', __DIR__ );
define( 'NFTSTAKING_BASE_FILE', __FILE__ );
define( 'NFTSTAKING_PATH', plugin_dir_path( __FILE__ ) );
define( 'NFTSTAKING_URL', plugin_dir_url( __FILE__ ) );
define( 'NFTSTAKING_VER', '1.0.1');

/**
 * Plugin Init
 */
require NFTSTAKING_PATH . 'inc' . DIRECTORY_SEPARATOR . 'init.php';
