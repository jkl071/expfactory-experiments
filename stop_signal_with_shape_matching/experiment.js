/* ************************************ */
/* Define helper functions */
/* ************************************ */
function assessPerformance() {
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	experiment_data = experiment_data.concat(jsPsych.data.getTrialsOfType('poldrack-categorize'))
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	for (var k = 0; k < choices.length; k++) {
		choice_counts[choices[k]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].possible_responses != 'none') {
			trial_count += 1
			rt = experiment_data[i].rt
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (rt == -1) {
				missed_count += 1
			} else {
				rt_array.push(rt)
			}
		}
	}
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	credit_var = (missed_percent < 0.4 && avg_rt > 200 && responses_ok)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

var getPracticeFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + practice_feedback_text + '</p></div>'
}

var getCategorizeFeedback = function(){
	curr_trial = jsPsych.progress().current_trial_global - 1
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	
	console.log(trial_id)
	if ((trial_id == 'stim') && (jsPsych.data.getDataByTrialIndex(curr_trial).SS_trial_type != 'stop')){
		if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1)){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text
	
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text
	
		}
	} else if (jsPsych.data.getDataByTrialIndex(curr_trial).SS_trial_type == 'stop'){
	
		return '<div class = fb_box><div class = center-text><font size = 20></font></div></div>' + prompt_text
	}
}

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

var getTestFeedback = function() {
	var data = test_block_data
	var rt_array = [];
	var sum_correct = 0;
	var go_length = 0;
	var stop_length = 0;
	var num_responses = 0;
	var successful_stops = 0;
	for (var i = 0; i < data.length; i++) {
		if (data[i].SS_trial_type == "go") {
			go_length += 1
			if (data[i].rt != -1) {
				num_responses += 1
				rt_array.push(data[i].rt);
				if (data[i].key_press == data[i].correct_response) {
					sum_correct += 1
				}
			}
		} else {
			stop_length += 1
			if (data[i].rt == -1) {
				successful_stops += 1
			}
		}
	}
	var average_rt = -1;
    if (rt_array.length !== 0) {
      average_rt = math.median(rt_array);
      rtMedians.push(average_rt)
    }
	var rt_diff = 0
	if (rtMedians.length !== 0) {
		rt_diff = (average_rt - rtMedians.slice(-1)[0])
	}
	var GoCorrect_percent = sum_correct / go_length;
	var missed_responses = (go_length - num_responses) / go_length
	var StopCorrect_percent = successful_stops / stop_length
	stopAccMeans.push(StopCorrect_percent)
	var stopAverage = math.mean(stopAccMeans)

	test_feedback_text = "<br>Done with a test block. Please take this time to read your feedback and to take a short break! Press <strong>enter</strong> to continue after you have read the feedback."
	test_feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy for non-star trials: " + Math.round(GoCorrect_percent * 100)+ "%</strong>" 
	if (average_rt > RT_thresh || rt_diff > rt_diff_thresh) {
		test_feedback_text +=
			'</p><p class = block-text>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.'
	}
	if (missed_responses >= missed_response_thresh) {
		test_feedback_text +=
			'</p><p class = block-text><strong>We have detected a number of trials that required a response, where no response was made.  Please ensure that you are responding to each shape, unless a star appears.</strong>'
	}
	if (GoCorrect_percent < accuracy_thresh) {
		test_feedback_text += '</p><p class = block-text>Your accuracy is too low.  Remember, ' + prompt_text_list
	}
	if (StopCorrect_percent < (0.5-stop_thresh) || stopAverage < 0.45){
			 	test_feedback_text +=
			 		'</p><p class = block-text><strong>Remember to try and withhold your response when you see a stop signal.</strong>'	
	} else if (StopCorrect_percent > (0.5+stop_thresh) || stopAverage > 0.55){
	 	test_feedback_text +=
	 		'</p><p class = block-text><strong>Remember, do not slow your responses to the shape to see if a star will appear before you respond.  Please respond to each shape as quickly and as accurately as possible.</strong>'
	}

	return '<div class = centerbox><p class = block-text>' + test_feedback_text + '</p></div>'
}
/* Staircase procedure. After each successful stop, make the stop signal delay longer (making stopping harder) */
var updateSSD = function(data) {
	if (data.SS_trial_type == 'stop') {
		if (data.rt == -1 && SSD < 850) {
			SSD = SSD + 50
		} else if (data.rt != -1 && SSD > 0) {
			SSD = SSD - 50
		}
	}
}

