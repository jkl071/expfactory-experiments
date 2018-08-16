/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'flanker_with_cued_task_switching'})
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
}

var getCorrectResponse = function(number, cued_dimension){
	if (number > 5){
		var magnitude = 'high'
	} else if (number < 5){
		magnitude = 'low'
	}

	if (number%2 == 0){
		var parity = 'even'
	} else if (number%2 != 0) {
		parity = 'odd'
	}
	
	par_ind = cued_dimensions_list[0].values.indexOf(parity)
	if (par_ind == -1){
		par_ind = cued_dimensions_list[1].values.indexOf(parity)
		mag_ind = cued_dimensions_list[0].values.indexOf(magnitude)
	} else {
		mag_ind = cued_dimensions_list[1].values.indexOf(magnitude)
	}
	
	
	if (cued_dimension == 'magnitude'){
		correct_response = possible_responses[mag_ind][1]
	} else if (cued_dimension == 'parity'){
		correct_response = possible_responses[par_ind][1]
	}
	
	return [correct_response,magnitude,parity]

}

	 
var createTrialTypes = function(numTrialsPerBlock){
	flanker_trial_types = ['congruent','incongruent']
	
	cued_dimension = cued_dimensions[Math.floor(Math.random() * 2)]
	flanker_condition = flanker_trial_types[Math.floor(Math.random() * 2)]
	numbers = [1,2,3,4,6,7,8,9]	
	number = numbers[Math.floor((Math.random() * 8))]
	if (flanker_condition == 'congruent'){
		flanking_number = number
	} else {
		flanking_number = randomDraw(numbers.filter(function(y) {return y != number}))	
	}
	
	response_arr = getCorrectResponse(number,cued_dimension)
	
	first_stim = {
		cued_dimension: cued_dimension,
		cued_condition: 'N/A',
		flanker_condition: flanker_condition
	}
	
	var stims = []
	for(var numIterations = 0; numIterations < numTrialsPerBlock/4; numIterations++){
		for (var numFlankerConds = 0; numFlankerConds < flanker_trial_types.length; numFlankerConds++){
			for (var numCuedConds = 0; numCuedConds < cued_conditions.length; numCuedConds++){
			
				cued_dimension = 'N/A'
				cued_condition = cued_conditions[numCuedConds]
				flanker_condition = flanker_trial_types[numFlankerConds]
				
				
				stim = {
					cued_dimension: cued_dimension,
					cued_condition: cued_condition,
					flanker_condition: flanker_condition
					}
			
				stims.push(stim)
			}
			
		}
	}
	
	stims = jsPsych.randomization.repeat(stims,1)
	stims.push(first_stim)
	stim_len = stims.length
	
	var new_stims = []
	for(var i = 0; i < stim_len; i++){
		
		if (i > 0){
			last_dim = cued_dimension 
		} 
		
		stim = stims.pop()
		cued_condition = stim.cued_condition
		flanker_condition = stim.flanker_condition
		cued_dimension = stim.cued_dimension
		
		if (cued_condition == "switch"){
			cued_dimension = randomDraw(['magnitude','parity'].filter(function(y) {return $.inArray(y, [last_dim]) == -1}))
		} else if (cued_condition == "stay"){
			cued_dimension = last_dim
		}
		console.log('condition = '+cued_condition+', flanker_condition: '+ flanker_condition+', cued_dimension: '+cued_dimension)
		
		number = numbers[Math.floor((Math.random() * 8))]
		if (flanker_condition == 'congruent'){
			flanking_number = number
		} else {
			flanking_number = randomDraw(numbers.filter(function(y) {return y != number}))	
		}
	
		response_arr = getCorrectResponse(number,cued_dimension)
		
			
		stim = {
			cued_dimension: cued_dimension,
			cued_condition: cued_condition,
			flanker_condition: flanker_condition,
			magnitude: response_arr[1],
			parity: response_arr[2],
			correct_response: response_arr[0],
			number: number,
			flanking_number: flanking_number
			}
		
		new_stims.push(stim)
		

	}
	return new_stims	
}


var getResponse = function() {
	return correct_response
}

