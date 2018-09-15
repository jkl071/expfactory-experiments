/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'cued_predictive_task_switching'})
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

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

function getAllIndexesList(arr,val){
	all_indexes = []
	for(var i = 0; i < arr.length; i++){
		indexes = getAllIndexes(arr[i],val)
		if (indexes.length !== 0){
			indexes.push(i)
			all_indexes.push(indexes)
		}
	}
	//this function will return an array, temp, containing indexes for the item, val, in the list of lists, arr.  
	//Temp, will have as many lists, as how many list in lists that we can find at least 1 match for the item, val.  The values in each list in temp, are the indexes for that val in that list from the list of lists
	//The LAST value in each of the lists in, temp, shows which of the lists in arr, the indexes were found from.  
	
	// this function searches a list of list containing strings, for a value.  Will itterively search each list in lists, for a str.
	return all_indexes
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

var getCue = function(){
	stim = stims.shift()
	left_number = stim.left_number
	left_magnitude = stim.left_magnitude
	left_parity = stim.left_parity
	right_number = stim.right_number
	right_magnitude = stim.right_magnitude
	right_parity = stim.right_parity
	correct_response = stim.correct_response
	whichQuadrant = stim.whichQuadrant
	
	cued_condition = stim.cued_condition
	cued_dimension = stim.cued_dimension
	predictive_condition = stim.predictive_condition
	predictive_dimension = stim.predictive_dimension
	
	return task_boards[whichQuadrant - 1][0] + '<div class = centerbox><div class = cue-text>'+cued_dimension+'</div></div>'+ 
		   task_boards[whichQuadrant - 1][1]
}

var getStim = function(){	
		
	return task_boards[whichQuadrant - 1][0] + 
		   '<div class = centerbox>'+
		   	'<div class = left-text>'+left_number+'</div>'+
		   	'<div class = right-text>'+right_number+'</div>'+
		   '</div>'+
		   task_boards[whichQuadrant - 1][1]
	
}

var getCorrectResponse = function(number, predictive_dimension){
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
	
	var cued_condition_type_list = []
	for(var i = 0; i < 4; i++){
		cued_condition_type_list.push(jsPsych.randomization.repeat(['switch','stay'], numTrialsPerBlock/8))
	}
	
	
	predictive_dimension = predictive_dimensions[whichQuadStart - 1]
	cued_dimension = jsPsych.randomization.repeat(['left','right'],1).pop()
	
	if (cued_dimension == 'left'){
		left_number = numbers[Math.floor((Math.random() * 8))]
		right_number = randomDraw(numbers.filter(function(y) {return y != left_number}))	
		
		left_response_arr = getCorrectResponse(left_number,predictive_dimension)
		right_response_arr = getCorrectResponse(left_number,predictive_dimension)
		
		correct_response = left_response_arr[0]
		
		left_magnitude = left_response_arr[1]
		left_parity = left_response_arr[2]
		right_magnitude = right_response_arr[1]
		right_parity = right_response_arr[2]
	} else if (cued_dimension == 'right'){
		right_number = numbers[Math.floor((Math.random() * 8))]
		left_number = randomDraw(numbers.filter(function(y) {return y != right_number}))
		
		left_response_arr = getCorrectResponse(left_number,predictive_dimension)
		right_response_arr = getCorrectResponse(right_number,predictive_dimension)
		
		correct_response = right_response_arr[0]
		
		left_magnitude = left_response_arr[1]
		left_parity = left_response_arr[2]
		right_magnitude = right_response_arr[1]
		right_parity = right_response_arr[2]
	}
	
	
	
	var stims = []
	
	var first_stim = {
		whichQuadrant: whichQuadStart,
		predictive_condition: 'N/A',
		predictive_dimension: predictive_dimension,
		cued_condition: 'N/A',
		cued_dimension: cued_dimension,
		left_number: left_number,
		left_magnitude: left_magnitude,
		left_parity: left_parity,
		right_number: right_number,
		right_magnitude: right_magnitude,
		right_parity: right_parity,
		correct_response: correct_response
		}
	stims.push(first_stim)
	

	for (var i = 0; i < numTrialsPerBlock; i++){
		whichQuadStart += 1
		quadIndex = whichQuadStart%4
		if (quadIndex == 0){
			quadIndex = 4
		}
		cued_condition = cued_condition_type_list[quadIndex - 1].pop()
		predictive_dimension = predictive_dimensions[quadIndex - 1]
		predictive_condition = predictive_cond_array[i%2]
		last_dim = cued_dimension
		
		if (cued_condition == 'switch'){
			cued_dimension = randomDraw(['left','right'].filter(function(y) {return $.inArray(y, [last_dim]) == -1}))
		} else if (cued_condition == 'stay'){
			cued_dimension = last_dim
		}
	
		if (cued_dimension == 'left'){
			left_number = numbers[Math.floor((Math.random() * 8))]
			right_number = randomDraw(numbers.filter(function(y) {return y != left_number}))	
		
			left_response_arr = getCorrectResponse(left_number,predictive_dimension)
			right_response_arr = getCorrectResponse(right_number,predictive_dimension)
		
			correct_response = left_response_arr[0]
		
			left_magnitude = left_response_arr[1]
			left_parity = left_response_arr[2]
			
			right_magnitude = right_response_arr[1]
			right_parity = right_response_arr[2]
		} else if (cued_dimension == 'right'){
			right_number = numbers[Math.floor((Math.random() * 8))]
			left_number = randomDraw(numbers.filter(function(y) {return y != right_number}))
		
			left_response_arr = getCorrectResponse(left_number,predictive_dimension)
			right_response_arr = getCorrectResponse(right_number,predictive_dimension)
		
			correct_response = right_response_arr[0]
		
			left_magnitude = left_response_arr[1]
			left_parity = left_response_arr[2]
			right_magnitude = right_response_arr[1]
			right_parity = right_response_arr[2]
		}
		
		stim = {
			whichQuadrant: quadIndex,
			predictive_condition: predictive_condition,
			predictive_dimension: predictive_dimension,
			cued_condition: cued_condition,
			cued_dimension: cued_dimension,
			left_number: left_number,
			left_magnitude: left_magnitude,
			left_parity: left_parity,
			right_number: right_number,
			right_magnitude: right_magnitude,
			right_parity: right_parity,
			correct_response: correct_response
			}
		
		stims.push(stim)		
	}
	return stims	
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
		whichQuadrant: quadIndex,
		predictive_condition: predictive_condition,
		predictive_dimension: predictive_dimension,
		cued_condition: cued_condition,
		cued_dimesion: cued_dimension,
		left_number: left_number,
		left_magnitude: left_magnitude,
		left_parity: left_parity,
		right_number: right_number,
		right_magnitude: right_magnitude,
		right_parity: right_parity,
		correct_response: correct_response,
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


var practice_len = 16 // 16
var exp_len = 320 //320 must be divisible by 16
var numTrialsPerBlock = 64 // must be divisible by 16
var numTestBlocks = exp_len / numTrialsPerBlock

var accuracy_thresh = 0.80
var missed_thresh = 0.10

var practice_thresh = 3 // 3 blocks of 24 trials

var pathSource = "/static/experiments/cued_predictive_task_switching/images/"
var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/cued_predictive_task_switching/images/"


var numbers_list = [[6,8],[7,9],[2,4],[1,3]]

var predictive_conditions = [['switch','stay'],
							 ['stay','switch']]
							 
var predictive_dimensions_list = jsPsych.randomization.repeat([stim = {dim:'magnitude', values: jsPsych.randomization.repeat(['high','low'],1)},
								  							   stim = {dim:'parity', values: jsPsych.randomization.repeat(['odd','even'],1)}],1)
							 	  
var possible_responses = jsPsych.randomization.repeat([['M Key', 77],['Z Key', 90]],1)

var cued_conditions = jsPsych.randomization.repeat(['stay','switch'],1)
var cued_dimensions = jsPsych.randomization.repeat(['right','left'],1)

var current_trial = 0

var prompt_text_list = '<ul list-text>'+
						'<li>Top 2 quadrants: Judge cued number on '+predictive_dimensions_list[0].dim+'</li>' +
						'<li>'+predictive_dimensions_list[0].values[0]+': ' + possible_responses[0][0] + '</li>' +
						'<li>'+predictive_dimensions_list[0].values[1]+': ' + possible_responses[1][0] + '</li>' +
						'<li>Bottom 2 quadrants: Judge cued number on '+predictive_dimensions_list[1].dim+'</li>' +
						'<li>'+predictive_dimensions_list[1].values[0]+': ' + possible_responses[0][0] + '</li>' +
						'<li>'+predictive_dimensions_list[1].values[1]+': ' + possible_responses[1][0] + '</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Top 2 quadrants: Judge cued number on '+predictive_dimensions_list[0].dim+'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">'+predictive_dimensions_list[0].values[0]+': ' + possible_responses[0][0] + ' | ' + predictive_dimensions_list[0].values[1]+': ' + possible_responses[1][0] + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Bottom 2 quadrants: Judge cued number on '+predictive_dimensions_list[1].dim+'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">'+predictive_dimensions_list[1].values[0]+': ' + possible_responses[0][0] + ' | ' + predictive_dimensions_list[1].values[1]+': ' + possible_responses[1][0] + '</p>' +
				  '</div>' 

/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var task_boards = [[['<div class = bigbox><div class = decision-top-left>'],['</div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div>']],
				   [['<div class = bigbox><div class = decision-top-left></div><div class = decision-top-right>'],['</div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div>']],
				   [['<div class = bigbox><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right>'],['</div><div class = decision-bottom-left></div></div>']],
				   [['<div class = bigbox><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left>'],['</div></div>']]]



var stims = createTrialTypes(practice_len)

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */

var test_img_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = decision-bottom-left><div class = centerbox>'+
				'<div class = left-text>9</div>'+
				'<div class = right-text>2</div>'+
				'<div class = cue-text>right</div>'+
			  '</div></div></div>',
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
					'<p class = block-text style="font-size:24px;">This is what the first part of the trial will look like.  The cue, <strong> right</strong>, is on the bottom left of the screen. </p>'+
					'<p class = block-text style="font-size:24px;">After the cue disappears you will see 2 numbers appear, one on the right and one on the left.  The cue will instruct which number to judge!</p>'+
					'<p class = block-text style="font-size:24px;">Since the cue was <strong> right</strong>, please judge the upcoming right number!</p>'+
					'<p class = block-text style="font-size:24px;">Press enter to continue.</p>'+
				'</div>'+
				
				'<div class = decision-bottom-left><div class = centerbox>'+
					'<div class = cue-text>right</div>'+
				'</div></div>' +
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
					'<p class = block-text style="font-size:24px;">This is what the second part of the trial will look like.  The numbers are in the bottom of the screen. Since the cue you saw was <strong> right</strong>, please judge the right number on '+predictive_dimensions_list[1].dim+'. If '+predictive_dimensions_list[1].values[0]+', press '+possible_responses[0][0]+'.  If '+predictive_dimensions_list[1].values[1]+', press '+possible_responses[1][0]+'.</p>'+
					'<p class = block-text style="font-size:24px;">If the numbers were on the top of the screen, please judge right number on '+predictive_dimensions_list[0].dim+'. If '+predictive_dimensions_list[0].values[0]+', press '+possible_responses[0][0]+'.  If '+predictive_dimensions_list[0].values[1]+', press '+possible_responses[1][0]+'.</p>'+
					'<p class = block-text style="font-size:24px;">During practice and test trials, the numbers will move clockwise from trial to trial.  <strong>Please judge the cued number based on magnitude or parity, depending on if you were on the top or bottom quadrants!</strong></p>'+
					'<p class = block-text style="font-size:24px;">Press enter to start practice.</p>'+
				'</div>'+
				
				'<div class = decision-bottom-left><div class = centerbox>'+
					'<div class = left-text>9</div>'+
					'<div class = right-text>2</div>'+
				'</div></div>' +
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

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
    	exp_id: 'cued_with_predictive_task_switching'
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
			'<p class = block-text>In this experiment, across trials you will see a cue, either <strong>right</strong> or <strong>left</strong>, followed by 2 numbers moving clockwise on the screen in 4 quadrants.  '+
			'On any trial, one quadrant will have a cue, followed by 2 numbers.</p> '+
		
			'<p class = block-text>The cue will instruct you which of the following 2 numbers, you must make a judgement on.</p>'+
			
			'<p class = block-text>If you saw the cue, <strong>right</strong>, please judge the upcoming right number.</p>'+
			
			'<p class = block-text>If you saw the cue, <strong>left</strong>, please judge the upcoming left number.</p>'+
			
		
		'</div>',
		
		'<div class = centerbox>'+
			'<p class = block-text>You will be asked to judge the <strong>cued number </strong>on magnitude (higher or lower than 5) or parity (odd or even), depending on which quadrant '+
			'the cue and numbers are in.</p>'+
			
			'<p class = block-text>In the top two quadrants, please judge the cued number based on <strong>'+predictive_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
			'  if '+predictive_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+predictive_dimensions_list[0].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>In the bottom two quadrants, please judge the cued number based on <strong>'+predictive_dimensions_list[1].dim+'.</strong>'+
			' Press the <strong>'+possible_responses[0][0]+' if '+predictive_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+
			' if '+predictive_dimensions_list[1].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>Please judge only the cued number for that trial!</p>'+
			
			'<p class = block-text>We will show you what a trial looks like when you finish instructions. Please make sure you understand the instructions before moving on.</p>'+
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
			
			'<p class = block-text>You will see a cue, either <strong>right</strong> or <strong>left</strong>, which will instruct you to judge the upcoming <strong>right</strong> or <strong>left</strong> number, respectively.</p>'+
			
			'<p class = block-text>Please judge the <strong>cued number </strong>on magnitude (higher or lower than 5) or parity (odd or even), depending on which quadrant '+
			'the cues and numbers are in.</p>'+
			
			'<p class = block-text>In the top two quadrants, please judge the cued number based on <strong>'+predictive_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
			'  if '+predictive_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+predictive_dimensions_list[0].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>In the bottom two quadrants, please judge the cued number based on <strong>'+predictive_dimensions_list[1].dim+'.</strong>'+
			' Press the <strong>'+possible_responses[0][0]+' if '+predictive_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+
			' if '+predictive_dimensions_list[1].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>Please judge only the cued number for that trial!</p>'+
	
			'<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>'+ 
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



var feedback_text = 'We will start practice. During practice, you will receive a prompt to remind you of the rules.  <strong>This prompt will be removed for test!</strong> Press <strong>enter</strong> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		exp_id: "cued_predictive_task_switching",
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
	var cue_block = {
		type: 'poldrack-single-stim',
		stimulus: getCue,
		is_html: true,
		data: {
			"trial_id": "practice_cue_block",
		},
		choices: 'none',
		timing_stim: 500,
		timing_response: 500,
		timing_post_trial: 0,
		response_ends_trial: false,
		prompt: prompt_text
	}
	
	var practice_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		key_answer: getResponse,
		data: {
			trial_id: "practice_trial"
			},
		correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text,
		incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text,
		timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text,
		timing_stim: 2000, //2000
		timing_response: 2000,
		timing_feedback: 500, //500
		show_stim_with_feedback: false,
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: prompt_text
	}
	//practiceTrials.push(fixation_block)
	practiceTrials.push(cue_block)
	practiceTrials.push(practice_block)
}

var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
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
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_text_list 
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
		data: {
			"trial_id": "test_cue_block",
		},
		choices: 'none',
		timing_stim: 500,
		timing_response: 500,
		timing_post_trial: 0,
		response_ends_trial: false,
	}
	
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
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_text_list 
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


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var cued_predictive_task_switching_experiment = []

cued_predictive_task_switching_experiment.push(instruction_node);

cued_predictive_task_switching_experiment.push(practice1);

cued_predictive_task_switching_experiment.push(practice2);

cued_predictive_task_switching_experiment.push(practiceNode);

cued_predictive_task_switching_experiment.push(start_test_block);

cued_predictive_task_switching_experiment.push(testNode);

cued_predictive_task_switching_experiment.push(end_block);
