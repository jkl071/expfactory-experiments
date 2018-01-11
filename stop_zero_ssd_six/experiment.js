/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */
function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'stop_zero_ssd_six', subject_ID: subject_ID})
}


var getFeedback = function() {
	return '<div class = centerbox><p class = block-text>' + feedback_text + '</p></div>'
}

var createPracticeStims = function(){
	var stop_types = ['go','go','go','stop','stop']
	
	var stims = []
	for (var x = 0; x < stop_types.length; x++){
		stim1 = {
			stim: shapes[0],
			correct_response: possible_responses[0][1],
			stop_type: stop_types[x],
			SSD: 200
		
		}
		
		stim2 = {
			stim: shapes[1],
			correct_response: possible_responses[0][1],
			stop_type: stop_types[x],
			SSD: 200
		
		}
		
		stim3 = {
			stim: shapes[2],
			correct_response: possible_responses[0][1],
			stop_type: stop_types[x],
			SSD: 200
		
		}
		
		stim4 = {
			stim: shapes[3],
			correct_response: possible_responses[1][1],
			stop_type: stop_types[x],
			SSD: 200
		
		}
		
		stim5 = {
			stim: shapes[4],
			correct_response: possible_responses[1][1],
			stop_type: stop_types[x],
			SSD: 200
		
		}
		
		stim6 = {
			stim: shapes[5],
			correct_response: possible_responses[1][1],
			stop_type: stop_types[x],
			SSD: 200
		
		}
	
		stims.push(stim1)
		stims.push(stim2)
		stims.push(stim3)
		stims.push(stim4)
		stims.push(stim5)
		stims.push(stim6)
	
	}
	stims = jsPsych.randomization.repeat(stims,1,true)
	return stims
}


var createTrialTypes = function(){
	var ssd_types = [0,100,200,300,400,500,600]
	var stop_types = ['go','go','stop']
	
	var stims = []
	for (var i = 0; i < ssd_types.length; i++){
		for (var x = 0; x < stop_types.length; x++){
			stim1 = {
				stim: shapes[0],
				correct_response: possible_responses[0][1],
				stop_type: stop_types[x],
				SSD: ssd_types[i]
			
			}
			
			stim2 = {
				stim: shapes[1],
				correct_response: possible_responses[0][1],
				stop_type: stop_types[x],
				SSD: ssd_types[i]
			
			}
			
			stim3 = {
				stim: shapes[2],
				correct_response: possible_responses[0][1],
				stop_type: stop_types[x],
				SSD: ssd_types[i]
			
			}
			
			stim4 = {
				stim: shapes[3],
				correct_response: possible_responses[1][1],
				stop_type: stop_types[x],
				SSD: ssd_types[i]
			
			}
			
			stim5 = {
				stim: shapes[4],
				correct_response: possible_responses[1][1],
				stop_type: stop_types[x],
				SSD: ssd_types[i]
			
			}
			
			stim6 = {
				stim: shapes[5],
				correct_response: possible_responses[1][1],
				stop_type: stop_types[x],
				SSD: ssd_types[i]
			
			}
		
			stims.push(stim1)
			stims.push(stim2)
			stims.push(stim3)
			stims.push(stim4)
			stims.push(stim5)
			stims.push(stim6)
		
		}
	
	}
	
	stims = jsPsych.randomization.repeat(stims,14,true)
	return stims
}
	

var getStopStim = function(){
	return preFileType + pathSource + 'stopSignal' + fileType + postFileType
}

var getStim = function(){

	if(exp_phase == "practice1"){
		shape = practice_stims.stim.pop()
		correct_response = practice_stims.correct_response.pop()
		stop_type = "practice_no_stop"
		SSD = ''
		
		console.log('shape = '+shape)
		console.log('correct response = '+correct_response)
		
	} else if (exp_phase == "practice2"){
		shape = practice_stims.stim.pop()
		correct_response = practice_stims.correct_response.pop()
		stop_type = practice_stims.stop_type.pop()
		SSD = practice_stims.SSD.pop()
		if(stop_type == "stop"){
			correct_response = -1
		}
		console.log('stim = ' + shape)
		console.log('correct response = '+correct_response)
		console.log('stop type = '+stop_type)
		console.log('SSD = '+SSD)
		
		
	} else if (exp_phase == "test"){
		shape = test_stims.stim.pop()
		correct_response = test_stims.correct_response.pop()
		stop_type = test_stims.stop_type.pop()
		SSD = test_stims.SSD.pop()
		
		if(stop_type == "stop"){
			correct_response = -1
		}
		console.log('stim = ' + shape)
		console.log('correct response = '+correct_response)
		console.log('stop type = '+stop_type)
		console.log('SSD = '+SSD)
	}
	
	stim = {
		image: preFileType + pathSource + shape + fileType + postFileType,
		data: { 
			exp_id: 'stop_zero_ssd_two',
			stim: 'black_' + shape,
			stop_type: stop_type,
			correct_response: correct_response,
			SSD: SSD
			}
	}
	stimData = stim.data
	return stim.image
}



