/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */


function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'cue_control_food', subject_ID: subject_ID})
}


var createStims = function(numStims,numIterations,numZeroes){
	var lowEnd = 1
	var numberArray = []
	for (i = lowEnd; i<numStims+1; i++){
		num_zeros = numZeroes - i.toString().length
		if (num_zeros === 0) {
			numberArray.push(i)
		}else if (num_zeros == 1) {
			numberArray.push('0' +i)
		}else if (num_zeros == 2) {
			numberArray.push('00' +i)
		}else if (num_zeros == 3) {
			numberArray.push('000' +i)
		}
	}

	var stimArray = jsPsych.randomization.repeat(numberArray,numIterations)
	return stimArray
}

	
	
function createAllStims(numStimsPerCategory, numIterations, numZeroes, nullType){
	
	var valued_stim_array = createStims(numStimsPerCategory, numIterations, numZeroes)
	var neutral_stim_array = jsPsych.randomization.repeat(neutral_pics,1)

	
	var stims = []
	for(var i = 0; i < numStimsPerCategory/2; i++){
		valued_now = {
			stim: valued_stim_array.pop(),
			trial_cue_type: now_cue,
			stim_type: experiment_stim_type,
			}
		
		valued_later = {
			stim: valued_stim_array.pop(),
			trial_cue_type: later_cue,
			stim_type: experiment_stim_type,
			}
			
		control_now = {
			stim: neutral_stim_array.pop(),
			trial_cue_type: now_cue,
			stim_type: 'neutral',
			}
			
		control_later = {
			stim: neutral_stim_array.pop(),
			trial_cue_type: later_cue,
			stim_type: 'neutral',
			}
		
		if (nullType == 1){
		
			null_stims = {
				stim: 'null',
				trial_cue_type: 'null',
				stim_type: 'null',
			}
			
			stims.push(null_stims)
		}
		stims.push(valued_now)
		stims.push(valued_later)
		stims.push(control_now)
		stims.push(control_later)
	}
	
	stims = jsPsych.randomization.repeat(stims,1,true)
	return stims
}
	


function getRestText(){
	if(currBlock == numBlocks - 1){
		return '<div class = bigbox><div class = centerbox>'+
		  	  	 '<p class = center-textJamie style="font-size:36px"><font color="white">This phase is over.</font></p>'+
		      	 '<p class = center-textJamie style="font-size:36px"><font color="white">The next phase will start shortly.</font></p>'+
		 	   '</div></div>'
	
	}else if(currBlock < numBlocks - 1){	
		return '<div class = bigbox><div class = centerbox>'+
		  	  	 '<p class = center-textJamie style="font-size:36px"><font color="white">Take a break!</font></p>'+
		      	 '<p class = center-textJamie style="font-size:36px"><font color="white">The task will start again in 20 seconds.</font></p>'+
		 	   '</div></div>'
	}

}



function getCue(){	
	whichCue = stims.trial_cue_type.pop()
	stim_type = stims.stim_type.pop()
	current_stim = stims.stim.pop()
	
	if (whichCue == "null"){
	
		return '<div class = bigbox><div class = centerbox><div class = fixation></div></div></div>'
	
	} else {

		return '<div class = bigbox><div class = centerbox><div class = fixation><font color="white">'+whichCue+'</font></div></div></div>'
	
	}

}



function getProbe(){
	
	
	if(stim_type == experiment_stim_type){
	
		return probeBoard1 + valued_stim_directory + current_stim + fileTypeJPG + probeBoard2		
	}else if(stim_type == "neutral"){

		return probeBoard1 + neutral_directory + current_stim + "'></img>" + probeBoard2	
	}else if (stim_type == "null"){
		return '<div class = bigbox></div>'
	}
	
	
}



function getRatingBoard(){	
	console.log(current_stim)
	
	if(current_game_state == 'training'){
	
		if(stim_type == experiment_stim_type){
	
			return ratingBoard1 + valued_stim_directory + current_stim + fileTypeJPG + ratingBoard2		
		} else if(stim_type == "neutral"){

			return ratingBoard1 + neutral_directory + current_stim + "'></img>" + ratingBoard2	
		} else if (stim_type == "null"){
			
			return '<div class = bigbox></div>'
	}
	
		
	}else if(current_game_state == 'post_rating'){
		
		
		current_stim = post_rating_stims.stim.pop()
		whichCue =  post_rating_stims.trial_cue_type.pop()
		stim_type = post_rating_stims.stim_type.pop()
		
		if(stim_type == experiment_stim_type){
	
			return ratingBoard1 + valued_stim_directory + current_stim + fileTypeJPG + ratingBoard2		
		}else if(stim_type == "neutral"){

			return ratingBoard1 + neutral_directory + current_stim + "'></img>" + ratingBoard2	
		}
		
	
	}
	
	
}



