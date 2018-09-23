/* ************************************ */
/* Define helper functions */
/* ************************************ */
function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
		var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
		var checks_passed = 0
		for (var i = 0; i < attention_check_trials.length; i++) {
			if (attention_check_trials[i].correct === true) {
				checks_passed += 1
			}
		}
		check_percent = checks_passed / attention_check_trials.length
	}
	return check_percent
}

function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. 
	 */
	var experiment_data = jsPsych.data.getTrialsOfType('stop-signal');
	var missed_count = 0;
	var trial_count = 0;
	var rt_array = [];
	var rt = 0;
	var avg_rt = -1;
	//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	for (var k = 0; k < choices.length; k++) {
		choice_counts[choices[k]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
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
	//calculate average rt
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} else {
		avg_rt = -1
	}
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	credit_var = (avg_rt > 200) && responses_ok
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
}

var randomDraw = function(lst) {
	var index = Math.floor(Math.random() * (lst.length))
	return lst[index]
}

var getPracticeFeedback = function() {
	return '<div class = centerbox><p class = block-text>' + practice_feedback_text + '</p></div>'
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

/* After each test block let the subject know their average RT and accuracy. If they succeed or fail on too many stop signal trials, give them a reminder */
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
			'</p><p class = block-text>You have been responding too slowly, please respond to each letter set as quickly and as accurately as possible.'
	}
	if (missed_responses >= missed_response_thresh) {
		test_feedback_text +=
			'</p><p class = block-text><strong>We have detected a number of trials that required a response, where no response was made.  Please ensure that you are responding to each set of letters, unless a star appears.</strong>'
	}
	if (GoCorrect_percent < accuracy_thresh) {
		test_feedback_text += '</p><p class = block-text>Your accuracy is too low. Remember, ' + prompt_text_list
	}
	if (StopCorrect_percent < (0.5-stop_thresh) || stopAverage < 0.45){
			 	test_feedback_text +=
			 		'</p><p class = block-text><strong>Remember to try and withhold your response when you see a stop signal.</strong>'	
	} else if (StopCorrect_percent > (0.5+stop_thresh) || stopAverage > 0.55){
	 	test_feedback_text +=
	 		'</p><p class = block-text><strong>Remember, do not slow your responses to the the letters to see if a star will appear before you respond.  Please respond to each letter set as quickly and as accurately as possible.</strong>'
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

/* These methods allow NoSSPractice and SSPractice to be randomized for each iteration
of the "while" loop */
var getNoSSPracticeStim = function() {
	practice_trial_data = NoSS_practice_list.data.pop()
	practice_trial_data.condition = "NoSS_practice"
	return NoSS_practice_list.stimulus.pop()
}

var getNoSSPracticeData = function() {
	return practice_trial_data
}

var getNoSSPracticeKey = function() {
	return practice_trial_data.correct_response
}

var getSSPracticeStim = function() {
	practice_trial_data = practice_list.data.pop()
	practice_trial_data.condition = "practice"
	return practice_list.stimulus.pop()
}

var getSSPracticeData = function() {
	return practice_trial_data
}

var getSSPractice_trial_type = function() {
	return practice_stop_trials.pop()
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}


/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true

// task specific variables
// Define and load images
var prefix = '/static/experiments/stop_signal_with_flanker/images/'
var images = [prefix + 'fffff.png', prefix + 'hhfhh.png', prefix + 'hhhhh.png', prefix +
	'ffhff.png'
]
jsPsych.pluginAPI.preloadImages(images);
/* Stop signal delay in ms */
var SSD = 250
var stop_signal_with_flanker =
	'<div class = stopbox><div class = centered-shape id = stop-signal></div><div class = centered-shape id = stop-signal-inner></div></div>'

/* Instruction Prompt */
var possible_responses = [
	["F Key", 70],
	["H key", 72]
]
var choices = [possible_responses[0][1], possible_responses[1][1]]
var correct_responses =  [possible_responses[0], possible_responses[0],
	possible_responses[1], possible_responses[1]
]

var tab = '&nbsp&nbsp&nbsp&nbsp'

var prompt_text_list = '<ul list-text>'+
				  	   	'<li>Indicate the identity of the center letter!</li>'+
				  		'<li>Ignore the letters that are not in the center</li>'+
				  		'<li>Press H key when center letter is H</li>'+
				  		'<li>Press F key when center letter is F</li>'+
				  		'<li>Do not respond if you see a star!</li>'+
				  	   '</ul>'


var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Indicate the identity of the center letter! </p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Ignore the letters that are not in the center</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Press H key when center letter is H</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Press F key when center letter is F</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Do not respond if you see a star!</p>' +
				  '</div>'

/* Global task variables */
var current_trial = 0
var rtMedians = []
var stopAccMeans =[]	
var RT_thresh = 1000
var rt_diff_thresh = 75
var missed_response_thresh = 0.1
var accuracy_thresh = 0.8
var stop_thresh = 0.2
var practice_repetitions = 1
var practice_repetition_thresh = 5
var test_block_data = [] // records the data in the current block to calculate feedback
var NoSSpractice_block_len = 12
var practice_block_len = 20
var test_block_len = 50
var numconditions = 2
var numblocks = 6

/* Define stims */
var stimulus = [{
	stimulus: '<div class = shapebox><div class = flanker-text>fffff</div></div>',
	data: {
		correct_response: correct_responses[0][1],
		condition: 'compatible',
		trial_id: 'stim',
	}
}, {
	stimulus: '<div class = shapebox><div class = flanker-text>hhfhh</div></div>',
	data: {
		correct_response: correct_responses[1][1],
		condition: 'incompatible',
		trial_id: 'stim',
	}
}, {
	stimulus: '<div class = shapebox><div class = flanker-text>hhhhh</div></div>',
	data: {
		correct_response: correct_responses[2][1],
		condition: 'compatible',
		trial_id: 'stim',
	}
}, {
	stimulus: '<div class = shapebox><div class = flanker-text>ffhff</div></div>',
	data: {
		correct_response: correct_responses[3][1],
		condition: 'incompatible',
		trial_id: 'stim',
	}
}]


var practice_trial_data = '' //global variable to track randomized practice trial data
var NoSS_practice_list = jsPsych.randomization.repeat(stimulus, NoSSpractice_block_len / 4, true)
var practice_list = jsPsych.randomization.repeat(stimulus, practice_block_len / 4, true)
var practice_stop_trials = jsPsych.randomization.repeat(['stop', 'stop', 'stop', 'go', 'go', 'go',
	'go', 'go', 'go', 'go'
], practice_list.data.length / 10)

//setup blocks per condition
var condition_blocks = []
for (j = 0; j < numconditions; j++) {
	blocks = []
	for (i = 0; i < numblocks; i++) {
		blocks.push(jsPsych.randomization.repeat(stimulus, test_block_len / 4, true))
	}
	condition_blocks.push(blocks)
}

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
	type: 'attention-check',
	timing_response: 180000,
	response_ends_trial: true,
	timing_post_trial: 200
}