function getSSD(){
	//console.log('SSD = ' + SSD)
	return SSD
}

function getSSType(){
	//console.log('stop type = ' + stop_type)
	return stop_type

}


var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global

	if (exp_phase == "practice1"){
		currBlock = practiceCount
	} else if (exp_phase == "practice2"){
		currBlock = practiceStopCount
	} else if (exp_phase == "test"){
		currBlock = testCount
	}
	
	if ((exp_phase == "practice1") || (exp_phase == "practice2") || (exp_phase == "test")){
		jsPsych.data.addDataToLastTrial({
			stim: stimData.stim,
			correct_response: correct_response,	
			current_block: currBlock,
			exp_stage: exp_phase,
			stop_type: stimData.stop_type,
		})
	}
	
	if (exp_phase == "test"){	
		
	
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


//Now we should have 7 blocks, 7 SSD from 0 - 600, and 180 trials per block. 1260 total trials

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
var subject_ID = 469
var practice_length = 30 //18
var test_length = 1134 // 720
var numBlocks = test_length/81
var numTrialsPerBlock = test_length/numBlocks


var SSD = ''



var rt_thresh = 1000;
var missed_response_thresh = 0.15;
var accuracy_thresh = 0.80;



var shapes = jsPsych.randomization.repeat(['circle','pentagon','rectangle','square','tear','triangle'],1)
var color = "black"


var possible_responses = [['N key', 78],['M key', 77]]
var stop_zero_ssd_six_response = ['No Response', -1]


var postFileType = "'></img>"
var pathSource = "/static/experiments/stop_zero_ssd_six/images/"
var fileType = ".png"
var preFileType = "<img class = center src='"



var images = []
for(i=0;i<shapes.length;i++){
	images.push(pathSource + shapes[i] + '.png')
}
jsPsych.pluginAPI.preloadImages(images);



var prompt_text = '<ul list-text>'+
				  	'<li>' + shapes[0] + ': ' + possible_responses[0][0] + '</li>' +
					'<li>' + shapes[1] + ': ' + possible_responses[0][0] + '</li>' +
					'<li>' + shapes[2] + ': ' + possible_responses[0][0] + '</li>' +
					'<li>' + shapes[3] + ': ' + possible_responses[1][0] + '</li>' +
					'<li>' + shapes[4] + ': ' + possible_responses[1][0] + '</li>' +
					'<li>' + shapes[5] + ': ' + possible_responses[1][0] + '</li>' +
				  '</ul>'



var practice_stims = createPracticeStims()
var test_stims = createTrialTypes()


var shape = ''
var stop_type = ''
var correct_response = ''
var exp_phase = "practice1"




/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */

var end_block = {
	type: 'poldrack-text',
	data: {
		exp_id: "stop_zero_ssd_six",
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
		exp_id: "stop_zero_ssd_six",
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
		exp_id: "stop_zero_ssd_six",
		"trial_id": "ITI",
	},
	choices: 'none',
	timing_stim: 1000,
	timing_response: 1000,
	timing_post_trial: 0,
	response_ends_trial: false,
	prompt: prompt_text
}
	
var ITI_block = {
	type: 'poldrack-single-stim',
	stimulus: "<div></div>",
	is_html: true,
	data: {
		exp_id: "stop_zero_ssd_six",
		"trial_id": "ITI"
	},
	choices: 'none',
	timing_stim: 1000,
	timing_response: 1000,
	timing_post_trial: 0,
	response_ends_trial: false
}

var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		exp_id: "stop_zero_ssd_six",
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
	timing_post_trial: 0,
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		exp_id: "stop_zero_ssd_six",
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
		exp_id: "stop_zero_ssd_six",
		trial_id: "prompt_fixation",
	},
	timing_post_trial: 0,
	timing_stim: 500,
	timing_response: 500,
	prompt: prompt_text
};