document.addEventListener("keydown", function(e){
    var keynum;
    var time = jsPsych.totalTime()
    
    
    if(window.event){
    	keynum = e.keyCode;
    } else if(e.which){
    	keynum = e.which;
    }
    
    if (keynum == 84){
    trigger_tracker.push(keynum)
    trigger_timer.push(time)
    }
    
});

var appendData = function(){
	//curr_trial = jsPsych.progress().current_trial_global
	//trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id

	jsPsych.data.addDataToLastTrial({
		triggers: trigger_tracker,
		trigger_time: trigger_timer
	})

	trigger_tracker = []
	trigger_timer = []
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
var subject_ID = 472
var numStimsPerCategory = 50
var totalStims = (numStimsPerCategory/2) * 5 // 5 total conditions




var numIterations = 1 //number of a certain stim, in each of the one conditions
var numBlocks = totalStims / 25
var numStimsPerBlock = totalStims / numBlocks

var submitPressMax = 5



var now_cue = 'NOW'
var later_cue = 'LATER'
var experiment_stim_type = 'food'
var current_game_state = "start"
var mainNullType = 1
var postRateNullType = 0


var preFileType = "<img class = center src='/static/experiments/cue_control_food/images/"


var pathSource = "/static/experiments/cue_control_food/images/stim_numbered/"
var valued_stim_directory = "PDC3_chosen_food_500/" //controls if you are showing food or smoking pictures
var neutral_directory = "neutral_stims_500/"

var fileTypeBMP = ".bmp'></img>"
var fileTypePNG = ".png'></img>"
var fileTypeJPG = ".jpg'></img>"


var whichCue = ""
var current_stim = ""
var current_trial_type = ""
var currBlock = 0
var trigger_tracker = []
var trigger_timer = []
var submitPress = 0





var preloadStimNumbered = createStims(60, 1, 4) //numStims
var preloadControlNonFood = createStims(30, 1, 4)

var images = []
for(var i=0;i<preloadStimNumbered.length;i++){
	images.push(pathSource + preloadStimNumbered[i] + ".bmp")
}

for(var i=0;i<preloadControlNonFood.length;i++){
	images.push("/static/experiments/cue_control_food/images/control_non_food/" + preloadControlNonFood[i] + ".bmp")
}


jsPsych.pluginAPI.preloadImages(images);






////////////////
var probeBoard1 = '<div class = bigbox>'+
		"<div class = center_picture_box>"+preFileType 
		
var probeBoard2 = "</div></div>"
////////////////


var ratingBoard1 = 
	'<div class = bigbox>'+
		'<div class = practice_rating_text>'+
		'<p class = center-textJamie style="font-size:26px"><font color = "white">Please rate how much you currently want to consume/use the item.</font></p>'+
		'</div>'+
		
		'<div class = center_picture_box>'+preFileType
		
var ratingBoard2 = 
	    '</div>'+
		
		'<div class = buttonbox>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >1</button></div>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >2</button></div>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >3</button></div>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >4</button></div>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >5</button></div>'+
		'</div>'+	
	'</div>'
	
	
	
	
	
var testratingBoard1 = 
	'<div class = bigbox>'+
		'<div class = practice_rating_text>'+
		'<p class = center-textJamie style="font-size:26px"><font color = "white">Please rate how much you currently want to consume/use the item, '

var testratingBoard2 = 
		'.</font></p>'+
		'</div>'+
		
		'<div class = center_picture_box>'+preFileType
		
var testratingBoard3 = 
	    '</div>'+
		
		'<div class = buttonbox>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >1</button></div>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >2</button></div>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >3</button></div>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >4</button></div>'+
			'<div class = inner><button type="submit" class="likert_btn" onClick="return false;" >5</button></div>'+
		'</div>'+	
	'</div>'
	
 
	
	
	
var stims = createAllStims(numStimsPerCategory,numIterations,3,mainNullType) // last input is for numZeroes
var post_rating_stims = createAllStims(numStimsPerCategory,numIterations,3,postRateNullType)


/* ************************************ */
/*        Set up jsPsych blocks         */
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
	timing_post_trial: 0,
	on_finish: appendData
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
	timing_post_trial: 0,
	on_finish: appendData
};

