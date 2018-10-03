/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'stop_signal_with_predictive_task_switching'})
}
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
  jsPsych.data.addDataToLastTrial({"att_check_percent": check_percent})
  return check_percent
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
	return '<div class = bigbox><div class = picture_box><p class = block-text>' + feedback_text + '</p></div></div>'
}

var getCategorizeIncorrectText = function(){
	if (stop_signal_condition == 'go'){
	
		return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>'
	} else {
	
		return '<div class = fb_box><div class = center-text><font size = 20>Number is red.</font></div></div>'
	}

}

var getTimeoutText = function(){
	if (stop_signal_condition == "go"){
		return '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>'
	} else {
		return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>'
	}
}

var getCategorizeFeedback = function(){
	curr_trial = jsPsych.progress().current_trial_global - 1
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	console.log(trial_id)
	if ((trial_id == 'practice_with_stop') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition != 'stop')){
		if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1)){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text
	
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text
	
		}
	} else if ((trial_id == 'practice_with_stop') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop')){
		if (jsPsych.data.getDataByTrialIndex(curr_trial).rt == -1){
			return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).rt != -1){
			return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text
		}
	}
}


var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

var getCorrectResponse = function(number, predictive_dimension, stop_signal_condition){
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
	
	par_ind = predictive_dimensions_list[0].values.indexOf(parity)
	if (par_ind == -1){
		par_ind = predictive_dimensions_list[1].values.indexOf(parity)
		mag_ind = predictive_dimensions_list[0].values.indexOf(magnitude)
	} else {
		mag_ind = predictive_dimensions_list[1].values.indexOf(magnitude)
	}
	
	
	if (predictive_dimension == 'magnitude'){
		correct_response = possible_responses[mag_ind][1]
	} else if (predictive_dimension == 'parity'){
		correct_response = possible_responses[par_ind][1]
	}
	
	if (stop_signal_condition == "stop"){
		correct_response = -1
	}
	
	return [correct_response,magnitude,parity]

}

							 
var createTrialTypes = function(numTrialsPerBlock){
	var whichQuadStart = jsPsych.randomization.repeat([1,2,3,4],1).pop()
	var predictive_cond_array = predictive_conditions[whichQuadStart%2]
	var predictive_dimensions = [predictive_dimensions_list[0].dim,
								 predictive_dimensions_list[0].dim,
								 predictive_dimensions_list[1].dim,
								 predictive_dimensions_list[1].dim]
		
	numbers_list = [[6,8],[7,9],[2,4],[1,3]]
	numbers = [1,2,3,4,6,7,8,9]	
	
	var stop_signal_trial_type_list = []
	var stop_signal_trial_types1 = jsPsych.randomization.repeat(['go','go','stop'], numTrialsPerBlock/12)
	var stop_signal_trial_types2 = jsPsych.randomization.repeat(['go','go','stop'], numTrialsPerBlock/12)
	var stop_signal_trial_types3 = jsPsych.randomization.repeat(['go','go','stop'], numTrialsPerBlock/12)
	var stop_signal_trial_types4 = jsPsych.randomization.repeat(['go','go','stop'], numTrialsPerBlock/12)
	stop_signal_trial_type_list.push(stop_signal_trial_types1)
	stop_signal_trial_type_list.push(stop_signal_trial_types2)
	stop_signal_trial_type_list.push(stop_signal_trial_types3)
	stop_signal_trial_type_list.push(stop_signal_trial_types4)
	
	predictive_dimension = predictive_dimensions[whichQuadStart - 1]
	
	number = numbers[Math.floor((Math.random() * 8))]
	stop_signal_condition = jsPsych.randomization.repeat(['go','go','stop'],1).pop()
	
	
	response_arr = getCorrectResponse(number,predictive_dimension, stop_signal_condition)
	
	var stims = []
	
	var first_stim = {
		whichQuadrant: whichQuadStart,
		predictive_condition: 'N/A',
		predictive_dimension: predictive_dimension,
		stop_signal_condition: stop_signal_condition,
		number: number,
		magnitude: response_arr[1],
		parity: response_arr[2],
		correct_response: response_arr[0]
		}
	stims.push(first_stim)
	
	for (var i = 0; i < numTrialsPerBlock; i++){
		whichQuadStart += 1
		quadIndex = whichQuadStart%4
		if (quadIndex == 0){
			quadIndex = 4
		}
		stop_signal_condition = stop_signal_trial_type_list[quadIndex - 1].pop()
		predictive_dimension = predictive_dimensions[quadIndex - 1]
		number = numbers[Math.floor((Math.random() * 8))]
	
		response_arr = getCorrectResponse(number,predictive_dimension, stop_signal_condition)
		
		stim = {
			whichQuadrant: quadIndex,
			predictive_condition: predictive_cond_array[i%2],
			predictive_dimension: predictive_dimension,
			stop_signal_condition: stop_signal_condition,
			number: number,
			magnitude: response_arr[1],
			parity: response_arr[2],
			correct_response: response_arr[0]
			}
		
		stims.push(stim)
		
		
	}

	return stims	
}