var attention_node = {
	timeline: [attention_check_block],
	conditional_function: function() {
		return run_attention_checks
	}
}

var practice1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = instructBox>'+
					'<p class = block-text style="font-size:22px; line-height:100%;">This is what the first part of the trial will look like.  You will see a row of letters, with the letters H and F.</p>'+
					'<p class = block-text style="font-size:22px; line-height:100%;">Please indicate the identity of the center letter!  In this case, it is H. Press the H key when the center letter is H, and the F key when the center letter is F.</p>'+
					'<p class = block-text style="font-size:22px; line-height:100%;">Ignore the letters that are not in the center!  In this case, ignore the letter F for this trial.</p>'+
					'<p class = block-text style="font-size:22px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = shapebox><div class = flanker-text>ffhff</div></div>' +
				
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
					'<p class = block-text style="font-size:22px; line-height:100%;">This is what the second part of the trial may look like.  On this trial, a star appeared around the row of letters.</p>'+
					'<p class = block-text style="font-size:22px; line-height:100%;">If a star appears, please try your best <strong>not to respond</strong> on that trial.</p>'+
					'<p class = block-text style="font-size:22px; line-height:100%;">Do not slow down your responses in order to wait for the star.  Continue to respond as quickly and as accurately as possible and try your best not to respond, if a star appears.</p>'+
					'<p class = block-text style="font-size:22px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = shapebox><div class = flanker-text>ffhff</div></div>'+
				stop_signal_with_flanker+
				
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

