	
/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */
function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'zero_ssd_half_tracking', subject_ID: subject_ID})
}

var getFeedback = function() {
	return '<div class = centerbox><p class = block-text>' + feedback_text + '</p></div>'
}

var testPhaseReady = function(){
	feedback_text = 'We will now start with a test session. In this test, concentrate on responding quickly and accurately to each stimuli unless it requires no response.</p><p class = block-text>Press enter to continue.'
	a = createTrialTypes(test_length)	
	currTrial = 0
}

var createTrialTypes = function(numIter){
	var stims = []
	for (var x = 0; x < numIter/12; x++){
		for (var i = 0; i < 12; i++){
			if (i < 6){
				if (i%2 == 0){
					if(i%3 == 0){
						obj = {
						'stim_color': color,
						'shape' : shape1,
						'trial': 'track-1',
						'correct_response': possible_responses[0][1],
						'stop_trial': 'stop',
						}
					}else{
						obj = {
						'stim_color': color,
						'shape' : shape1,
						'trial': 'track-1',
						'correct_response': possible_responses[0][1],
						'stop_trial': 'go'
						}
					}
					
			 	}else {
			 		if(i%3 == 0){
			 			obj = {
			 			'stim_color': color,
						'shape': shape2,
						'trial': 'track-2',
						'correct_response': possible_responses[0][1],
						'stop_trial': 'stop',
						}
					}else{
						obj = {
			 			'stim_color': color,
						'shape': shape2,
						'trial': 'track-2',
						'correct_response': possible_responses[0][1],
						'stop_trial': 'go',
						}
					}		
				}
			}else {
				if (i%2 == 0){
					if(i%3 == 0){
					
						obj = {
						'stim_color': color,
						'shape' : shape3,
						'trial': 'zero-1',
						'correct_response': possible_responses[1][1],
						'stop_trial': 'stop',
						}
					}else{
						obj = {
						'stim_color': color,
						'shape' : shape3,
						'trial': 'zero-1',
						'correct_response': possible_responses[1][1],
						'stop_trial': 'go',
						}
					}
					
			 	} else {
			 		if(i%3 == 0){
			 			obj = {
			 			'stim_color': color,
						'shape': shape4,
						'trial': 'zero-2',
						'correct_response': possible_responses[1][1],
						'stop_trial': 'stop'
						}
					}else{
						obj = {
			 			'stim_color': color,
						'shape': shape4,
						'trial': 'zero-2',
						'correct_response': possible_responses[1][1],
						'stop_trial': 'go'
						}
					}
					
				}
			}
		stims.push(obj)
		}	
	}			
a = jsPsych.randomization.repeat(stims,1,true);
return a
}		

var getStim = function(){
	shape = a.shape.pop()
	color = a.stim_color.pop()
	trial_type = a.trial.pop()
	correct_response = a.correct_response.pop()
	stop_type = a.stop_trial.pop()
	stim = {
		image: preFileType + pathSource + color + '_' + shape + fileType + postFileType,
		data: { 
			exp_id: 'zero_ssd_half_tracking',
			stim: color + '_' + shape,
			trial_type: trial_type,
			correct_response: correct_response,
			stop_type: stop_type,
			}
	}
	
	stimData = stim.data
	jsPsych.data.addDataToLastTrial({trial_type: stimData.trial_type})
	return stim.image
}

var getStopStim = function(){
	return preFileType + pathSource + 'black_stopSignal' + fileType + postFileType
}

var getTrialType = function(){
	return stimData.stop_type
}

var getSSD = function(){
	if ((trial_type == 'track-1') || (trial_type == 'track-2')){
		return SSD
	}else if ((trial_type == 'zero-1') || (trial_type == 'zero-2')){
		return 0
	}
}