var practice_intro = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><p class = block-text>We will now start the practice for the experiment.<br><br>For these trials, you must press the <strong>'+possible_responses[0][0]+' </strong> or the <strong>'+possible_responses[1][0]+'</strong> depending on the shape of the stimulus.  Make sure to respond as quickly and accurately as possible to the shape. <br><br> The responses for each shape are as follows: ' +
		prompt_text +
		'</p><p class = block-text>Remember these rules before you proceed.</p><p class = block-text>Press <strong> enter</strong> to begin.</p></div>',
	is_html: true,
	choices: [13],
	data: {
		exp_id: "stop_zero_ssd_six",
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
			  	'<p class = block-text>On some trials, a star will appear around the shape.  If the star appears, please make ' + stop_zero_ssd_six_response[0] + '.</p>'+
				'<p class = block-text>Please continue to respond to each shape as quickly and as accurately as possible.</p>'+
				'<p class = block-text>Remember these rules before you proceed.</p>'+
				prompt_text +
				'<p class = block-text>If you see a star, please make ' + stop_zero_ssd_six_response[0] + ' on that trial.</p>'+
			    '<p class = block-text>Press <strong> enter</strong> to begin.</p>'+
			  '</div>',
	is_html: true,
	choices: [13],
	data: {
		exp_id: "stop_zero_ssd_six",
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
		'</p><p class = block-text>Remember these rules before you proceed, as they will no longer be presented during the trial.</p>'+
		'<p class = block-text>If you see a star, please make ' + stop_zero_ssd_six_response[0] + ' on that trial.</p>'+
		'<p class = block-text>Press <strong> enter</strong> to begin.</p></div>',
	is_html: true,
	choices: [13],
	data: {
		exp_id: "stop_zero_ssd_six",
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

var feedback_text = 'We will now start with a practice session. In this practice concentrate on responding quickly and accurately to each stimuli.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		exp_id: "stop_zero_ssd_six",
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
			exp_id: "stop_zero_ssd_six",
			"trial_id": "practice_trial",
		},
		choices: [possible_responses[0][1],possible_responses[1][1]],
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
		console.log('num response = '+ num_responses)

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
				'</p><p class = block-text><strong>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.</strong>'
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
			practice_stims = createPracticeStims()
			return false;
		}
	}
}


var practiceStopTrials = []
practiceStopTrials.push(feedback_block)
for (i = 0; i < practice_length; i++) {
	practiceStopTrials.push(prompt_fixation_block)
	var practice_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType,
		data: {
			exp_id: "stop_zero_ssd_six",
			"trial_id": "stim",
			"exp_stage": "test_trial",
		},
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		timing_stim: 850,
		timing_response: 1100,
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500,
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: prompt_text
	}

	practiceStopTrials.push(practice_block)
	practiceStopTrials.push(prompt_ITI_block)

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
				if (data[i].key_press == stop_zero_ssd_six_response[1]) {
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
		console.log('go length = ' + go_length)
		console.log('go correct = ' +sumGo_correct)
		console.log('stop length = ' +stop_length)
		console.log('stop correct = '+sumStop_correct)
		

		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. 	Accuracy: " + Math.round(averageGo_correct * 100)+ "%</strong>"

		if (practiceStopCount == 1) {
			if (averageGo_correct < accuracy_thresh) {
				feedback_text +=
					'</p><p class = block-text><strong>Your accuracy is too low. Remember, the correct responses for each shape are as follows:</strong><br><br>' +
					prompt_text
			}
			if (average_rt > rt_thresh) {
				feedback_text +=
				'</p><p class = block-text><strong>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.</strong>'
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
	var test_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType,
		data: {
			exp_id: "stop_zero_ssd_six",
			"trial_id": "stim",
			"exp_stage": "test_trial",
		},
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		timing_stim: 850,
		timing_response: 1100,
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500,
		timing_post_trial: 0,
		on_finish: appendData,
	}
	testTrials.push(test_block)
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
				if (data[i].key_press == stop_zero_ssd_six_response[1]) {
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
		console.log('go length = ' + go_length)
		console.log('go correct = ' +sumGo_correct)
		console.log('stop length = ' +stop_length)
		console.log('stop correct = '+sumStop_correct)
		
		
		testCount += 1

		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy: " + Math.round(averageGo_correct * 100)+ "%</strong>"

		if (testCount == numBlocks) {
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
				'</p><p class = block-text><strong>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.</strong>'
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
					'</p><p class = block-text>We have detected a number of trials that <strong>required ' + stop_zero_ssd_six_response[0] + '</strong>, where a ' + possible_responses[0][0] + ' or a ' + possible_responses[1][0] + ' response was made.  Please <strong>ensure that you are making ' + stop_zero_ssd_six_response[0] + ' </strong> when you see a star.'
			
			}else if (stop_respond < .30){
				feedback_text +=
					'</p><p class = block-text>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.'
			
			}
			return true;
		}
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var stop_zero_ssd_six_experiment = []

stop_zero_ssd_six_experiment.push(welcome_block);
stop_zero_ssd_six_experiment.push(instructions_block);

stop_zero_ssd_six_experiment.push(practice_intro);
stop_zero_ssd_six_experiment.push(practiceNode);
stop_zero_ssd_six_experiment.push(feedback_block);

stop_zero_ssd_six_experiment.push(practice_stop_intro)
stop_zero_ssd_six_experiment.push(practiceStopNode)
stop_zero_ssd_six_experiment.push(feedback_block);

stop_zero_ssd_six_experiment.push(test_intro);
stop_zero_ssd_six_experiment.push(testNode);
stop_zero_ssd_six_experiment.push(feedback_block);

stop_zero_ssd_six_experiment.push(end_block);