/* define static blocks  */
var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
    	exp_id: 'stop_signal_with_flanker'
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: assessPerformance
};

var feedback_instruct_text =
	'Welcome to the experiment. This experiment will take about 30 minutes. Press <strong>enter</strong> to begin.'
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
		'<div class = centerbox>' + 
			"<p class = block-text>In this task you will see five letters on the screen composed of f's and h's, on every trial. </p>"+
			
			"<p class = block-text>For instance, you might see 'fffff' or 'hhfhh'. </p>"+
			
			"<p class = block-text>Your task is to respond by pressing the key corresponding to the <strong>middle</strong> letter. </p>"+
			
			"<p class = block-text>So if you see 'ffhff' you would press the 'h' key.</p>"+
		'</div>',
		
		'<div class = centerbox>' + 
			'<p class = block-text>On some trials, a star will appear around the letters.  The star will appear with, or shortly after the letters appears.</p>'+
			
			'<p class = block-text>If you see a star appear, please try your best to make no response on that trial.</p>'+
		
			'<p class = block-text>Please do not slow down your responses in order to wait for the star.  Continue to respond as quickly and accurately as possible.</p>'+
								
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

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
		exp_stage: "test"
	},
	timing_post_trial: 0,
	timing_response: 500
}

var prompt_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = shapebox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
		exp_stage: "practice"
	},
	timing_post_trial: 0,
	timing_response: 500,
	prompt: prompt_text
}

/* Initialize 'feedback text' and set up feedback blocks */
var practice_feedback_text = ''
var practice_feedback_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "feedback",
		exp_stage: "practice"
	},
	timing_response: 180000,
	cont_key: [13],
	text: getPracticeFeedback
};

var test_feedback_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "feedback",
		exp_stage: "test"
	},
	timing_response: 180000,
	cont_key: [13],
	text: getTestFeedback,
	on_finish: function() {
		test_block_data = []
	}
};

/* reset SSD block */
var reset_block = {
	type: 'call-function',
	data: {
		trial_id: "reset"
	},
	func: function() {
		resetSSD()
		current_trial = 0
	},
	timing_post_trial: 0
}

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "start_test_block"
	},
	timing_response: 180000,
	text: '<div class = centerbox>'+
			'<p class = block-text>We will now start the test portion.</p>'+
			
			'<p class = block-text>You will see a row of letters comprised of the letters H and F.</p>'+
			
			'<p class = block-text>Please indicate the identity of the center letter!</p>'+
		
			'<p class = block-text>Press the H key if the center letter is an H, and the F key if the center letter is an F.</p>'+
			
			'<p class = block-text>If you see a star appear, please try your best to <strong>make no response</strong> on that trial.</p>'+
		
			'<p class = block-text>Please do not slow down your responses in order to wait for the star.  Continue to respond as quickly and accurately as possible.</p>'+
				
			'<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>'+ 
		 '</div>',
	cont_key: [13],
	timing_post_trial: 1000
};

/* ************************************ */
/* Set up experiment */
/* ************************************ */

var stop_signal_with_flanker_experiment = []
stop_signal_with_flanker_experiment.push(instruction_node);
stop_signal_with_flanker_experiment.push(practice1);
stop_signal_with_flanker_experiment.push(practice2);