var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	testPhase = jsPsych.data.getDataByTrialIndex(curr_trial).exp_stage

	if (testPhase == "practice"){
		currBlock = practiceCount
	} else if (testPhase == "test"){
		currBlock = testCount
	}
	
	jsPsych.data.addDataToLastTrial({
		stim: stimData.stim,
		correct_response: stimData.correct_response,	
		current_trial: currTrial,
		current_block: currBlock,
		stop_trial: stimData.stop_type,
	})
	currTrial += 1
	
	if (testPhase == "test"){	
		jsPsych.data.addDataToLastTrial({
								regSSD: SSD,
								zeroSSD: 0,
								})
		curr_trial = jsPsych.progress().current_trial_global
		if((jsPsych.data.getDataByTrialIndex(curr_trial).rt == -1) && (SSD<850) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'stop') && ((jsPsych.data.getDataByTrialIndex(curr_trial).trial_type == 'track-1') || (jsPsych.data.getDataByTrialIndex(curr_trial).trial_type == 'track-2'))){
			SSD = SSD + 50
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).rt != -1) && (SSD>0) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'stop')  && ((jsPsych.data.getDataByTrialIndex(curr_trial).trial_type == 'track-1') || (jsPsych.data.getDataByTrialIndex(curr_trial).trial_type == 'track-2'))){
			SSD = SSD - 50
		}
	
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'go')){
			jsPsych.data.addDataToLastTrial({go_acc: 1})
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'go')){
			jsPsych.data.addDataToLastTrial({go_acc: 0})
		}
	
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'stop')){
			jsPsych.data.addDataToLastTrial({stop_acc: 1})
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'stop')){
			jsPsych.data.addDataToLastTrial({stop_acc: 0})
		}
	}
}


/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
var subject_ID = 469
var practice_length = 24
var test_length = 48
var rt_thresh = 1000;
var missed_response_thresh = 0.15;
var accuracy_thresh = 0.80;
var SSD = 250;

var shapes = jsPsych.randomization.repeat(['circle','rhombus','pentagon','triangle'],1)
var color = 'black'
var trial_type = ""


var shape1 = shapes[0] // correct response = z
var shape2 = shapes[1] // correct response = z
var shape3 = shapes[2] // correct response = m
var shape4 = shapes[3] // correct response = m

var conditions = ['track-1','track-2','track-3','track-4']
var possible_responses = [
	['Z key', 90],
	['M key' , 77]
]



var postFileType = "'></img>"
var pathSource = "/static/experiments/zero_ssd_half_tracking/images/"
var fileType = ".png"
var preFileType = "<img class = center src='"


var shapesPreload = jsPsych.randomization.repeat(shapes,1)
var images = []
for(i=0;i<shapesPreload.length;i++){
	images.push(pathSource + 'black' + '_' + shapesPreload[i] + '.png')
}
jsPsych.pluginAPI.preloadImages(images);



var prompt_text = '<ul list-text><li>' + shapes[0] + ': ' + possible_responses[0][0] +
	'</li><li>' + shapes[1] + ': ' + possible_responses[0][0] + '</li><li>' + shapes[2] + ': ' +
	possible_responses[1][0] + '</li><li>' + shapes[3] + ': ' + possible_responses[1][0] +
	'</li></ul>'



var a = "";
a = createTrialTypes(practice_length);
var currTrial = 0;



/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end"
	},
	timing_response: -1,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press<strong> enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var welcome_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "welcome"
	},
	timing_response: -1,
	text: '<div class = centerbox><p class = center-block-text>Welcome to the task!</p><p class = center-block-text>Press<strong> enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var prompt_ITI_block = {
	type: 'poldrack-single-stim',
	stimulus: "<div></div>",
	is_html: true,
	data: {
		exp_id: "zero_ssd_half_tracking",
		"trial_id": "ITI",
		"exp_stage": "practice",
	},
	choices: [32],
	timing_stim: 1400,
	timing_response: 1400,
	timing_post_trial: 0,
	response_ends_trial: false,
	prompt: prompt_text
}
	
var ITI_block = {
	type: 'poldrack-single-stim',
	stimulus: "<div></div>",
	is_html: true,
	data: {
		exp_id: "zero_ssd_half_tracking",
		"trial_id": "ITI",
		"exp_stage": "test",
	},
	choices: [32],
	timing_stim: 1400,
	timing_response: 1400,
	timing_post_trial: 0,
	response_ends_trial: false
}

var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages:[
		'<div class = centerbox><p class = block-text>In this task you will see shapes appear on the screen one at a time. </p></div>',
		'<div class = centerbox><p class = block-text>Only one response is correct for each shape. The correct responses are as follows:' +
		prompt_text +
		'<p class = block-text>These instructions will remain on the screen during practice, but will be removed during the test phase.</p><p class = block-text>You should respond as quickly and accurately as possible to each shape, unless it does not require a response.</p></div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};

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
	timing_stim: 500,
	timing_response: 500
};