var getSSD = function() {
	return SSD
}

var resetSSD = function() {
	SSD = 250
}


var getStim = function() {
	var trial_type = trial_types.pop()
	var probe_i = randomDraw([1,2,3,4,5,6,7,8,9,10])
	var target_i = 0
	var distractor_i = 0
	if (trial_type[0] == 'S') {
		target_i = probe_i
		currData.correct_response = possible_responses[0][1]
	} else {
		target_i = randomDraw([1,2,3,4,5,6,7,8,9,10].filter(function(y) {return y != probe_i}))
		currData.correct_response = possible_responses[1][1]
	}
	if (trial_type[1] == 'S') {
		distractor_i = target_i
	} else if (trial_type[2] == 'S') {
		distractor_i = probe_i
	} else if (trial_type[2] == 'D') {
		distractor_i = randomDraw([1,2,3,4,5,6,7,8,9,10].filter(function(y) {return $.inArray(y, [target_i, probe_i]) == -1}))
	}
	currData.trial_num = current_trial
	currData.condition = trial_type
	currData.probe_id = probe_i
	currData.target_id = target_i
	var target = '<div class = leftbox>'+center_prefix+path+target_i+'_green.png'+postfix+'</div>'
	var probe = '<div class = rightbox>'+center_prefix+path+probe_i+'_white.png'+postfix+'</div>'
	var distractor = ''
	if (distractor_i !== 0) {
		distractor = '<div class = distractorbox>'+center_prefix+path+distractor_i+'_red.png'+postfix+'</div>'
		currData.distractor_id = distractor_i
	}
	current_trial += 1
	var stim = target  + probe + distractor
	return stim
}

var getData = function() {
	currData.exp_stage = exp_stage
	return currData
}

var getResponse = function() {
	return currData.correct_response
}
/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0
// SS task variables
var practice_repetitions = 1
var practice_repetition_thresh = 5
var test_block_data = []
var rtMedians = []
var stopAccMeans =[]	
var RT_thresh = 1000
var rt_diff_thresh = 75
var missed_response_thresh = 0.1
var accuracy_thresh = 0.8
var stop_thresh = 0.2


var SSD = 250

var stop_signal =
 '<div class = rightbox>'+center_prefix+path+'stopSignal.png'+postfix+'</div>'

var possible_responses = jsPsych.randomization.repeat([['M Key', 77],['Z Key', 90]],1)



// task specific variables
// Set up variables for stimuli
var colors = ['white','red','green']
var path = '/static/experiments/stop_signal_with_shape_matching/images/'
var center_prefix = '<div class = centerimg><img src = "'
var mask_prefix = '<div class = "centerimg mask"><img src = "'
var postfix = '"</img></div>'
var shape_stim = []
var exp_stage = 'practice'
var currData = {'trial_id': 'stim'}
var current_trial = 0

for (var i = 1; i<11; i++) {
	for (var c = 0; c<3; c++) {
		shape_stim.push(path + i + '_' + colors[c] + '.png')
	}
}
jsPsych.pluginAPI.preloadImages(shape_stim.concat(path+'mask.png'))
jsPsych.pluginAPI.preloadImages(shape_stim.concat(path+'stopSignal.png'))

var practice_len = 15
// Trial types denoted by three letters for the relationship between:
// probe-target, target-distractor, distractor-probe of the form
// SDS where "S" = match and "D" = non-match, N = "Neutral"
var trial_types = jsPsych.randomization.repeat(['SSS', 'SDD', 'SNN', 'DSD', 'DDD', 'DDS', 'DNN'],practice_len/7)
var exp_len = 120
var numconditions = 2
var numblocks = 4
var choices = [90, 77]



var practice_stop_trials = jsPsych.randomization.repeat(['stop', 'stop', 'stop', 'go', 'go', 'go',
	'go', 'go', 'go', 'go' ], practice_len / 10)

var stop_trials = jsPsych.randomization.repeat(['stop', 'stop', 'stop', 'go', 'go', 'go',
	'go', 'go', 'go', 'go' ], exp_len / 10)

var getSSPractice_trial_type = function() {
	return practice_stop_trials.pop()
}
var getSStrial_type = function () {
	return stop_trials.pop()
}

var prompt_text_list = '<ul list-text>'+
						'<li>Do not respond if a star appears!</li>' +
						'<li>Judge if green and white shapes are the same or different</li>' +
						'<li>Same: '+possible_responses[0][0]+'</li>' +
						'<li>Different: '+possible_responses[1][0]+'</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Do not respond if a star appears!</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Judge if green and white shapes are the same or different</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Same: '+possible_responses[0][0]+'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Different: '+possible_responses[1][0]+'</p>' +
				  '</div>'