var getFixation = function(){
	stim = stims.shift()
	predictive_condition = stim.predictive_condition
	predictive_dimension = stim.predictive_dimension
	stop_signal_condition = stim.stop_signal_condition
	number = stim.number
	correct_response = stim.correct_response
	whichQuadrant = stim.whichQuadrant
	magnitude = stim.magnitude
	parity = stim.parity
	
	return '<div class = bigbox>' + stop_boards[whichQuadrant - 1][0] + '<div class = centerbox><div class = fixation>+</div></div>' + stop_boards[whichQuadrant - 1][1] 
}

function getSSD(){
	return SSD
}

function getSSType(){
	return stop_signal_condition

}

var getStopStim = function(){
	return stop_boards[whichQuadrant - 1][0] + 
		   	preFileType + 'stopSignal' + fileTypePNG + 
		   stop_boards[whichQuadrant - 1][1] 
}


var getStim = function(){
	
	return task_boards[whichQuadrant - 1][0] + 
				number +
		   task_boards[whichQuadrant - 1][1]
		   		   
	
}

var getResponse = function() {
	return correct_response
}

var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	current_trial+=1
	
	
	if ((trial_id == 'practice_trial') || (trial_id == 'practice_with_stop')){
		current_block = practiceCount
	} else if (trial_id == 'test_trial'){
		current_block = testCount
	}
	
	jsPsych.data.addDataToLastTrial({
		predictive_condition: predictive_condition,
		predictive_dimension: predictive_dimension,
		stop_signal_condition: stop_signal_condition,
		number: number,
		correct_response: correct_response,
		whichQuadrant: whichQuadrant,
		magnitude: magnitude,
		parity: parity,
		current_trial: current_trial,
		current_block: current_block,
		SSD: SSD
		
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
	
	if (trial_id == 'test_trial'){
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD < maxSSD)){
			jsPsych.data.addDataToLastTrial({stop_acc: 1})
			SSD+=50
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD > minSSD)){
			jsPsych.data.addDataToLastTrial({stop_acc: 0})
			SSD-=50
		}
	}
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
var practice_len = 12 // 24  must be divisible by 12 [3 (go go stop), by 2 (switch or stay) by 2 (mag or parity)]
var exp_len = 24 //324 must be divisible by 12
var numTrialsPerBlock = 12; //  60 divisible by 12
var numTestBlocks = exp_len / numTrialsPerBlock
var upper_stop_success_bound = 0.70
var lower_stop_success_bound = 0.30

var accuracy_thresh = 0.80
var missed_thresh = 0.30 // must it be higher than standard 10% since stopping is part of task??
var practice_thresh = 2 // 3 blocks of 24 trials
var SSD = 250
var maxSSD = 850
var minSSD = 0 

var predictive_conditions = [['switch','stay'],
							 ['stay','switch']]
							 
var predictive_dimensions_list = [stim = {dim:'magnitude', values: ['low','high']},
								  stim = {dim:'parity', values: ['odd','even']}]
							 	  
var possible_responses = ['M Key', 77],['Z Key', 90]]




var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/stop_signal_with_predictive_task_switching/images/"

var current_trial = 0

