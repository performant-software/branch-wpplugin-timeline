Performant Software Timeline

To use this, activate the plugin, then initialize it with the following code:

if (class_exists('PsTimeline')) {
	new PsTimeline(array('post_type' => $article_post_type['post_type'], 
		'start_date_name' => 'art_date_started', 
		'end_date_name' => 'art_date_ended', 
		'duration_name' => 'art_duration'));	
}
 
