/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'n_back_with_shape_matching'})
}

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
	for (var k = 0; k < possible_responses.length; k++) {
		choice_counts[possible_responses[k][1]] = 0
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


var getResponse = function() {
	return correct_response
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}


var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}


var randomDraw = function(lst) {
	var index = Math.floor(Math.random() * (lst.length))
	return lst[index]
};

var createTrialTypes = function(numTrialsPerBlock, delay){
	
	shape_matching_condition = shape_matching_conditions[Math.floor(Math.random() * 2)]
	n_back_condition = 'N/A'
	probe = randomDraw(letters)
	correct_response = possible_responses[1][1]
	if (shape_matching_condition == 'match'){
		distractor = probe
	} else if (shape_matching_condition == 'mismatch'){
		distractor = randomDraw('bBdDgGtTvV'.split("").filter(function(y) {return $.inArray(y, [probe.toLowerCase(), probe.toUpperCase()]) == -1}))
	}
	 
			
	first_stim = {
		n_back_condition: n_back_condition,
		shape_matching_condition: shape_matching_condition,
		probe: probe,
		correct_response: correct_response,
		delay: delay,
		distractor: distractor
		
	
	}	
	first_stims = []
	first_stims.push(first_stim)
	for (var i = 0; i < delay - 1; i++){
		shape_matching_condition = shape_matching_conditions[Math.floor(Math.random() * 2)]
		n_back_condition = n_back_conditions[Math.floor(Math.random() * 2)]
	
	
		if (i < delay - 1) {
			probe = randomDraw(letters)
			correct_response = possible_responses[1][1]
			n_back_condition = 'N/A'
		} else if (n_back_condition == "match"){
			probe = randomDraw([first_stims[i].probe.toUpperCase(), first_stims[i].probe.toLowerCase()])
			correct_response = possible_responses[0][1]
		} else if (n_back_condition == "mismatch"){
			probe = randomDraw('bBdDgGtTvV'.split("").filter(function(y) {return $.inArray(y, [first_stims[i].probe.toLowerCase(), first_stims[i].probe.toUpperCase()]) == -1}))
			correct_response = possible_responses[1][1]
	
		} 
	
		
	
		if (shape_matching_condition == 'match'){
			distractor = probe
		} else if (shape_matching_condition == 'mismatch'){
			distractor = randomDraw('bBdDgGtTvV'.split("").filter(function(y) {return $.inArray(y, [probe.toLowerCase(), probe.toUpperCase()]) == -1}))
		}
	
		stim = {
			n_back_condition: n_back_condition,
			shape_matching_condition: shape_matching_condition,
			probe: probe,
			correct_response: correct_response,
			delay: delay,
			distractor: distractor
		}
		first_stims.push(stim)
	}
	
	stims = []
	
	for(var numIterations = 0; numIterations < numTrialsPerBlock/4; numIterations++){
		for (var numNBackConds = 0; numNBackConds < n_back_conditions.length; numNBackConds++){
			for (var numShapeConds = 0; numShapeConds < shape_matching_conditions.length; numShapeConds++){
			
				shape_matching_condition = shape_matching_conditions[numShapeConds]
				n_back_condition = n_back_conditions[numNBackConds]
				
				stim = {
					shape_matching_condition: shape_matching_condition,
					n_back_condition: n_back_condition
					}
			
				stims.push(stim)
			}
			
		}
	}
	
	stims = jsPsych.randomization.repeat(stims,1)
	stims = first_stims.concat(stims)
	
	stim_len = stims.length
	
	new_stims = []
	for (var i = 0; i < stim_len; i++){
		if (i < delay){
			stim = stims.shift()
			n_back_condition = stim.n_back_condition
			shape_matching_condition = stim.shape_matching_condition
			probe = stim.probe
			correct_response = stim.correct_response
			delay = stim.delay
			distractor = stim.distractor
		} else if (i > delay - 1){
			stim = stims.shift()
			n_back_condition = stim.n_back_condition
			shape_matching_condition = stim.shape_matching_condition
		
			if (n_back_condition == "match"){
				probe = randomDraw([new_stims[i - delay].probe.toUpperCase(), new_stims[i - delay].probe.toLowerCase()])
				correct_response = possible_responses[0][1]
			} else if (n_back_condition == "mismatch"){
				probe = randomDraw('bBdDgGtTvV'.split("").filter(function(y) {return $.inArray(y, [new_stims[i - delay].probe.toLowerCase(), new_stims[i - delay].probe.toUpperCase()]) == -1}))
				correct_response = possible_responses[1][1]
		
			}
			
			if (shape_matching_condition == 'match'){
				distractor = probe
			} else if (shape_matching_condition == 'mismatch'){
				distractor = randomDraw('bBdDgGtTvV'.split("").filter(function(y) {return $.inArray(y, [probe.toLowerCase(), probe.toUpperCase()]) == -1}))
			}
			
		}
		
		stim = {
			n_back_condition: n_back_condition,
			shape_matching_condition: shape_matching_condition,
			probe: probe,
			correct_response: correct_response,
			delay: delay,
			distractor: distractor
		}
		
		new_stims.push(stim)
	}
	return new_stims
}