var task_boards = [[['<div class = bigbox><div class = decision-top-left><div class = centerbox><div class = cue-text><font size = "10">'],['</font></div></div></div></div>']],
				   [['<div class = bigbox><div class = decision-top-right><div class = centerbox><div class = cue-text><font size = "10">'],['</font></div></div></div></div>']],
				   [['<div class = bigbox><div class = decision-bottom-right><div class = centerbox><div class = cue-text><font size = "10">'],['</font></div></div></div></div>']],
				   [['<div class = bigbox><div class = decision-bottom-left><div class = centerbox><div class = cue-text><font size = "10">'],['</font></div></div></div></div>']]]

var stop_boards = [[['<div class = decision-top-left>'],['</div>']],
				   [['<div class = decision-top-right>'],['</div>']],
				   [['<div class = decision-bottom-right>'],['</div>']],
				   [['<div class = decision-bottom-left>'],['</div>']]]


var stims = createTrialTypes(practice_len)


var prompt_text_list = '<ul list-text>'+
						'<li>Do not respond if a star appears!</li>' +
						'<li>Top 2 quadrants: Judge number on '+predictive_dimensions_list[0].dim+'</li>' +
						'<li>'+predictive_dimensions_list[0].values[0]+': ' + possible_responses[0][0] + '</li>' +
						'<li>'+predictive_dimensions_list[0].values[1]+': ' + possible_responses[1][0] + '</li>' +
						'<li>Bottom 2 quadrants: Judge number on '+predictive_dimensions_list[1].dim+'</li>' +
						'<li>'+predictive_dimensions_list[1].values[0]+': ' + possible_responses[0][0] + '</li>' +
						'<li>'+predictive_dimensions_list[1].values[1]+': ' + possible_responses[1][0] + '</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Do not respond if a star appears!</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Top 2 quadrants: Judge number on '+predictive_dimensions_list[0].dim+'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">'+predictive_dimensions_list[0].values[0]+': ' + possible_responses[0][0] +  ' | ' + predictive_dimensions_list[0].values[1]+': ' + possible_responses[1][0] + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Bottom 2 quadrants: Judge number on '+predictive_dimensions_list[1].dim+'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">'+predictive_dimensions_list[1].values[0]+': ' + possible_responses[0][0] +  ' | ' + predictive_dimensions_list[1].values[1]+': ' + possible_responses[1][0] + '</p>' +
				  '</div>'
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

var test_img_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = decision-top-left><div class = centerbox><div class = cue-text><font size = "10" color = "blue">3</font></div></div></div></div>'+
			  stop_boards[0][0] + 
				preFileType + 'stopSignal' + fileTypePNG + 
			   stop_boards[0][1],
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

var practice1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = instructBox>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">This is what the first part of the trial will look like.  The number 3 is on the bottom left, so you would judge based on <strong>'+predictive_dimensions_list[1].dim+'</strong>.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press the <strong>'+possible_responses[0][0]+' if '+predictive_dimensions_list[1].values[0]+'</strong>, and the <strong>' + possible_responses[1][0] + ' if '+predictive_dimensions_list[1].values[1]+'</strong>.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = decision-bottom-left><div class = centerbox><div class = cue-text><font size = "10">3</font></div></div></div>'+
				
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
					'<p class = block-text style="font-size:24px; line-height:100%;">This is what the second part of the trial may look like.  On this trial, a star appeared around the number.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If a star appears, no matter which quadrant you are in, please try your best <strong>not to respond</strong> on that trial.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Do not slow down your responses to the number in order to wait for the star.  Continue to respond as quickly and as accurately as possible to the number and try your best not to respond, if a star appears.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = decision-bottom-left><div class = centerbox><div class = cue-text><font size = "10">3</font></div></div></div>'+
					stop_boards[3][0] + 
					preFileType + 'stopSignal' + fileTypePNG + 
					stop_boards[3][1] +
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
       trial_id: "post_task_questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};