/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

var practice1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = instructBox>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">This is what the first part of the trial will look like.  There are the green and red shapes on the left, and 1 white shape on the right.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">The green and white shapes are different, so you would respond with the '+possible_responses[1][0]+'.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Ignore the red shape!</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = leftbox>'+center_prefix+path+'7_green.png'+postfix+'</div>' +
				'<div class = rightbox>'+center_prefix+path+'2_white.png'+postfix+'</div>' +
				'<div class = distractorbox>'+center_prefix+path+'2_red.png'+postfix+'</div>' +
				
				'</div>',				
	is_html: true,
	choices: [13],
	data: {
		trial_id: "visual_instruction",
		},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true
};

var practice2 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = instructBox>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">This is what the second part of the trial may look like.  On this trial, a star appeared around the white shape.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If a star appears, (only white shapes may have stars, not green or red shapes) , please try your best <strong>not to respond</strong> on that trial.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Do not slow down your responses in order to wait for the star.  Continue to respond as quickly and as accurately as possible and try your best not to respond, if a star appears.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = leftbox>'+center_prefix+path+'7_green.png'+postfix+'</div>' +
				'<div class = stopbox>'+center_prefix+path+'stopSignal.png'+postfix+'</div>' +
				'<div class = rightbox>'+center_prefix+path+'2_white.png'+postfix+'</div>' +
				
				'<div class = distractorbox>'+center_prefix+path+'2_red.png'+postfix+'</div>'+
				'</div>',				
	is_html: true,
	choices: [13],
	data: {
		trial_id: "visual_instruction",
		},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true
};

/* define static blocks */
var response_keys =
	'<ul list-text><li><span class = "large" style = "color:red">WORD</span>: "R key"</li><li><span class = "large" style = "color:blue">WORD</span>: "B key"</li><li><span class = "large" style = "color:green">WORD</span>: "G key"</li></ul>'


var feedback_instruct_text =
	'Welcome to the experiment. This experiment will take less than 20 minutes. Press <strong>enter</strong> to begin.'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages: [
		'<div class = centerbox>'+
			'<p class = block-text>In this experiment, you will see 1 white shape to the right and 1 green shape to the left, on every trial. Sometimes, 1 red shape will be overlapping with the green shape on the left.</p> '+
		
			'<p class = block-text>You will be asked to judge whether the green shape on the left, is the same as the white shape on the right.</p>'+
			
			'<p class = block-text>If the shapes are the same, please press the '+possible_responses[0][0]+'.</p>'+
			
			'<p class = block-text>If the shapes are different, please press the '+possible_responses[1][0]+'.</p>'+
				
			'<p class = block-text>Please ignore the red shape, when it appears!</p>'+
		
		'</div>',
		
		'<div class = centerbox>'+
			'<p class = block-text>On some trials, a star will appear around the white shape on the right.  The star will appear with, or shortly after the white shape appears.</p>'+
			
			'<p class = block-text>If you see a star appear, please try your best to make no response on that trial.</p>'+
		
			'<p class = block-text>Please do not slow down your responses in order to wait for the star.  Continue to respond as quickly and accurately as possible.</p>'+
			
			'<p class = block-text>If a star does appear, they will appear only with the white shape.</p>'+
					
			'<p class = block-text>We will show you what a trial looks like when you finish instructions. Please make sure you understand the instructions before moving on.</p>'+
		'</div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};


var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-single-stim') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime < instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
    	exp_id: 'stop_signal_with_shape_matching'
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: assessPerformance
};

var practice_feedback_text =
	'We will start practice. During practice, you will receive a prompt to remind you of the rules.  <strong>This prompt will be removed for test!</strong> Press <strong>enter</strong> to begin.'
