<?php
/*
Plugin Name: PS Timeline
Plugin URI: http://www.performantsoftware.com/wordpress/plugins/timeline/
Description: This plugin includes the simile timeline and formats the data the way the Branch project expects
Version: 1.0.0
Author: Paul Rosen
Author URI: http://paulrosen.net
License: GPL version 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
*/

class PsTimeline {
	private $post_type;
	private $start_date_name;
	private $end_date_name;
	private $duration_name;
	public function __construct($params) {
		$this->post_type = $params['post_type'];
		$this->start_date_name = $params['start_date_name'];
		$this->end_date_name = $params['end_date_name'];
		$this->duration_name = $params['duration_name'];
		
		add_shortcode('ps-timeline', array($this, 'performantTimeline'));
		add_action( 'wp_ajax_nopriv_pstimeline', array($this, 'pstimeline_ajax') );
		add_action( 'wp_ajax_pstimeline', array($this, 'pstimeline_ajax') );
		add_action('wp_enqueue_scripts', array($this, 'my_scripts_method'));

	}
	
	public function performantTimeline() {
		$ajax_url = get_bloginfo('url') . "/wp-admin/admin-ajax.php?action=pstimeline";

		$timeline = "\n\n<!-- timeline -->\n";
		$timeline .= "<div class='timeline-wp-widget'>\n";
		$timeline .= "\t<div id='my-timeline' class='timeline-default'></div>\n";
		$timeline .= "\t<div class='pstl_controls' id='pstl_controls'></div>\n";
		//$timeline .= "\t<script src='" . $ajax_url . "&callback=loadSpans' type='text/javascript'></script>\n";
		$timeline .= "\t<script>initTimeline('" . $ajax_url . "');</script>\n</div>\n\n";

		return $timeline;

	}

	// Handle the AJAX request to get the event data. You don't have to be logged in to see this, so
	// both handlers point to the same place.

	public function pstimeline_ajax() {
		// get the submitted parameters
		//    $callback = $_POST['callback'];
		//    $events = $_POST['events'];

		$output = array();
		$args = array( 'post_type' => $this->post_type, 'posts_per_page' => -1 );
		$loop = new WP_Query( $args );
		while ( $loop->have_posts() ) : $loop->the_post();
		$start_date = get_post_meta( get_the_ID(), $this->start_date_name, true );

		$entry = array(
			"title" => get_the_title(),
			"start" => $start_date ."T00:00:00Z",
			"description" => get_the_content(),
			"durationEvent" => get_post_meta( get_the_ID(), $this->duration_name, true ) == 'Yes'
//			"link" => get_permalink(),
//			"image" => get_the_post_thumbnail()			
			);
		$end_date = get_post_meta( get_the_ID(), $this->end_date_name, true );
		if ($end_date != "" && $end_date != $start_date)
			$entry["end"] = $end_date . "T00:00:00Z";

		if ( function_exists('has_post_thumbnail') && has_post_thumbnail($post->ID) ) {
			$thumbnail = wp_get_attachment_image_src( get_post_thumbnail_id($post->ID), "thumbnail" );
			if ($thumbnail[0])
				$entry["image"] = $thumbnail[0];
		}
		
		$output[] = $entry;
		endwhile;

		// generate the response
		$response = array( 
			"dateTimeFormat" => "Gregorian",
			// "wikiURL" => get_bloginfo('url'),
			// "wikiSection" => "",
			"events" => $output
			);

		//    $response =  array( 'success' => true );

		// response output
		header( "Content-Type: application/json" );
		header( "Cache-Control:must-revalidate, private, max-age=0");
		echo json_encode($response);

		// IMPORTANT: don't forget to "exit"
		exit;
	}

	public function my_scripts_method() {
		wp_register_script( 'timeline-api', 'http://api.simile-widgets.org/timeline/2.3.1/timeline-api.js?bundle=true');
		wp_enqueue_script( 'timeline-api' );
		wp_register_script( 'ps_timeline', plugins_url( 'ps_timeline.js' , __FILE__ ));
		wp_enqueue_script( 'ps_timeline' );
	}    
} 
?>
