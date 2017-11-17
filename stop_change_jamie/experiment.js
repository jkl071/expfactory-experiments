	
/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */
function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'overt_response', subject_ID: subject_ID})
}

var getFeedback = function() {
	return '<div class = centerbox><p class = block-text>' + feedback_text + '</p></div>'
}

var createForcedStims = function(numShapes){
	tempCombo = []
	for (i = 0; i < numShapes - 1 ; i++) {
		for (x = i + 1; x < numShapes; x++) {
		tempCombo.push([i,x])
		tempCombo.push([x,i])
		}
	}
	
	tempCombo = jsPsych.randomization.repeat(tempCombo,1)
	return tempCombo
}



var getForcedStim = function(){
	forced_combo = forcedStims.pop()
	
	forced_left_stim = shapes[forced_combo[0]]
	forced_left_type = forced_stim_types[forced_combo[0]]
	forced_left_correct = forced_correct_responses[forced_combo[0]]

	forced_right_stim = shapes[forced_combo[1]]
	forced_right_type = forced_stim_types[forced_combo[1]]
	forced_right_correct = forced_correct_responses[forced_combo[1]]
	
		   
		   
	return [forcedChoiceType + pathSource + 'black_' + shapes[forced_combo[0]] + fileType + postFileTypeForced +
		   forcedChoiceType2 + pathSource + 'black_' + shapes[forced_combo[1]] + fileType + postFileTypeForced]

}


var createTrialTypes = function(numTrials){
	var stims = []
	var trialTypes1 = jsPsych.randomization.repeat(['go', 'stop', 'stop'],numTrials/12)
	var trialTypes2 = jsPsych.randomization.repeat(['go', 'stop', 'stop'],numTrials/12)
	var trialTypes3 = jsPsych.randomization.repeat(['go', 'go', 'go'],numTrials/12)
	var trialTypes4 = jsPsych.randomization.repeat(['go', 'go', 'go'],numTrials/12)
	for (var i = 0; i < numTrials/4; i++){
		stim1 = {
			'stim' : shapes[0],
			'stop_type' : trialTypes1.pop(),
			'possible_response' : [37,32]
		}
		stim2 = {
			'stim' : shapes[1],
			'stop_type' : trialTypes2.pop(),
			'possible_response' : [39,32]		
		}
		stim3 = {
			'stim' : shapes[2],
			'stop_type' : trialTypes3.pop(),
			'possible_response' : 37
		}
		stim4 = {
			'stim' : shapes[3],
			'stop_type' : trialTypes4.pop(),
			'possible_response' : 39
		} 
	
	stims.push(stim1)
	stims.push(stim2)
	stims.push(stim3)
	stims.push(stim4)
	}
	stims = jsPsych.randomization.repeat(stims,1,true)
	return stims
}

	

var getStim = function(){
	if(exp_phase == "practice1"){
		shape = practice_stims.stim.pop()
		stop_type = practice_stims.stop_type.pop()
		correct_response = practice_stims.possible_response.pop()
		if ((shape == shape1) || (shape == shape2)){
			correct_response = correct_response[0]
		}
		
	
	
	} else if (exp_phase == "practice2"){
	
		shape = test_stims.stim.pop()
		stop_type = test_stims.stop_type.pop()
		correct_response = test_stims.possible_response.pop()
		
	} else if (exp_phase == "test"){
	
		shape = test_stims.stim.pop()
		stop_type = test_stims.stop_type.pop()
		correct_response = test_stims.possible_response.pop()
		
	}
	
	if ((exp_phase == "practice2") || (exp_phase == "test")){
		if ((shape == shape1) || (shape == shape2)){
			if (stop_type == "stop"){
				correct_response = correct_response[1]	
			} else if (stop_type == "go"){
				correct_response = correct_response[0]
			}
		}
	}
	
	console.log("shape = " + shape)
	console.log("stop_type = " + stop_type)
	console.log("correct_response = " + correct_response)

	stim = {
		image: preFileType + pathSource + color + '_' + shape + fileType + postFileType,
		data: { 
			exp_id: 'overt_response',
			stim: color + '_' + shape,
			stop_type: stop_type,
			correct_response: correct_response,
			}
	}
	stimData = stim.data
	return stim.image
}


var getStopStim = function(){
	if(stop_type == "stop"){
		return preFileType + pathSource + 'black_stopSignal' + fileType + postFileType
	}
}

var getTrialType = function(){
	return stimData.stop_type
}

var getSSD = function(){
	return SSD
}