var getStim = function(){
	
	return task_boards[0]+ 
			flanking_number+
			flanking_number+
			number+
			flanking_number+
			flanking_number+
		   task_boards[1]
}
	
		
var getCue = function(){
	stim = stims.shift()
	cued_condition = stim.cued_condition
	cued_dimension = stim.cued_dimension
	flanker_condition = stim.shape_matching_condition
	
	number = stim.number
	flanking_number = stim.flanking_number
	correct_response = stim.correct_response
	magnitude = stim.magnitude
	parity = stim.parity

	console.log('cued condition = '+cued_condition+', flanker_condition: '+ flanker_condition+', cued_dimension: '+cued_dimension+', correct_response: '+correct_response+', number: '+number+', flankers: '+flanking_number)
	
	return '<div class = centerbox><div class = cue-text><font size = 36>'+cued_dimension+'</font></div></div>'	

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
		cued_condition: cued_condition,
		cued_dimension: cued_dimension,
		flanker_condition: flanker_condition,
		number: number,
		flanking_number: flanking_number,
		correct_response: correct_response,
		current_block: current_block,
		current_trial: current_trial,
		magnitude: magnitude,
		parity: parity
		
	})
	
	
	
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0

// task specific variables
// Set up variables for stimuli
var practice_len = 24 // must be divisible by 8
var exp_len = 320 //320 must be divisible by 64
var numTrialsPerBlock = 8; // divisible by 8
var numTestBlocks = exp_len / numTrialsPerBlock

var accuracy_thresh = 0.80
var missed_thresh = 0.10
var practice_thresh = 3 // 3 blocks of 28 trials
 

var cued_conditions = jsPsych.randomization.repeat(['stay','switch'],1)
var cued_dimensions = jsPsych.randomization.repeat(['magnitude','parity'],1)
var possible_responses = jsPsych.randomization.repeat([['M Key', 77],['Z Key', 90]],1)


var current_trial = 0
var current_block = 0

var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/flanker_with_cued_task_switching/images/"

var cued_dimensions_list = jsPsych.randomization.repeat([stim = {dim:'magnitude', values: jsPsych.randomization.repeat(['high','low'],1)},
								  						 stim = {dim:'parity', values: jsPsych.randomization.repeat(['odd','even'],1)}],1)



var task_boards = [['<div class = bigbox><div class = centerbox><div class = flanker-text>'],['<div></div><div>']]				

				   

var stims = createTrialTypes(practice_len)

var prompt_text = '<ul list-text>'+
				  	'<li>Cue was '+cued_dimensions_list[0].dim+': Judge number on '+cued_dimensions_list[0].dim+'</li>' +
				  	'<li>'+cued_dimensions_list[0].values[0]+': ' + possible_responses[0][0] + '</li>' +
					'<li>'+cued_dimensions_list[0].values[1]+': ' + possible_responses[1][0] + '</li>' +
					'<li>Cue was '+cued_dimensions_list[1].dim+': '+cued_dimensions_list[1].dim+'</li>' +
					'<li>'+cued_dimensions_list[1].values[0]+': ' + possible_responses[0][0] + '</li>' +
					'<li>'+cued_dimensions_list[1].values[1]+': ' + possible_responses[1][0] + '</li>' +
				  '</ul>'
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

var test_img_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = centerbox><div class = flanker-text>fffff</div></div>'+
			  '</div>',
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

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post_task_questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var response_keys =
	'<ul list-text><li><span class = "large" style = "color:red">WORD</span>: "R key"</li><li><span class = "large" style = "color:blue">WORD</span>: "B key"</li><li><span class = "large" style = "color:green">WORD</span>: "G key"</li></ul>'