var prompt_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "prompt_fixation",
		exp_stage: "practice"
	},
	timing_post_trial: 0,
	timing_stim: 500,
	timing_response: 500,
	prompt: prompt_text
};
var practice_intro = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><p class = block-text>We will now start the practice for the experiment.<br><br>For these trials, you must press the <strong>'+possible_responses[0][0]+' </strong> or have <strong>'+possible_responses[1][0]+'</strong> depending on the shape of the stimulus.  Make sure to respond as quickly and accurately as possible to the shape. <br><br> The responses for each shape are as follows: ' +
		prompt_text +
		'</p><p class = block-text>Remember these rules before you proceed.</p><p class = block-text>Press <strong> enter</strong> to begin.</p></div>',
	is_html: true,
	choices: [13],
	data: {
		exp_id: "zero_ssd_half_tracking",
		"trial_id": "stop_intro_phase1"
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true
};


var test_intro = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><p class = block-text>We will now start the main phase of the experiment.<br><br>These trials are the same as the trials that you have just completed. <br><br>The rules for each shape are as follows:  <br>' +
		prompt_text +
		'</p><p class = block-text>Remember these rules before you proceed, as they will no longer be presented during the trial.</p><p class = block-text>Press <strong> enter</strong> to begin.</p></div>',
	is_html: true,
	choices: [13],
	data: {
		exp_id: "zero_ssd_half_tracking",
		"trial_id": "main_stop_intro_phase3"
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true,
	on_finish: testPhaseReady,
};


var feedback_text = 'We will now start with a practice session. In this practice concentrate on responding quickly and accurately to each stimuli unless it requires no response.</p><p class = block-text>Press enter to continue.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-no-stop-feedback"
	},
	choices: [13],
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true, 

};

var practiceTrials = []
practiceTrials.push(feedback_block)
for (i = 0; i < practice_length; i++) {
	practiceTrials.push(prompt_fixation_block)
	var practiceBlock = {
		type: 'poldrack-single-stim',
		stimulus: getStim,
		is_html: true,
		data: {
			exp_id: "zero_ssd_half_tracking",
			"trial_id": "stim",
			"exp_stage": "practice",
		},
		choices: [77,90],
		timing_stim: 850,
		timing_response: 850,
		on_finish: appendData,
		timing_post_trial: 0,
		response_ends_trial: false,
		prompt: prompt_text,

	}
	practiceTrials.push(practiceBlock)
	practiceTrials.push(prompt_ITI_block)

}

var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
		practiceCount = practiceCount + 1
		var sum_rt = 0;
		var sumGo_correct = 0;
		var go_length = 0;
		var num_responses = 0;
		var sumStop_correct = 0;
		var stop_length = 0
		for (i = 0; i < data.length; i++) {
			if (data[i].trial_id == "stim") {
				go_length += 1
				if (data[i].rt != -1) {
					num_responses += 1
					sum_rt += data[i].rt;
					if (data[i].key_press == data[i].correct_response) {
						sumGo_correct += 1
					}
				}
			} 
		}
		var average_rt = sum_rt / num_responses;
		var averageGo_correct = sumGo_correct / go_length;
		var missed_responses = (go_length - num_responses) / go_length
		
		console.log('total trials = ' + go_length)
		console.log('total correct = ' + sumGo_correct)
		console.log('total responded = '+ num_responses)

		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy: " + Math.round(averageGo_correct * 100)+ "%</strong>"

		if (practiceCount == 1) {
			if (averageGo_correct < accuracy_thresh) {
				feedback_text +=
					'</p><p class = block-text><strong>Your accuracy is too low. Remember, the correct responses for each shape are as follows:</strong><br><br>' +
					prompt_text
			}
			if (average_rt > rt_thresh) {
				feedback_text +=
				'</p><p class = block-text><strong>You have been responding too slowly, please respond to each shape (circle, triangle, rhombus, pentagon) as quickly and as accurately as possible.</strong>'
			}
			if (missed_responses > missed_response_thresh){
				if(averageGo_correct < accuracy_thresh){
				feedback_text +=
					'</p><p class = block-text>We have detected a number of trials that <strong>required a response</strong>, where no response was made.  Please <strong>ensure that you are quickly responding </strong>to shapes that require a response.'
				} else {
				feedback_text +=
					'</p><p class = block-text>We have detected a number of trials that <strong>required a response</strong>, where no response was made.  Please <strong>ensure that you are quickly responding </strong>to shapes that require a response.<br><br>' +
					prompt_text
				}
			}
			
			feedback_text += '</p><p class = block-text>Done with this practice.'
			return false;
		}
	}
}