var feedback_text = 
'Welcome to the experiment. This experiment will take less than 30 minutes. Press <strong>enter</strong> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
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
			'<p class = block-text>In this experiment, across trials you will see a single number moving clockwise on the screen in 4 quadrants.'+
			' On any trial, one quadrant will have a single number.</p> '+
		
			'<p class = block-text>You will be asked to judge the number on magnitude (higher or lower than 5) or parity (odd or even), depending on which quadrant '+
			'the number are in.</p>'+
		
			'<p class = block-text>In the top two quadrants, please judge the number based on <strong>'+predictive_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
			'  if '+predictive_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+predictive_dimensions_list[0].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>In the bottom two quadrants, please judge the number based on <strong>'+predictive_dimensions_list[1].dim+'.</strong>'+
			' Press the <strong>'+possible_responses[0][0]+' if '+predictive_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+
			' if '+predictive_dimensions_list[1].values[1]+'</strong>.</p>' +
		
		'</div>',
		
		'<div class = centerbox>'+
			'<p class = block-text>On some trials, a star will appear around the number.  The star will appear with, or shortly after the number appears.</p>'+
			
			'<p class = block-text>If you see a star appear, please try your best to make no response on that trial.</p>'+
		
			'<p class = block-text>Please do not slow down your responses to the number in order to wait for the star.  Continue to respond as quickly and accurately as possible to the number.</p>'+
					
			'<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules.  <i>This reminder will be taken out for test</i>.</p>'+
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

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: function(){
  	assessPerformance()
  	evalAttentionChecks()
  }
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	text: '<div class = centerbox>'+
			'<p class = block-text>We will now start the test portion</p>'+
			
			'<p class = block-text>Please judge the number on magnitude (higher or lower than 5) or parity (odd or even), depending on which quadrant '+
			'the numbers are in.</p>'+
	
			'<p class = block-text>In the top two quadrants, please judge the center number based on <strong>'+predictive_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
			'  if '+predictive_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+predictive_dimensions_list[0].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>In the bottom two quadrants, please judge the center number based on <strong>'+predictive_dimensions_list[1].dim+'.</strong>'+
			' Press the <strong>'+possible_responses[0][0]+' if '+predictive_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+
			' if '+predictive_dimensions_list[1].values[1]+'</strong>.</p>'+
	
			'<p class = block-text>On some trials, you will see a star appear with or shortly after the number. <strong>Do not respond if you see a star.</strong>  Do not slow down your responses to the number in order to wait for the star.</p>'+
	
			'<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>'+ 
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

var NoSSPracticeTrials = []
NoSSPracticeTrials.push(feedback_block)
for (i = 0; i < practice_len + 1; i++) {
	var fixation_block = {
		type: 'poldrack-single-stim',
		stimulus: getFixation,
		is_html: true,
		choices: 'none',
		data: {
			trial_id: "practice_fixation"
		},
		timing_response: 500, //500
		timing_post_trial: 0
	}

	var NoSSpractice_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		data: {
			"trial_id": "practice_trial"
		},
		key_answer: getResponse,
		correct_text: '<div class = fb_box><div class = center-text><font size =20>Correct!</font></div></div>',
		incorrect_text: '<div class = fb_box><div class = center-text><font size =20>Incorrect!</font></div></div>',
		timeout_message: '<div class = fb_box><div class = center-text><font size =20>Respond Faster!</font></div></div>',
		show_stim_with_feedback: false,
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		timing_stim: 850,
		timing_response: 1850,
		response_ends_trial: false,
		timing_post_trial: 0,
		on_finish: appendData,
	}
	NoSSPracticeTrials.push(fixation_block)
	NoSSPracticeTrials.push(NoSSpractice_block)
}