var post_rating_intro = {
	type: 'poldrack-text',
	data: {
		trial_id: "post_rating_intro"
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie style="font-size:36px"><font color="white">For this next phase, please rate how much you want to consume the item.</font></p>'+
		  '<p class = center-textJamie style="font-size:36px"><font color="white">1 = very low, 5 = very high.</font></p>'+		  
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: function(){
		jsPsych.data.addDataToLastTrial({
		triggers: trigger_tracker,
		trigger_time: trigger_timer
		})

		trigger_tracker = []
		trigger_timer = []
		
		current_game_state = "post_rating"
	}
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
	cont_key: [84],
	timing_post_trial: 0,
	on_trial_finish: appendData
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
	response_ends_trial: false,
	on_trial_finish: function(){
		jsPsych.data.addDataToLastTrial({
		triggers: trigger_tracker,
		trigger_time: trigger_timer
		})

		trigger_tracker = []
		trigger_timer = []
		
		current_game_state = "training"
	}
};


var instructions_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instructions"
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
			'<p class = block-text><font color = "white">Each trial is composed of multiple parts.</font></p>'+
			'<p class = block-text><font color = "white">In the first part, you will see a cue, either NOW or LATER followed by a probe.  The cue will instruct you how to think about the probe.</font></p>'+
			'<p class = block-text><font color = "white">If you see the cue, NOW, please think about the immediate consequences of consuming/using the pictured stimulus.</font></p>'+
			'<p class = block-text><font color = "white">If you see the cue, LATER, please think about the long-term consequences of repeatedly consuming/using the pictured stimulus.</font></p>'+
			'<p class = block-text><font color = "white">In the second part, you will rate the current probe.  Please indicate how much you currently want to consume/use the probe on the screen.</font></p>'+
			'<p class = block-text><font color = "white">Press <strong>enter</strong> to continue.</font></p>'+		
	
		 '</div></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: appendData
};


var scanner_rest_block = {
	type: 'poldrack-single-stim',
	stimulus: getRestText,
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "scanner_rest"
	},
	timing_post_trial: 0,
	timing_stim: 3000,
	timing_response: 3000,
	on_finish: appendData
};


/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */

var training_trials = []
for(var i = 0; i < numStimsPerBlock; i++){ //numStims before, should be # of trials per block (40??)
	
	var cue_block = {
	type: 'poldrack-single-stim',
	stimulus: getCue,
	is_html: true,
	choices: [13], //'none'
	data: {
		trial_id: "cue"
	},
	timing_post_trial: 0,
	timing_stim: 2000, 
	timing_response: 2000, 
	on_finish: appendData,
	response_ends_trial: true
	};
	
	var probe_block = {
	type: 'poldrack-single-stim',
	stimulus: getProbe,
	is_html: true,
	choices: [13], //'none'
	data: {
		trial_id: "probe"
	},
	timing_post_trial: 0,
	timing_stim: 5000,
	timing_response: 5000,
	on_finish: appendData,
	response_ends_trial: true
	};
	
	var rating_block = {
	type: 'poldrack-single-stim',
	stimulus: getRatingBoard,
	is_html: true,
	choices: [13], //'none'
	data: {
		trial_id: "current_rating"
	},
	timing_post_trial: 0,
	timing_stim: 3000, 
	timing_response: 3000, 
	on_finish: appendData,
	response_ends_trial: true
	};
	
	//training_trials.push(fixation_block)
	training_trials.push(cue_block)
	training_trials.push(probe_block)
	//training_trials.push(delay_block)
	training_trials.push(rating_block)
}
training_trials.push(scanner_rest_block)



var training_node = {
	timeline: training_trials,
	loop_function: function(data){
		currBlock += 1
	
		if(currBlock == numBlocks){
			
			
			return false
		}else if (currBlock < numBlocks){
			
			
			return true
		}
	
	}
}


var post_rating_trials = []
for(var i = 0; i < 60; i++){ //numStims before, but probably should equal the number of all stims = 120
	var rating_block = {
	type: 'poldrack-single-stim',
	stimulus: getRatingBoard,
	is_html: true,
	choices: [13],
	data: {
		trial_id: "post_rating"
	},
	timing_post_trial: 0,
	timing_stim: 3000,
	timing_response: 3000,
	on_finish: appendData
	};
	
	//post_rating_trials.push(fixation_block)
	post_rating_trials.push(rating_block)
}

var post_rating_node = {
	timeline: post_rating_trials,
	loop_function: function(data){
		
	
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var cue_control_food_experiment = []

cue_control_food_experiment.push(welcome_block);

cue_control_food_experiment.push(instructions_block);

cue_control_food_experiment.push(experimentor_wait_block);

cue_control_food_experiment.push(scanner_wait_block);

cue_control_food_experiment.push(training_node);
/*
cue_control_food_experiment.push(post_rating_intro);

cue_control_food_experiment.push(post_rating_node);
*/
cue_control_food_experiment.push(end_block);