var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global

	if (exp_phase == "practice1"){
		
		currBlock = practiceCount
		
	} else if (exp_phase == "practice2"){
		
		currBlock = practiceStopCount
		
		jsPsych.data.addDataToLastTrial({
			stop_type: stimData.stop_type
		})
	} else if (exp_phase == "test"){
		
		currBlock = testCount
		
		jsPsych.data.addDataToLastTrial({
			stop_type: stimData.stop_type
		})
	}
	
	if ((exp_phase == "practice1") || (exp_phase == "practice2") || (exp_phase == "test")){
		jsPsych.data.addDataToLastTrial({
			stim: stimData.stim,
			correct_response: stimData.correct_response,	
			current_block: currBlock,
			exp_stage: exp_phase
		})
	}
	
	if (exp_phase == "test"){	
		if((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == 32) && (SSD<850) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'stop')){
			SSD = SSD + 50
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != 32) && (SSD>0) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'stop')){
			SSD = SSD - 50
		}
	
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'go')){
			jsPsych.data.addDataToLastTrial({go_acc: 1})
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'go')){
			jsPsych.data.addDataToLastTrial({go_acc: 0})
		}
	
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == 32) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'stop')){
			jsPsych.data.addDataToLastTrial({stop_acc: 1})
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != 32) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_type == 'stop')){
			jsPsych.data.addDataToLastTrial({stop_acc: 0})
		}
	}
	
	if (exp_phase == "forced_choice"){
		jsPsych.data.addDataToLastTrial({
			left_stim: forced_left_stim, 
			left_stim_type: forced_left_type,
			left_stim_correct_response: forced_left_correct,

			right_stim: forced_right_stim,
			right_stim_type: forced_right_type,
			right_stim_correct_response: forced_right_correct
		})
	
	}
}


/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
var subject_ID = 469
var practice_length = 12
var test_length = 60 // 840 
var numForcedTrials = 12
var numBlocks = test_length/10
var numTrialsPerBlock = test_length/numBlocks


var rt_thresh = 1000;
var missed_response_thresh = 0.15;
var accuracy_thresh = 0.80;
var SSD = 250;


var shapes = jsPsych.randomization.repeat(['circle','rhombus','pentagon','triangle'],1)
var color = 'black'


var shape1 = shapes[0] // correct response = left
var shape2 = shapes[1] // correct response = right
var shape3 = shapes[2] // correct response = left
var shape4 = shapes[3] // correct response = right


var possible_responses = [['Left Arrow', 37],['Right Arrow', 39]]


var postFileType = "'></img>"
var pathSource = "/static/experiments/overt_response/images/"
var fileType = ".png"
var preFileType = "<img class = center src='"

var forcedChoiceType = "<div class = decision-left><img src='"
var forcedChoiceType2 = "<div class = decision-right><img src='"
var postFileTypeForced = "'></img></div>"



var shapesPreload = jsPsych.randomization.repeat(shapes,1)
var images = []
for(i=0;i<shapesPreload.length;i++){
	images.push(pathSource + 'black' + '_' + shapesPreload[i] + '.png')
}
jsPsych.pluginAPI.preloadImages(images);



var prompt_text = '<ul list-text><li>' + shapes[0] + ': ' + possible_responses[0][0] +
	'</li><li>' + shapes[1] + ': ' + possible_responses[1][0] + '</li><li>' + shapes[2] + ': ' +
	possible_responses[0][0] + '</li><li>' + shapes[3] + ': ' + possible_responses[1][0] +
	'</li></ul>'



var practice_stims = createTrialTypes(practice_length)
var test_stims = createTrialTypes(test_length)


var shape = ''
var stop_type = ''
var correct_response = ''
var exp_phase = "practice1"

var forcedStims = createForcedStims(shapes.length)
var forced_stim_types = ["change","change","go","go"]
var forced_correct_responses = [37,39,37,39]

var forced_left_stim = ""
var forced_left_type = ""
var forced_left_correct = ""

var forced_right_stim = ""
var forced_right_type = ""
var forced_right_correct = ""


/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */

var end_block = {
	type: 'poldrack-text',
	data: {
		exp_id: "overt_response",
		trial_id: "end"
	},
	timing_response: -1,
	text: '<div class = centerbox>'+
	'<p class = center-textJamie>Thanks for completing this task!</p>'+
	'<p class = center-textJamie>Press<strong> enter</strong> to continue.</p>'+
	'</div>',
	cont_key: [13],
	timing_post_trial: 0
};

var welcome_block = {
	type: 'poldrack-text',
	data: {
		exp_id: "overt_response",
		trial_id: "welcome"
	},
	timing_response: -1,
	text: '<div class = centerbox>'+
	'<p class = center-textJamie>Welcome to the task!</p>'+
	'<p class = center-textJamie>Press<strong> enter</strong> to continue.</p>'+
	'</div>',
	cont_key: [13],
	timing_post_trial: 0
};