var practice_feedback_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "feedback",
		exp_stage: "practice"
	},
	
	text: getPracticeFeedback,
	cont_key: [13],
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	text: '<div class = centerbox>'+
			'<p class = block-text>We will now start the test portion.</p>'+
			
			'<p class = block-text>Please judge whether the green shape on the left, is the same as the white shape on the right.</p>'+
			
			'<p class = block-text>If the shapes are the same, please press the '+possible_responses[0][0]+'.  If the shapes are different, press the '+possible_responses[1][0]+'.</p>'+
		
			'<p class = block-text>Please ignore the red shape, when it appears!</p>'+
			
			'<p class = block-text>If you see a star appear, please try your best to make no response on that trial.</p>'+
		
			'<p class = block-text>Please do not slow down your responses in order to wait for the star.  Continue to respond as quickly and accurately as possible.</p>'+
				
			'<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>'+ 
		 '</div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function(){
		feedback_text = "We will now start the test portion. Press enter to begin."
		current_trial = 0
		exp_stage = 'test'
		trial_types = jsPsych.randomization.repeat(['SSS', 'SDD', 'SNN', 'DSD', 'DDD', 'DDS', 'DNN'],exp_len/7)
	}
};

var rest_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "feedback"
	},
	timing_response: 180000,
	text: getTestFeedback,
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function() {
		test_block_data = []
	}
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_response: 500,
	timing_post_trial: 0,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({'exp_stage': exp_stage})
	},
}

var mask_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = "leftbox">'+mask_prefix+path+'mask.png'+postfix+'</div>' +
		'<div class = "rightbox">'+mask_prefix+path+'mask.png'+postfix+'</div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "mask"
	},
	timing_response: 400,
	timing_post_trial: 0, //was 500, but changing to 0
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({'exp_stage': exp_stage})
	},
}



NoSS_practice_trials = []
NoSS_practice_trials.push(practice_feedback_block)
for (var i = 0; i < practice_len; i++) {
	NoSS_practice_trials.push(fixation_block)
	var stim_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: choices,
		key_answer: getResponse,
		data: getData,
		correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>',
		incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>',
		timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>',
		timing_response: 2000,
		//timing_stim: 1000,
		timing_feedback: 500,
		show_stim_with_feedback: true,
		timing_post_trial: 0,
		prompt: '<div class = centerbox><p class = block-text>Press "M" key if the white and green shapes are the same. Otherwise press the "Z" key.</p></div>.',
		on_finish:  function() {
			jsPsych.data.addDataToLastTrial({
				exp_stage: currData.exp_stage,
				trial_num: current_trial
			})
			
		}
	}	
	NoSS_practice_trials.push(stim_block)
	NoSS_practice_trials.push(mask_block)
}

var NoSS_practice_node = {
	timeline: NoSS_practice_trials,
	loop_function: function(data) {
		practice_repetitions += 1
		var rt_array = [];
		var sum_correct = 0;
		var go_length = 0;
		var num_responses = 0;
		for (var i = 0; i < data.length; i++) {
			if (data[i].trial_id == 'stim') {
				if (data[i].rt != -1) {
					num_responses += 1
					rt_array.push(data[i].rt);
					if (data[i].key_press === data[i].correct_response) {
						sum_correct += 1
					}
				}
				go_length += 1
			}
		}
		var average_rt = -1
		if (rt_array.length !== 0) {
			average_rt = math.median(rt_array);
		}
		console.log('here');
		var GoCorrect_percent = sum_correct / go_length;
		var missed_responses = (go_length -num_responses) / go_length
		practice_feedback_text = "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy for non-star trials: " + Math.round(GoCorrect_percent * 100)+ "%</strong>" 
		if ((average_rt < RT_thresh && GoCorrect_percent > accuracy_thresh && missed_responses <
		missed_response_thresh) || practice_repetitions > practice_repetition_thresh) {
			trial_types = jsPsych.randomization.repeat(['SSS', 'SDD', 'SNN', 'DSD', 'DDD', 'DDS', 'DNN'],practice_len/7)
			current_trial = 0
			practice_repetitions = 1
			practice_feedback_text +=
				'</p><p class = block-text>For the rest of the experiment, on some proportion of trials a white "stop signal" in the shape of a star will appear around the white shape on the right side of the screen. When this happens please try your best to stop your response and press nothing on that trial.</p><p class = block-text>The star will appear around the same time or shortly after the shape appears. Because of this, you will not always be able to successfully stop when a star appears. However, if you continue to try very hard to stop when a star appears, you will be able to stop sometimes but not always.</p><p class = block-text><strong>Please balance the requirement to respond quickly and accurately to the tasks while trying very hard to stop to the stop signal.</strong></p><p class = block-text>Press <strong>Enter</strong> to continue'
				console.log('here1');
				return false;
		} else {
			trial_types = jsPsych.randomization.repeat(['SSS', 'SDD', 'SNN', 'DSD', 'DDD', 'DDS', 'DNN'],practice_len/7)

			practice_feedback_text += '</p><p class = block-text>We will try another practice block. '
			if (average_rt > RT_thresh) {
				practice_feedback_text +=
					'</p><p class = block-text>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.'
			}
			if (missed_responses >= missed_response_thresh) {
				practice_feedback_text +=
					'</p><p class = block-text><strong>We have detected a number of trials that required a response, where no response was made.  Please ensure that you are responding to each shape.</strong>'
			}
			if (GoCorrect_percent <= accuracy_thresh) {
				practice_feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.'
			}
			practice_feedback_text += '</p><p class = block-text>Press <strong>Enter</strong> to continue'
			console.log('here2');
			current_trial = 0
			return true;
		} 
	}
}