var testTrials = []
testTrials.push(feedback_block)
for (i = 0; i < test_length; i++) {
	testTrials.push(fixation_block)
	var stop_signal_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getTrialType,
		data: {
			exp_id: "zero_ssd_half_tracking",
			"trial_id": "stim",
			"exp_stage": "test",
		},
		is_html: true,
		choices: [77,90],
		timing_stim: 850,
		timing_response: 1850,
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 850,
		timing_post_trial: 0,
		on_finish: appendData,
	}
	testTrials.push(stop_signal_block)
	testTrials.push(ITI_block)
}

var testCount = 0
var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
		var sum_rt = 0;
		var sumGo_correct = 0;
		var go_length = 0;
		var num_responses = 0;
		var sumStop_correct = 0;
		var stop_length = 0
		for (i = 0; i < data.length; i++) {
			if (data[i].stop_trial == "go") {
				go_length += 1
				if (data[i].rt != -1) {
					num_responses += 1
					sum_rt += data[i].rt;
					if (data[i].key_press == data[i].correct_response) {
						sumGo_correct += 1
					}
				}
			} else if (data[i].stop_trial == "stop") {
				stop_length += 1
				if (data[i].rt == -1) {
					sumStop_correct += 1
				}
			}
		}
		var average_rt = sum_rt / num_responses;
		var averageGo_correct = sumGo_correct / go_length;
		var missed_responses = (go_length - num_responses) / go_length
		var averageStop_correct = sumStop_correct / stop_length
		var stop_respond = (stop_length - sumStop_correct)/stop_length  
		
		console.log('total go = ' + go_length)
		console.log('total go correct = '+ sumGo_correct)
		console.log('total go responded = ' + num_responses)
		console.log('total stop = ' + stop_length)
		console.log('total stop correct = ' + sumStop_correct)
		
		currTrial = 0
		a = createTrialTypes(test_length)
		testCount += 1

		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy: " + Math.round(averageGo_correct * 100)+ "%</strong>"

		if (testCount == 20) {
			feedback_text += '</p><p class = block-text>Done with this test.'
			return false;
		} else {
			
			if (averageGo_correct < accuracy_thresh) {
				feedback_text +=
					'</p><p class = block-text><strong>Your accuracy is too low. Remember, the correct responses for each shape are as follows:</strong><br><br>' +
					prompt_text
			}
			if (average_rt > rt_thresh) {
				feedback_text +=
				'</p><p class = block-text><strong>You have been responding too slowly, please respond to each shape (circle, triangle, rhombus, pentagon) as quickly and as accurately as possible.</strong>'
			}
			if (missed_responses > missed_response_thresh){
				if(averageGo_correct < accuracy_thresh){
				feedback_text +=
					'</p><p class = block-text>We have detected a number of trials that <strong>required a response</strong>, where no response was made.  Please <strong>ensure that you are quickly responding </strong>to shapes that require a response.'
				} else {
				feedback_text +=
					'</p><p class = block-text>We have detected a number of trials that <strong>required a response</strong>, where no response was made.  Please <strong>ensure that you are quickly responding </strong>to shapes that require a response.<br><br>' +
					prompt_text
				}
			}
			
			if (stop_respond > 0.70){
				feedback_text +=
					'</p><p class = block-text>We have detected a number of trials that <strong>required no response</strong>, where a response was made.  Please <strong>ensure that you do not respond </strong>to shapes that require no response'
			
			}else if (stop_respond < .30){
				feedback_text +=
					'</p><p class = block-text>You have been responding too slowly, please respond to each shape (circle, triangle, rhombus, pentagon) as quickly and as accurately as possible.'
			
			}
				
			return true;
		}
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var zero_ssd_half_tracking_experiment = []

zero_ssd_half_tracking_experiment.push(welcome_block);
zero_ssd_half_tracking_experiment.push(instructions_block);
/*
zero_ssd_half_tracking_experiment.push(practice_intro);
zero_ssd_half_tracking_experiment.push(practiceNode);
zero_ssd_half_tracking_experiment.push(feedback_block);
*/
zero_ssd_half_tracking_experiment.push(test_intro);
zero_ssd_half_tracking_experiment.push(testNode);
zero_ssd_half_tracking_experiment.push(feedback_block);

zero_ssd_half_tracking_experiment.push(end_block);