var prompt_ITI_block = {
	type: 'poldrack-single-stim',
	stimulus: "<div></div>",
	is_html: true,
	data: {
		exp_id: "overt_response",
		"trial_id": "ITI",
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
		exp_id: "overt_response",
		"trial_id": "ITI"
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
		exp_id: "overt_response",
		trial_id: "instruction"
	},
	pages:[
		'<div class = centerbox>'+
			'<p class = block-text>In this task you will see shapes appear on the screen one at a time. </p>' +
			'<p class = block-text>Only one response is correct for each shape. The correct responses are as follows:' +
			prompt_text +
			'<p class = block-text>These instructions will remain on the screen during this practice, but will be removed during the test phase.</p>'+
			'<p class = block-text>You should respond as quickly and accurately as possible to each shape.</p>'+
		'</div>'
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
		exp_id: "overt_response",
		trial_id: "fixation",
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
		exp_id: "overt_response",
		trial_id: "prompt_fixation",
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
		exp_id: "overt_response",
		"trial_id": "stop_intro_phase1"
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true
};

var practice_stop_intro = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox>'+
			  	'<p class = block-text>We will now start the second practice for the experiment.</p>'+
			  	'<p class = block-text>On some trials a star will appear around the shape.  If a star appears, please change your response from the Left or Right arrow key, to the space bar.</p>'+
				'<p class = block-text>Do not wait to see if a star will appear before you make your response.  Please continue to respond to each shape as quickly and as accurately as possible.</p>'+
				'<p class = block-text>Remember these rules before you proceed.</p>'+
				prompt_text +
				'<p class = block-text>If a star appears, the correct response on that trial is the space bar.</p>'+
			    '<p class = block-text>Press <strong> enter</strong> to begin.</p>'+
			  '</div>',
	is_html: true,
	choices: [13],
	data: {
		exp_id: "overt_response",
		"trial_id": "stop_intro_phase1"
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true,
	on_finish: function(){
	feedback_text = 'We will now start with the second practice session. In this practice concentrate on responding quickly and accurately to each stimuli.'
	}
};


var test_intro = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><p class = block-text>We will now start the main phase of the experiment.<br><br>These trials are the same as the trials that you have just completed. <br><br>The rules for each shape are as follows:  <br>' +
		prompt_text +
		'</p><p class = block-text>Remember these rules before you proceed, as they will no longer be presented during the trial.</p><p class = block-text>Press <strong> enter</strong> to begin.</p></div>',
	is_html: true,
	choices: [13],
	data: {
		exp_id: "overt_response",
		"trial_id": "main_stop_intro_phase3"
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true,
	on_finish: function(){
		feedback_text = 'We will now start the test session. Please concentrate on responding quickly and accurately to each stimuli.'
	}
};

var forced_choice_intro = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox>'+
	'<p class = block-text>We will now start the forced choice phase for the experiment.</p>'+
	'<p class = block-text>Please choose the shape that you prefer, using the left arrow key to choose the left image, and the right arrow key to choose the right image.</p>'+
	'<p class = block-text>Press <strong> enter</strong> to begin.</p>'+
	'</div>',
	is_html: true,
	choices: [13],
	data: {
		exp_id: "overt_response",
		"trial_id": "stop_intro_phase1"
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true,
	on_finish: function(){
		exp_phase = "forced_choice"
	}
};

var feedback_text = 'We will now start with a practice session. In this practice concentrate on responding quickly and accurately to each stimuli.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		exp_id: "overt_response",
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



/********************************************/
/*				Set up nodes				*/
/********************************************/

var practiceTrials = []
practiceTrials.push(feedback_block)
for (i = 0; i < practice_length; i++) {
	practiceTrials.push(prompt_fixation_block)
	var practiceBlock = {
		type: 'poldrack-single-stim',
		stimulus: getStim,
		is_html: true,
		data: {
			exp_id: "overt_response",
			"trial_id": "practice_trial",
		},
		choices: [37,39],
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
			if (data[i].trial_id == "practice_trial") {
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
		console.log('go length = ' + go_length)

		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. 	Accuracy: " + Math.round(averageGo_correct * 100)+ "%</strong>"

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
			exp_phase = "practice2"
			practice_stims = createTrialTypes(practice_length)
			return false;
		}
	}
}


var practiceStopTrials = []
practiceStopTrials.push(feedback_block)
for (i = 0; i < practice_length; i++) {
	practiceStopTrials.push(fixation_block)
	var stop_signal_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getTrialType,
		data: {
			exp_id: "overt_response",
			"trial_id": "practice_stop_trial",
		},
		is_html: true,
		choices: [32,37,39],
		timing_stim: 850,
		timing_response: 1850,
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 850,
		timing_post_trial: 0,
		on_finish: appendData,
	}
	practiceStopTrials.push(stop_signal_block)
	practiceStopTrials.push(ITI_block)

}