var practice_trials = []
practice_trials.push(practice_feedback_block)
for (i = 0; i < practice_len; i++) {
	var fixation_block = {
		type: 'poldrack-single-stim',
		stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
		is_html: true,
		choices: 'none',
		data: {
			trial_id: "fixation"
		},
		timing_response: 500,
		timing_post_trial: 0,
		prompt: prompt_text,
		on_finish: function() {
			jsPsych.data.addDataToLastTrial({'exp_stage': exp_stage})
		},
	}
	
	var stop_signal_block = {
		type: 'stop-signal',
		stimulus: getStim,
		data: {
			trial_id: "practice_with_stop"
		},
		SS_stimulus: '<div class = "stopbox">'+center_prefix+path+'stopSignal.png'+postfix+'</div>',
		SS_trial_type: getSSPractice_trial_type,
		is_html: true,
		choices: choices,
		key_answer: getResponse,
		data: getData,
		timing_response: 2000,
		timing_post_trial: 0,
		SSD: SSD,
		timing_SS: 500,
		prompt: prompt_text,
		on_finish: function() {
			jsPsych.data.addDataToLastTrial({
				exp_stage: currData.exp_stage,
				trial_num: currData.trial_num,
				correct_response: currData.correct_response
			})
			
		}
	}
	var categorize_block = {
		type: 'poldrack-single-stim',
		data: {
			trial_id: "practice-stop-feedback"
		},
		choices: 'none',
		stimulus: getCategorizeFeedback,
		timing_post_trial: 0,
		is_html: true,
		timing_stim: 500,
		timing_response: 500,
		response_ends_trial: false

	  };
	  
	  var practice_mask_block = {
		type: 'poldrack-single-stim',
		stimulus: '<div class = "leftbox">'+mask_prefix+path+'mask.png'+postfix+'</div>' +
			'<div class = "rightbox">'+mask_prefix+path+'mask.png'+postfix+'</div>',
		is_html: true,
		choices: 'none',
		data: {
			trial_id: "mask"
		},
		timing_response: 400,
		timing_post_trial: 0, //was 500, but changing to 0 
		prompt: prompt_text,
		on_finish: function() {
			jsPsych.data.addDataToLastTrial({'exp_stage': exp_stage})
		},
	}
	practice_trials.push(fixation_block)
	practice_trials.push(stop_signal_block)
	practice_trials.push(categorize_block)
	practice_trials.push(mask_block)
	
}