var getStim = function(){	
	stim = stims.shift()
	n_back_condition = stim.n_back_condition
	shape_matching_condition = stim.shape_matching_condition
	probe = stim.probe
	correct_response = stim.correct_response
	delay = stim.delay
	distractor = stim.distractor
		
	return '<div class = bigbox><div class = centerbox>'+
	
			'<div class = distractor_text><font color="red" size="10">'+distractor+'</font></div>'+
	
			'<div class = cue_text><font size="10">'+probe+'</font></div>'+
		   
		   '</div></div>'
	
}



var getResponse =  function(){
	return correct_response
}

var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	current_trial+=1
	
	
	if (trial_id == 'practice_trial'){
		current_block = practiceCount
	} else if (trial_id == 'test_trial'){
		current_block = testCount
	}
		
	jsPsych.data.addDataToLastTrial({
		n_back_condition: n_back_condition,
		shape_matching_condition: shape_matching_condition,
		probe: probe,
		correct_response: correct_response,
		delay: delay,
		current_trial: current_trial,
		current_block: current_block
	})
		
	if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 1,
		})
	
	} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 0,
		})
	
	}
				
	 
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0


var practice_len = 8 // 24 must be divisible by 4
var exp_len = 32 //324 must be divisible by 4
var numTrialsPerBlock = 16 // 54 must be divisible by 4 and we need to have a multiple of 3 blocks (3,6,9) in order to have equal delays across blocks
var numTestBlocks = exp_len / numTrialsPerBlock
var practice_thresh = 1 // 3 blocks of 24 trials

var accuracy_thresh = 0.80
var missed_thresh = 0.10

var delays = jsPsych.randomization.repeat([1, 2, 3], numTestBlocks / 3)

var delay = 1

var pathSource = "/static/experiments/n_back_with_shape_matching/images/"
var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/n_back_with_shape_matching/images/"



var n_back_conditions = ['match','mismatch']
var shape_matching_conditions = jsPsych.randomization.repeat(['match','mismatch'],1)
var possible_responses = jsPsych.randomization.repeat([['M Key', 77],['Z Key', 90]],1)
							 
var letters = 'bBdDgGtTvV'.split("")
							 



var prompt_text = '<ul list-text>'+
				  	'<li>Press '+possible_responses[0][0]+' if the letter matches n-back letter, and '+possible_responses[1][0]+' for no.</li>' +
				  '</ul>'

var current_trial = 0
var current_block = 0
/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var task_boards = [['<div class = bigbox><div class = centerbox><div class = cue-text><font size="10">'],['</font></div></div></div>']]



var stims = createTrialTypes(practice_len, delay)

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */

var test_img_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = centerbox><div class = fixation><font color="white">Magnitude</font></div></div></div>',
	is_html: true,
	choices: [32],
	data: {
		trial_id: "fixation",
		},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true
	};

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
    	exp_id: 'flanker_with_predictive_task_switching'
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: assessPerformance
};


var feedback_instruct_text =
	'Welcome to the experiment. This experiment will take less than 30 minutes. Press <strong>enter</strong> to begin.'
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
			'<p class = block-text>Press '+possible_responses[0][0]+' if the letter matches the letter '+delay+' ago, and '+possible_responses[1][0]+' for no.</p> '+
			'<p class = block-text>Your delay is '+delay+'.</p> '+
		'</div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};



