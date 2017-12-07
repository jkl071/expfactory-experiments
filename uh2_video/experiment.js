/* ************************************ */
/* Define helper functions */
/* ************************************ */



document.addEventListener("keydown", function(e){
    var keynum;
    var time = jsPsych.totalTime()
    
    
    if(window.event){
    	keynum = e.keyCode;
    } else if(e.which){
    	keynum = e.which;
    }
    
    if(keynum == 84){
    	temp_array.push(keynum)
    	if(temp_array.length >= 16){
    		var elem = document.getElementById("myvideo");
			elem.webkitRequestFullScreen();
  		
  			console.log('here')
  		}
  	}
  	

    
});

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

// task specific variables
var practice_len = 5
var num_blocks = 3
var block_len = 50
var gap = 0
var current_trial = 0
var stim = '<div class = shapebox><div id = cross></div></div>'
var fast_rt_flags = 0;
var flag_thresh = 5
var flag_curr_trial = 0;


var temp_array = []
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end"
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie style="font-size:36px"><font color="white">Thanks for completing this task!</font></p>'+
		  '<p class = center-textJamie style="font-size:36px"><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var welcome_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "welcome"
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie style="font-size:36px"><font color="white">Welcome to the task!</font></p>'+
		  '<p class = center-textJamie style="font-size:36px"><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0
};
var experimentor_wait_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "experimentor_wait"
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie style="font-size:36px"><font color="white">Scanner Setup.</font></p>'+
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var scanner_wait_block_first = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = centerbox>'+
		  	  '<p class = center-textJamie style="font-size:36px"><font color="white">Task about to start!</font></p>'+
		  	  '</div></div>',
	is_html: true,
	choices: [84],
	data: {
		trial_id: "scanner_wait"
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true
};


var scanner_wait_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = centerbox>'+
		  	  '<p class = center-textJamie style="font-size:36px"><font color="white">Task about to start!</font></p>'+
		  	  '</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "scanner_wait"
	},
	timing_post_trial: 0,
	timing_stim: 10880,
	timing_response: 10880,
	response_ends_trial: false
};


/* define practice block */
var practice_block = {
  type: 'poldrack-single-stim',
  stimulus: "<video controls autoplay id='myvideo'>"+
  "<source src='/static/experiments/uh2_video/Aim2_Rest.mp4' type='video/mp4'>"+
  "</video>",
  timing_post_trial: 0,
  timing_stim: -1,
  timing_response: -1,
  response_ends_trial: true,
  is_html: true,
  data: {
    trial_id: "stim",
    exp_stage: "practice"
  },
  choices: [13]
};


/* create experiment definition array */
var uh2_video_experiment = [];



uh2_video_experiment.push(welcome_block);

uh2_video_experiment.push(experimentor_wait_block);

uh2_video_experiment.push(scanner_wait_block_first);

uh2_video_experiment.push(scanner_wait_block);

uh2_video_experiment.push(practice_block);

uh2_video_experiment.push(end_block);