var practice_node = {
	timeline: practice_trials,
	loop_function: function(data) {
		practice_repetitions += 1
		var rt_array = [];
		var sum_correct = 0;
		var go_length = 0;
		var num_responses = 0;
		var stop_length = 0
    	var successful_stops = 0
    	for (var i = 0; i < data.length; i++) {
      	if (data[i].trial_id == 'stim') {
       	 if (data[i].SS_trial_type == "go") {
          	if (data[i].rt != -1) {
           	 num_responses += 1
           	 rt_array.push(data[i].rt);
			 if (data[i].key_press === data[i].correct_response) {
				sum_correct += 1
			}
        }
       	 go_length += 1
     	 } else if (data[i].SS_trial_type == "stop") {
    		stop_length += 1
        	if (data[i].rt == -1) {
          		successful_stops += 1
        	}
      	}
		}
	}
    var average_rt = -1
    if (rt_array.length !== 0){
      average_rt = math.median(rt_array);

    }
    var GoCorrect_percent = sum_correct / go_length;
    var missed_responses = (go_length - num_responses) / go_length
    var StopCorrect_percent = successful_stops / stop_length
    practice_feedback_text = "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy for non-star trials: " + Math.round(GoCorrect_percent * 100)+ "%</strong>" 
    if ((average_rt < RT_thresh && GoCorrect_percent > accuracy_thresh && missed_responses <
      missed_response_thresh && StopCorrect_percent > 0.2 && StopCorrect_percent < 0.8) || practice_repetitions > practice_repetition_thresh) {
    // end the loop
	trial_types = jsPsych.randomization.repeat(['SSS', 'SDD', 'SNN', 'DSD', 'DDD', 'DDS', 'DNN'],practice_len/7)
	current_trial = 0
    practice_feedback_text +=
      '</p><p class = block-text>Done with practice. We will now begin the ' + numblocks +
      ' test blocks. There will be a break after each block. Press <strong>enter</strong> to continue.'
    return false;
  } else {
	//rerandomize stim and stop_trial order
	trial_types = jsPsych.randomization.repeat(['SSS', 'SDD', 'SNN', 'DSD', 'DDD', 'DDS', 'DNN'],practice_len/7)
    practice_stop_trials = jsPsych.randomization.repeat(['stop', 'stop', 'stop', 'go', 'go', 'go',
	'go', 'go', 'go', 'go'], practice_len / 10)
    // keep going until they are faster!
    practice_feedback_text += '</p><p class = block-text>We will try another practice block. '
    if (average_rt > RT_thresh) {
      practice_feedback_text +=
        '</p><p class = block-text>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.'
    }
    if (missed_responses >= missed_response_thresh) {
      practice_feedback_text +=
        '</p><p class = block-text><strong>We have detected a number of trials that required a response, where no response was made.  Please ensure that you are responding to each shape, unless a star appears.</strong>'
    }
    if (GoCorrect_percent <= accuracy_thresh) {
      practice_feedback_text +=
        '</p><p class = block-text>Your accuracy is too low. Remember, ' + prompt_text_list 
    }
    if (StopCorrect_percent < 0.8) {
      practice_feedback_text +=
      '</p><p class = block-text><strong>Remember to try and withhold your response when you see a stop signal.</strong>'  
    } else if (StopCorrect_percent > 0.2) {
      practice_feedback_text +=
      '</p><p class = block-text><strong>Remember, do not slow your responses to the shapes to see if a star will appear before you respond.  Please respond to the shapes as quickly and as accurately as possible.</strong>'
    }
    practice_feedback_text += '</p><p class = block-text>Press <strong>Enter</strong> to continue'
    current_trial = 0
    return true;
    }
	}
}

/* create experiment definition array */
stop_signal_with_shape_matching_experiment = []
stop_signal_with_shape_matching_experiment.push(instruction_node);
stop_signal_with_shape_matching_experiment.push(practice1);
stop_signal_with_shape_matching_experiment.push(practice2);
//stop_signal_with_shape_matching_experiment.push(NoSS_practice_node)
stop_signal_with_shape_matching_experiment.push(practice_node)
stop_signal_with_shape_matching_experiment.push(practice_feedback_block)
stop_signal_with_shape_matching_experiment.push(start_test_block)


stop_signal_with_shape_matching_experiment.push(start_test_block)
	for (var b = 0; b < numblocks; b++) {
		var test_trial_block = []

		for (i = 0; i < (exp_len/numblocks); i++) {
			test_trial_block.push(fixation_block)
			var decision_block = {
				type: 'stop-signal',
				stimulus: getStim,
				SS_stimulus: '<div class = "stopbox">'+center_prefix+path+'stopSignal.png'+postfix+'</div>',
				SS_trial_type: getSStrial_type,
				is_html: true,
				key_answer: getResponse,
				choices: choices,
				timing_response: 2000,
				data: getData,
				SSD: getSSD,
				timing_SS: 500,
				timing_post_trial: 0,
					on_finish: function(data) {
						correct = false
						if (data.SS_trial_type == "go") {
							if (data.key_press == data.correct_response) {
								correct = true
							} 
						} else if (data.SS_trial_type == "stop") {
							if (data.key_press == -1) {
								correct = true
							}
						}
						jsPsych.data.addDataToLastTrial({correct: correct,
														 correct_response: currData.correct_response})
						
						updateSSD(data)
						test_block_data.push(data)
						//current_trial += 1
					
				}
			
			}
			test_trial_block.push(decision_block)
			test_trial_block.push(mask_block)
		}
		stop_signal_with_shape_matching_experiment = stop_signal_with_shape_matching_experiment.concat(test_trial_block)
		stop_signal_with_shape_matching_experiment.push(rest_block)
	}



stop_signal_with_shape_matching_experiment.push(post_task_block)
stop_signal_with_shape_matching_experiment.push(end_block)