/* Practice block w/o SS */
NoSS_practice_trials = []
NoSS_practice_trials.push(practice_feedback_block)
for (i = 0; i < NoSSpractice_block_len; i++) {
	NoSS_practice_trials.push(prompt_fixation_block)
	var stim_block = {
		type: 'poldrack-categorize',
		stimulus: getNoSSPracticeStim,
		data: getNoSSPracticeData,
		key_answer: getNoSSPracticeKey,
		correct_text: '<div class = fb_box><div class = center-text><font size =20>Correct!</font></div></div>',
		incorrect_text: '<div class = fb_box><div class = center-text><font size =20>Incorrect!</font></div></div>',
		timeout_message: '<div class = fb_box><div class = center-text><font size =20>Respond Faster!</font></div></div>',
		is_html: true,
		choices: choices,
		timing_post_trial: 0,
		timing_stim: 850,
		timing_response: 1850,
		timing_feedback_duration: 750,
		show_stim_with_feedback: false,
		//prompt: prompt_text,
		on_finish: function() {
			jsPsych.data.addDataToLastTrial({
				exp_stage: 'NoSS_practice',
				trial_num: current_trial
			})
			current_trial += 1
		}
	}
	NoSS_practice_trials.push(stim_block)
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
					if (data[i].key_press == data[i].correct_response) {
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
		var GoCorrect_percent = sum_correct / go_length;
		var missed_responses = (go_length - num_responses) / go_length
		practice_feedback_text = "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy for non-star trials: " + Math.round(GoCorrect_percent * 100)+ "%</strong>" 
		if ((average_rt < RT_thresh && GoCorrect_percent > accuracy_thresh && missed_responses <
				missed_response_thresh) || practice_repetitions > practice_repetition_thresh) {
			// end the loop
			current_trial = 0
			practice_repetitions = 1
			practice_feedback_text +=
				'</p><p class = block-text>For the rest of the experiment, on some proportion of trials a black "stop signal" in the shape of a star will appear around the string of letters. When this happens please try your best to stop your response and press nothing on that trial.</p><p class = block-text>The star will appear around the same time or shortly after the letters appear. Because of this, you will not always be able to successfully stop when a star appears. However, if you continue to try very hard to stop when a star appears, you will be able to stop sometimes but not always.</p><p class = block-text><strong>Please balance the requirement to respond quickly and accurately to the letters while trying very hard to stop to the stop signal.</strong></p><p class = block-text>Press <strong>Enter</strong> to continue'
			return false;
		} else {
			//rerandomize stim order
			NoSS_practice_list = jsPsych.randomization.repeat(stimulus, 3, true)
			// keep going until they are faster!
			practice_feedback_text += '</p><p class = block-text>We will try another practice block. '
			if (average_rt > RT_thresh) {
				practice_feedback_text +=
					'</p><p class = block-text>You have been responding too slowly, please respond to each string as quickly and as accurately as possible.'
			}
			if (missed_responses >= missed_response_thresh) {
				practice_feedback_text +=
					'</p><p class = block-text><strong>We have detected a number of trials that required a response, where no response was made.  Please ensure that you are responding to each string.</strong>'
			}
			if (GoCorrect_percent <= accuracy_thresh) {
				practice_feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.'
			}
			practice_feedback_text += '</p><p class = block-text>Press <strong>Enter</strong> to continue'
			return true;
		}
	}
}

/* Practice block with SS */

