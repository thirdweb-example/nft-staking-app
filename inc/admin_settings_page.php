<?php

function nftstaking_menu_page() {
	$menu_page = add_menu_page(
		esc_html__( 'NFT Staking', 'nftstaking' ),
		esc_html__( 'NFT Staking', 'nftstaking' ),
		'manage_options',
		'nftstaking',
		'nftstaking_settings_page_view',
		'dashicons-admin-plugins',
		81
	);
}
add_action( 'admin_menu', 'nftstaking_menu_page' );

function nftstaking_frontsettings_menu_page() {
	add_submenu_page(
		'nftstaking',
		esc_html__( 'Front settings', 'nftstaking' ),
		esc_html__( 'Front settings', 'nftstaking' ),
		'manage_options',
		'nftstaking_frontsettings',
		'nftstaking_frontsettings_page',
		1
	);
}
add_action('admin_menu', 'nftstaking_frontsettings_menu_page');

function nftstaking_page_slug(){
	$slug = 'nftstaking';
	if( get_option('nftstaking_slug') ) {
		$slug = get_option('nftstaking_slug');
	}
	return esc_html( $slug );
}
function nftstaking_page_market_slug() {
 $slug = 'nftmarket';
 if( get_option('nftstaking_market_slug') ) {
   $slug = get_option('nftstaking_market_slug');
 }
 return esc_html( $slug );
}

function nftstaking_frontsettings_page() {

  ?>
  <div class="wrap lottery_options">
    <table class="form-table">
      <tr>
				<th scope="row">
					<label><?php esc_html_e( 'Permalink', 'nftstaking' );?></label>
				</th>
				<td>
					<code><?php echo esc_url( home_url('/') );?></code>
					<input name="page_slug" type="text" value="<?php echo esc_attr( nftstaking_page_slug() );?>" class="regular-text code lotteryfactory-page-slug" <?php disabled( get_option( 'nftstaking_is_home' ), 'true' ); ?>>
					<code>/</code>
					<a href="<?php echo get_site_url()?>/<?php echo nftstaking_page_slug();  ?>" class="button mcwallet-button-url<?php if( get_option( 'nftstaking_is_home' ) ) { echo ' disabled';}?>" target="_blank">
            <?php esc_html_e( 'View page', 'nftstaking' );?>
          </a>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Use as home page', 'nftstaking' );?></label>
				</th>
				<td>
					<label for="mcwallet_is_home">
						<input name="is_home" type="checkbox" id="nftstaking_is_home" value="true" <?php checked( 'true', get_option( 'nftstaking_is_home' ) ); ?>>
						<?php esc_html_e( 'Use NFTStaking as home page.', 'nftstaking' );?>
					</label>
				</td>
			</tr>
      <tr>
        <th scope="row">
          <label><?php esc_html_e('Market permalink', 'nftstaking' );?></label>
        </th>
        <td>
					<code><?php echo esc_url( home_url('/') );?></code>
					<input name="page_slug" type="text" value="<?php echo esc_attr( nftstaking_page_market_slug() );?>" class="regular-text code lotteryfactory-page-market-slug" />
					<code>/</code>
					<a href="<?php echo get_site_url()?>/<?php echo nftstaking_page_market_slug();  ?>" class="button mcwallet-button-url" target="_blank">
            <?php esc_html_e( 'View page', 'nftstaking' );?>
          </a>
				</td>
      </tr>
      <tr>
				<th scope="row"></th>
				<td>
					<?php
						submit_button( esc_attr__( 'Update options', 'nftstaking' ), 'primary', 'nftstaking-update-options', false );
					?>
          <script type="text/javascript">
            (($) => {
              $('#nftstaking-update-options').bind('click', (e) => {
                e.preventDefault();
                var thisBtn  = $(this);
                var thisParent = $('.lottery_options');
                var pageSlug = thisParent.find( '[name="page_slug"]' ).val();
                var pageHome = thisParent.find( '[name="is_home"]' );
                var ishome = 'false';
                if ( pageHome.is(':checked') ) {
                  ishome = 'true';
                }
                var data = {
                  action: 'nftstaking_update_pageoptions',
                  nonce: "<?php echo wp_create_nonce( 'nftstaking-nonce' )?>",
                  slug: pageSlug,
                  ishome: ishome,
                }
                $.post( "<?php echo admin_url( 'admin-ajax.php' ) ?>", data, function(response) {
                  alert('Saved');
                });
              })
            })(jQuery)
          </script>
				</td>
			</tr>
    </table>
  </div>
  <?php
}
/**
 * Main Settings Page
 */
function nftstaking_settings_page_view() {

  $settings_url = NFTSTAKING_URL . "vendor/settings.html?isSettingsFrame=true";
?>

<div class="wrap">
  <style type="text/css">
    .nftstakingSettingsIframe {
      background: transparent;
      width: 100%;
      height: 800px;
    }
  </style>
  <div>
    <iframe class="nftstakingSettingsIframe" src="<?php echo $settings_url ?>"></iframe>
  </div>
</div>

<?php
}

function nftstaking_add_rewrite_rules() {
	$slug = 'nftstaking';
	if ( get_option('nftstaking_slug') ) {
		$slug = get_option('nftstaking_slug');
	}
	add_rewrite_rule( $slug . '/?$', 'index.php?nftstaking_page=1','top' );
}
add_action('init', 'nftstaking_add_rewrite_rules');
/**
 * Update options
 */
function nftstaking_update_pageoptions() {

	/* Check nonce */
	check_ajax_referer( 'nftstaking-nonce', 'nonce' );
  if ( ! current_user_can( 'manage_options' ) ) {
		die();
	}
  
  if ( untrailingslashit( $_POST['slug'] ) ) {
    $slug = untrailingslashit( sanitize_title( $_POST['slug'] ) );
    update_option( 'nftstaking_slug', $slug );
  }
  if ( $_POST['ishome'] == 'true' ) {
    update_option( 'nftstaking_is_home', sanitize_text_field( $_POST['ishome'] ) );
    $is_home = 'true';
  } else {
    delete_option( 'nftstaking_is_home' );
  }
  
  nftstaking_add_rewrite_rules();
  flush_rewrite_rules();

	$result_arr = array(
		'status'   => 'ok'
	);

	wp_send_json( $result_arr );

}
add_action( 'wp_ajax_nftstaking_update_pageoptions', 'nftstaking_update_pageoptions' );
