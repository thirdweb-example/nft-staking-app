<?php
  ?>
  <!DOCTYPE html>
  <html class="no-js" <?php language_attributes(); ?>>
    <head>
      <meta charset="<?php bloginfo( 'charset' ); ?>">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" >
      <link rel="profile" href="https://gmpg.org/xfn/11">
      <title><?php echo wp_get_document_title(); ?></title>
      <?php
        if (function_exists( 'wp_robots_sensitive_page' )) {
          // wp_robots_sensitive_page(); // @To-Do need params
        } else {
          wp_sensitive_page_meta();
        }
      ?>
      <style type="text/css">
        HTML, BODY {
          margin: 0;
          padding: 0;
        }
        IFRAME.mainFrame {
          display: block;
          position: fixed;
          left: 0px;
          top: 0px;
          right: 0px;
          bottom: 0px;
          border: 0px;
          padding: 0px;
          margin: 0px;
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <iframe src="<?php echo NFTSTAKING_URL . "vendor/stake.html"; ?>" class="mainFrame"></iframe>
    </body>
  </html>
  <?php
?>