var practiceStopCount = 0
var practiceStopNode = {
	timeline: practiceStopTrials,
	loop_function: function(data) {
		practiceStopCount = practiceStopCount + 1
		var sum_rt = 0;
		var sumGo_correct = 0;
		var go_length = 0;
		var num_responses = 0;
		var sumStop_correct = 0;
		var stop_length = 0
		for (i = 0; i < data.length; i++) {
			if (data[i].stop_type == "go") {
				go_length += 1
				if (data[i].rt != -1) {
					num_responses += 1
					sum_rt += data[i].rt;
					if (data[i].key_press == data[i].correct_response) {
						sumGo_correct += 1
					}
				}
			} else if (data[i].stop_type == "stop") {
				stop_length += 1
				if (data[i].rt == 32) {
					sumStop_correct += 1
				}
			}
		}
		var average_rt = sum_rt / num_responses;
		var averageGo_correct = sumGo_correct / go_length;
		var missed_responses = (go_length - num_responses) / go_length
		var averageStop_correct = sumStop_correct / stop_length
		var stop_respond = (stop_length - sumStop_correct)/stop_length
		var total_acc = (sumGo_correct + sumStop_correct) / (go_length + stop_length)
		

		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. 	Accuracy: " + Math.round(total_acc * 100)+ "%</strong>"

		if (practiceStopCount == 1) {
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
			exp_phase = "test"
			return false;
		}
	}
}


var testTrials = []
testTrials.push(feedback_block)
for (i = 0; i < numTrialsPerBlock; i++) {
	testTrials.push(fixation_block)
	var stop_signal_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getTrialType,
		data: {
			exp_id: "overt_response",
			"trial_id": "test_trial",
		},
		is_html: true,
		choices: [32,37,39],
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
			if (data[i].stop_type == "go") {
				go_length += 1
				if (data[i].rt != -1) {
					num_responses += 1
					sum_rt += data[i].rt;
					if (data[i].key_press == data[i].correct_response) {
						sumGo_correct += 1
					}
				}
			} else if (data[i].stop_type == "stop") {
				stop_length += 1
				if (data[i].rt == 32) {
					sumStop_correct += 1
				}
			}
		}
		var average_rt = sum_rt / num_responses;
		var averageGo_correct = sumGo_correct / go_length;
		var missed_responses = (go_length - num_responses) / go_length
		var averageStop_correct = sumStop_correct / stop_length
		var stop_respond = (stop_length - sumStop_correct)/stop_length  
		var total_acc = (sumGo_correct + sumStop_correct) / (go_length + stop_length)
		
		
		testCount += 1

		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy: " + Math.round(total_acc * 100)+ "%</strong>"

		if (testCount == numBlocks) {
			feedback_text += '</p><p class = block-text>Done with this test.'
			exp_phase = "forced_choice"
			
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
					'</p><p class = block-text>We have detected a number of trials that <strong>required a space bar response</strong>, where a left or right arrow response was made.  Please <strong>ensure that you are switching your response to the spacebar </strong>when the star appears.'
			
			}else if (stop_respond < .30){
				feedback_text +=
					'</p><p class = block-text>You have been responding too slowly, please respond to each shape (circle, triangle, rhombus, pentagon) as quickly and as accurately as possible.'
			
			}
				
			return true;
		}
	}
}

var forced_choice_trials = []

for (i = 0; i < numForcedTrials; i++) {
	forced_choice_trials.push(fixation_block)
		var forced_choice_block = {
		type: 'poldrack-single-stim',
		stimulus: getForcedStim, //getForcedStim
		is_html: true,
		choices: [37,39],
		data: {
			exp_id: "overt_response",
			trial_id: "forced_choice",
		},
		timing_post_trial: 0,
		timing_stim: 2500,
		timing_response: 2500,
		on_finish: appendData,
		response_ends_trial: true
		};

	forced_choice_trials.push(forced_choice_block)
	forced_choice_trials.push(ITI_block)
}

				  
var forcedChoiceNode = {
	timeline: forced_choice_trials,
	loop_function: function(data) {
	
	
	
	
	}
}

/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var overt_response_experiment = []

overt_response_experiment.push(welcome_block);
overt_response_experiment.push(instructions_block);

overt_response_experiment.push(practice_intro);
overt_response_experiment.push(practiceNode);
overt_response_experiment.push(feedback_block);

overt_response_experiment.push(practice_stop_intro)
overt_response_experiment.push(practiceStopNode)
overt_response_experiment.push(feedback_block);

overt_response_experiment.push(test_intro);
overt_response_experiment.push(testNode);
overt_response_experiment.push(feedback_block);


overt_response_experiment.push(forced_choice_intro);
overt_response_experiment.push(forcedChoiceNode);

overt_response_experiment.push(end_block);