var feedback_text = 'We will start practice. Press <strong>enter</strong> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		exp_id: "flanker_with_cued_task_switching",
		trial_id: "feedback_block"
	},
	choices: [13],
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true, 

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
		'<p class = block-text>In this experiment you will see a cue, either magnitude or parity, followed by a row of numbers.</p> '+
		
		'<p class = block-text>You will be asked to judge the <strong>center number </strong>on magnitude (higher or lower than 5) or parity (odd or even), depending on which cue you see.</p>'+
		
		'<p class = block-text>If you see the cue '+cued_dimensions_list[0].dim+', please judge the number based on <strong>'+cued_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
			'  if '+cued_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+cued_dimensions_list[0].values[1]+'</strong>.</p>'+
		
		'<p class = block-text>If you see the cue '+cued_dimensions_list[1].dim+', please judge the number based on <strong>'+cued_dimensions_list[1].dim+'.</strong>'+
		' Press the <strong>'+possible_responses[0][0]+' if '+cued_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+ ' if ' +cued_dimensions_list[1].values[1]+'</strong>.</p>'+
		
		'<p class = block-text>Please judge only the center number, you should ignore the other numbers.</p>'+
		
		'<p class = block-text>We will start with practice after you finish the instructions.</p></div>'
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

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
    	exp_id: 'flanker_with_cued_task_switching'
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: assessPerformance
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	text: '<div class = centerbox>'+
			'<p class = block-text>We will now start the test portion</p>'+
			
			'<p class = block-text>Please judge the <strong>center number</strong> on magnitude (higher or lower than 5) or parity (odd or even), depending on the cue.</p>'+
	
			'<p class = block-text>If you see the cue '+cued_dimensions_list[0].dim+', please judge the number based on <strong>'+cued_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
			'  if '+cued_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+cued_dimensions_list[0].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>If you see the cue '+cued_dimensions_list[1].dim+', please judge the number based on <strong>'+cued_dimensions_list[1].dim+'.</strong>'+
			' Press the <strong>'+possible_responses[0][0]+' if '+cued_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+
		
			'<p class = block-text>Please judge only the center number, you should ignore the other numbers.</p>'+
	
			'<p class = block-text>Press Enter to continue.</p>'+
		 '</div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function(){
		feedback_text = "We will now start the test portion. Press enter to begin."
	}
};

var rest_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Take a short break!</p><p class = center-block-text>Press <strong>enter</strong> to continue the test.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};



var practiceTrials = []
practiceTrials.push(feedback_block)
for (i = 0; i < practice_len + 1; i++) {
	var cue_block = {
		type: 'poldrack-single-stim',
		stimulus: getCue,
		is_html: true,
		choices: 'none',
		data: {
			trial_id: "practice_cue"
		},
		timing_response: 500, //500
		timing_post_trial: 0
	}
	
	var practice_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		key_answer: getResponse,
		data: {
			exp_id: "flanker_with_cued_task_switching",
			trial_id: "practice_trial"
			},
		correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>',
		incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>',
		timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>',
		timing_stim: 2000, //2000
		timing_response: 2000,
		timing_feedback: 500, //500
		show_stim_with_feedback: false,
		timing_post_trial: 0,
		on_finish: appendData
	}
	practiceTrials.push(cue_block)
	practiceTrials.push(practice_block)
}


var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data){
		practiceCount += 1
		stims = createTrialTypes(practice_len)
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
			stims = createTrialTypes(numTrialsPerBlock)
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
					stims = createTrialTypes(numTrialsPerBlock)
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
	var cue_block = {
		type: 'poldrack-single-stim',
		stimulus: getCue,
		is_html: true,
		choices: 'none',
		data: {
			trial_id: "test_cue"
		},
		timing_response: 500, //500
		timing_post_trial: 0
	}
	
	
	var test_block = {
		type: 'poldrack-single-stim',
		stimulus: getStim,
		is_html: true,
		data: {
			"trial_id": "test_trial",
		},
		choices: [possible_responses[0][1],possible_responses[1][1]],
		timing_stim: 2000, //2000
		timing_response: 2000, //2000
		timing_post_trial: 0,
		response_ends_trial: false,
		on_finish: appendData
	}
	testTrials.push(cue_block)
	testTrials.push(test_block)
}

var testCount = 0
var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
	testCount += 1
	stims = createTrialTypes(numTrialsPerBlock)
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
		
			return true
		}
	
	}
}



/* create experiment definition array */
flanker_with_cued_task_switching_experiment = []

//flanker_with_cued_task_switching_experiment.push(test_img_block)

flanker_with_cued_task_switching_experiment.push(instruction_node)

flanker_with_cued_task_switching_experiment.push(practiceNode)

flanker_with_cued_task_switching_experiment.push(start_test_block)

flanker_with_cued_task_switching_experiment.push(testNode)

flanker_with_cued_task_switching_experiment.push(post_task_block)

flanker_with_cued_task_switching_experiment.push(end_block)