/* This function defines stopping criteria */

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	text: '<div class = centerbox>'+
			'<p class = block-text>We will now start the test portion</p>'+
			
			'<p class = block-text>Your delay is '+delay+'.</p>'+
			
			'<p class = block-text>Press '+possible_responses[0][0]+' if the letter matches the letter '+delay+' ago, and '+possible_responses[1][0]+' for no.</p> '+
				
			'<p class = block-text>Press Enter to continue.</p>'+
		 '</div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function(){
		feedback_text = "We will now start the test portion. Press enter to begin."
	}
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "practice_fixation"
	},
	timing_response: 500, //500
	timing_post_trial: 0,
}



var feedback_text = 'We will now start with a practice session. In this practice concentrate on responding quickly and accurately to each stimuli.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		exp_id: "n_back_with_shape_matching",
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


/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */

var practiceTrials = []
practiceTrials.push(feedback_block)
for (i = 0; i < practice_len + 1; i++) {
	
	var practice_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		key_answer: getResponse,
		data: {
			trial_id: "practice_trial"
			},
		correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>',
		incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>',
		timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>',
		timing_stim: 1000, //2000
		timing_response: 1000,
		timing_feedback: 500, //500
		show_stim_with_feedback: false,
		timing_post_trial: 0,
		on_finish: appendData
	}
	//practiceTrials.push(fixation_block)
	practiceTrials.push(practice_block)
}

var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
		practiceCount += 1
		stims = createTrialTypes(practice_len, delay)
		current_trial = 0
	
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
	
		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "practice_trial"){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
		
					}
				}
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(ave_rt) + " ms. 	Accuracy: " + Math.round(accuracy * 100)+ "%</strong>"

		if (accuracy > accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Done with this practice. Press Enter to continue.' 
			stims = createTrialTypes(numTrialsPerBlock, delay)
			delay = delays.pop()
			return false
	
		} else if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_text 
			if (missed_responses > missed_thresh){
				feedback_text +=
						'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
			}
		
			if (practiceCount == practice_thresh){
				feedback_text +=
					'</p><p class = block-text>Done with this practice.' 
					stims = createTrialTypes(numTrialsPerBlock, delay)
					delay = delays.pop()
					return false
			}
			
			feedback_text +=
				'</p><p class = block-text>Redoing this practice. Press Enter to continue.' 
			
			return true
		
		}
		
	}
}

var testTrials = []
testTrials.push(feedback_block)
for (i = 0; i < numTrialsPerBlock + 1; i++) {
	
	var test_block = {
		type: 'poldrack-single-stim',
		stimulus: getStim,
		is_html: true,
		data: {
			"trial_id": "test_trial",
		},
		choices: [possible_responses[0][1],possible_responses[1][1]],
		timing_stim: 1000, //2000
		timing_response: 1000, //2000
		timing_post_trial: 0,
		response_ends_trial: false,
		on_finish: appendData
	}
	testTrials.push(test_block)
}

var testCount = 0
var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
	testCount += 1
	stims = createTrialTypes(numTrialsPerBlock, delay)
	current_trial = 0
	
	var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0

		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "test_trial"){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
					}
				}
			} 
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(ave_rt) + " ms. 	Accuracy: " + Math.round(accuracy * 100)+ "%</strong>"
		feedback_text += "</p><p class = block-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
		
		if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_text 
		}
		if (missed_responses > missed_thresh){
			feedback_text +=
					'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}
	
		if (testCount == numTestBlocks){
			feedback_text +=
					'</p><p class = block-text>Done with this test. Press Enter to continue.'
			return false
		} else {
			delay = delays.pop()
			feedback_text += "</p><p class = block-text><strong>For the next round of trials, your delay is "+delay+"</strong>.  Press Enter to continue."
			return true
		}
	
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var n_back_with_shape_matching_experiment = []

n_back_with_shape_matching_experiment.push(instruction_node);

n_back_with_shape_matching_experiment.push(practiceNode);

n_back_with_shape_matching_experiment.push(start_test_block);

n_back_with_shape_matching_experiment.push(testNode);

n_back_with_shape_matching_experiment.push(end_block);