var NoSSPracticeNode = {
	timeline: NoSSPracticeTrials,
	loop_function: function(data){
		practiceCount += 1
		stims = createTrialTypes(practice_len)
		current_trial = 0
	
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
	
		for (var i = 0; i < data.length; i++){
			if ((data[i].trial_id == "practice_trial") && (data[i].stop_signal_condition == 'go')){
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
			practiceCount = 0
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



var practiceTrials = []
practiceTrials.push(feedback_block)
practiceTrials.push(instructions_block)

for (i = 0; i < practice_len + 1; i++) {
	var fixation_block = {
		type: 'poldrack-single-stim',
		stimulus: getFixation,
		is_html: true,
		choices: 'none',
		data: {
			trial_id: "practice_fixation"
		},
		timing_response: 500, //500
		timing_post_trial: 0,
		prompt: prompt_text
	}
	
	var practice_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType, //getSSType,
		data: {
			"trial_id": "practice_with_stop"
		},
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		timing_stim: 850,
		timing_response: 1850,
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500,
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: prompt_text,
		on_start: function(){
			stoppingTracker = []
			stoppingTimeTracker = []
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

	  };
	
	practiceTrials.push(fixation_block)
	practiceTrials.push(practice_block)
	practiceTrials.push(categorize_block)
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
		var total_stop_trials = 0
		var stop_succeed = 0
		var stop_fail = 0
	
		for (var i = 0; i < data.length; i++){
			if ((data[i].trial_id == "practice_with_stop") && (data[i].stop_signal_condition == 'go')){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
		
					}
				}
		
			} else if ((data[i].trial_id == "practice_with_stop") && (data[i].stop_signal_condition == 'stop')){
				total_stop_trials += 1
				if (data[i].rt != -1){
					stop_fail += 1
					
				} else if (data[i].rt == -1){
					stop_succeed += 1
					
				}
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
		var stop_success_percentage = stop_succeed / total_stop_trials
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(ave_rt) + " ms. 	Accuracy: " + Math.round(accuracy * 100)+ "%</strong>"

		if (accuracy > accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Done with this practice. Press Enter to continue.' 
			stims = createTrialTypes(numTrialsPerBlock)
			return false
	
		} else if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_text_list
			
			if (stop_success_percentage > upper_stop_success_bound){
			feedback_text +=
					'</p><p class = block-text>You have been responding too slowly. Please respond as quickly as possible without sacrificing accuracy.'
			}
			
			if (stop_success_percentage < lower_stop_success_bound){
			feedback_text +=
					'</p><p class = block-text>You have been responding on trials where there are stars. If a star appears, try your best not to make a response on that trial.'
			}
			
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
testTrials.push(attention_node)
for (i = 0; i < numTrialsPerBlock + 1; i++) {
	var fixation_block = {
		type: 'poldrack-single-stim',
		stimulus: getFixation,
		is_html: true,
		choices: 'none',
		data: {
			trial_id: "test_fixation"
		},
		timing_response: 500, //500
		timing_post_trial: 0
	}
	
	var test_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType,
		data: {
			"trial_id": "test_trial"
		},
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		timing_stim: 850,
		timing_response: 1850,
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500,
		timing_post_trial: 0,
		on_finish: appendData,
		on_start: function(){
			stoppingTracker = []
			stoppingTimeTracker = []
		}
	}
	testTrials.push(fixation_block)
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
		var total_stop_trials = 0
		var stop_succeed = 0
		var stop_fail = 0
	
		for (var i = 0; i < data.length; i++){
			if ((data[i].trial_id == "test_trial") && (data[i].stop_signal_condition == 'go')){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
		
					}
				}
		
			}  else if ((data[i].trial_id == "test_trial") && (data[i].stop_signal_condition == 'stop')){
				total_stop_trials += 1
				if (data[i].rt != -1){
					stop_fail += 1
					
				} else if (data[i].rt == -1){
					stop_succeed += 1
					
				}
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
		var stop_success_percentage = stop_succeed / total_stop_trials
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(ave_rt) + " ms. 	Accuracy: " + Math.round(accuracy * 100)+ "%</strong>"
		feedback_text += "</p><p class = block-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
		
		if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_text_list
		}
		
		if (stop_success_percentage > upper_stop_success_bound){
			feedback_text +=
					'</p><p class = block-text>You have been responding too slowly. Please respond as quickly as possible without sacrificing accuracy.'
		}
		
		if (stop_success_percentage < lower_stop_success_bound){
			feedback_text +=
					'</p><p class = block-text>You have been responding on trials where there are stars. If a star appears, try your best not to make a response on that trial.'
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
stop_signal_with_predictive_task_switching_experiment = []


//stop_signal_with_predictive_task_switching_experiment.push(instruction_node)

//stop_signal_with_predictive_task_switching_experiment.push(practice1)
//stop_signal_with_predictive_task_switching_experiment.push(practice2)

//stop_signal_with_predictive_task_switching_experiment.push(test_img_block)

//stop_signal_with_predictive_task_switching_experiment.push(NoSSPracticeNode)

stop_signal_with_predictive_task_switching_experiment.push(practiceNode)

stop_signal_with_predictive_task_switching_experiment.push(start_test_block)

stop_signal_with_predictive_task_switching_experiment.push(testNode)

stop_signal_with_predictive_task_switching_experiment.push(post_task_block)

stop_signal_with_predictive_task_switching_experiment.push(end_block)