var practice_trials = []
//practice_trials.push(practice_feedback_block)
for (i = 0; i < practice_block_len; i++) {
	practice_trials.push(prompt_fixation_block)
	var stop_signal_with_flanker_block = {
		type: 'stop-signal',
		stimulus: getSSPracticeStim,
		SS_stimulus: stop_signal_with_flanker,
		SS_trial_type: getSSPractice_trial_type,
		data: getSSPracticeData,
		is_html: true,
		choices: choices,
		timing_stim: 850,
		timing_response: 1850,
		SSD: SSD,
		timing_SS: 500,
		timing_post_trial: 0,
		prompt: prompt_text,
		on_finish: function(data) {
			jsPsych.data.addDataToLastTrial({
				exp_stage: 'practice',
				trial_num: current_trial
			})
			current_trial += 1
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
		response_ends_trial: false, 
		on_finish: function(){
			console.log('here3');
		}

	};
	practice_trials.push(stop_signal_with_flanker_block)
	practice_trials.push(categorize_block)
}


/* Practice node continues repeating until the subject reaches certain criteria */
var practice_node = {
	timeline: practice_trials,
	/* This function defines stopping criteria */
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
						if (data[i].key_press == data[i].correct_response) {
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
		if (rt_array.length !== 0) {
			average_rt = math.median(rt_array);
		}
		var GoCorrect_percent = sum_correct / go_length;
		var missed_responses = (go_length - num_responses) / go_length
		var StopCorrect_percent = successful_stops / stop_length
		practice_feedback_text = "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy for non-star trials: " + Math.round(GoCorrect_percent * 100)+ "%</strong>" 
		if ((average_rt < RT_thresh && GoCorrect_percent > accuracy_thresh && missed_responses <
				missed_response_thresh && StopCorrect_percent > 0.2 && StopCorrect_percent < 0.8) || practice_repetitions >
			practice_repetition_thresh) {
			// end the loop
		    current_trial = 0
			practice_feedback_text +=
				'</p><p class = block-text>Done with practice. We will now begin the ' + numconditions *
				numblocks +
				' test blocks. There will be a break after each block. Press <strong>enter</strong> to continue.'
			return false;
		} else {
			//rerandomize stim and stop_trial order
			practice_list = jsPsych.randomization.repeat(stimulus, practice_block_len/4, true)
			practice_stop_trials = jsPsych.randomization.repeat(['stop', 'stop', 'stop', 'go', 'go', 'go', 'go', 'go', 'go', 'go'], practice_list.data.length / 10, false)
				// keep going until they are faster!
			practice_feedback_text += '</p><p class = block-text>We will try another practice block. '

			if (average_rt > RT_thresh) {
				practice_feedback_text +=
					'</p><p class = block-text>You have been responding too slowly, please respond to each string as quickly and as accurately as possible.'
			}

			if (missed_responses >= missed_response_thresh) {
				practice_feedback_text +=
					'</p><p class = block-text><strong>We have detected a number of trials that required a response, where no response was made.  Please ensure that you are responding to each string of letters, unless a star appears.</strong>'
			}

			if (GoCorrect_percent <= accuracy_thresh) {
				practice_feedback_text +=
					'</p><p class = block-text>Your accuracy is too low. Remember, '+ prompt_text_list
			}
			if (StopCorrect_percent < 0.8){
			 	practice_feedback_text +=
			 		'</p><p class = block-text><strong>Remember to try and withhold your response when you see a stop signal.</strong>'	
			} else if (StopCorrect_percent > 0.2){
			 	practice_feedback_text +=
			 		'</p><p class = block-text><strong>Remember, do not slow your responses to the letters to see if a star will appear before you respond.  Please respond to each string as quickly and as accurately as possible.</strong>'
			}
			practice_feedback_text += '</p><p class = block-text>Press <strong>Enter</strong> to continue'
			return true;
		}
	}
}

//stop_signal_with_flanker_experiment.push(NoSS_practice_node)
stop_signal_with_flanker_experiment.push(practice_node)
stop_signal_with_flanker_experiment.push(practice_feedback_block)
stop_signal_with_flanker_experiment.push(start_test_block)


/* Test blocks */
// Loop through the two conditions
for (c = 0; c < numconditions; c++) {
	var blocks = condition_blocks[c]
		// Loop through the multiple blocks within each condition
	for (b = 0; b < numblocks; b++) {
		stop_signal_with_flanker_exp_block = []
		var block = blocks[b]
		var stop_trials = jsPsych.randomization.repeat(['stop', 'stop', 'stop', 'go', 'go', 'go', 'go', 'go', 'go', 'go'], test_block_len/ 10)
		// Loop through each trial within the block
		for (i = 0; i < test_block_len; i++) {
			stop_signal_with_flanker_exp_block.push(fixation_block)
			var trial_data = jQuery.extend(true, {}, block.data[i])
			trial_data.exp_stage = 'test'
			var stop_signal_with_flanker_block = {
				type: 'stop-signal',
				stimulus: block.stimulus[i],
				SS_stimulus: stop_signal_with_flanker,
				SS_trial_type: stop_trials[i],
				data: trial_data,
				is_html: true,
				choices: choices,
				timing_stim: 850,
				timing_response: 1850,
				SSD: getSSD,
				timing_SS: 500,
				timing_post_trial: 0,
				on_finish: function(data) {
					updateSSD(data)
					jsPsych.data.addDataToLastTrial({
						exp_stage: 'test',
						trial_num: current_trial
					})
					current_trial += 1
					test_block_data.push(data)
				}
			}
			stop_signal_with_flanker_exp_block.push(stop_signal_with_flanker_block)
		}

		stop_signal_with_flanker_experiment = stop_signal_with_flanker_experiment.concat(stop_signal_with_flanker_exp_block)
		if ($.inArray(b + c, [0, 4]) != -1) {
			stop_signal_with_flanker_experiment.push(attention_node)
		}
		stop_signal_with_flanker_experiment.push(test_feedback_block)
	}
	stop_signal_with_flanker_experiment.push(reset_block)
}
stop_signal_with_flanker_experiment.push(post_task_block)
stop_signal_with_flanker_experiment.push(end_block)