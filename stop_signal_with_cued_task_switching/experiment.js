/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'stop_signal_with_cued_task_switching'})
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

var getCategorizeFeedback = function(){
	curr_trial = jsPsych.progress().current_trial_global - 1
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	
	if ((trial_id == 'practice_trial') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition != 'stop')){
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

var getCorrectResponse = function(number, cued_dimension, stop_signal_condition){
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
	
	if (stop_signal_condition == "stop"){
		correct_response = -1
	}
	
	return [correct_response,magnitude,parity]

}

							 
var createTrialTypes = function(numTrialsPerBlock){
	stop_signal_trial_types = ['go','go','stop']
	
	cued_dimension = cued_dimensions[Math.floor(Math.random() * 2)]
	stop_signal_condition = stop_signal_trial_types[Math.floor(Math.random() * 3)]
	numbers = [1,2,3,4,6,7,8,9]		
	
	first_stim = {
		cued_dimension: cued_dimension,
		cued_condition: 'N/A',
		stop_signal_condition: stop_signal_condition
	}
	
	var stims = []
	for(var numIterations = 0; numIterations < numTrialsPerBlock/6; numIterations++){
		for (var numstop_signalConds = 0; numstop_signalConds < stop_signal_trial_types.length; numstop_signalConds++){
			for (var numCuedConds = 0; numCuedConds < cued_conditions.length; numCuedConds++){
			
				cued_dimension = 'N/A'
				cued_condition = cued_conditions[numCuedConds]
				stop_signal_condition = stop_signal_trial_types[numstop_signalConds]
				
				
				stim = {
					cued_dimension: cued_dimension,
					cued_condition: cued_condition,
					stop_signal_condition: stop_signal_condition
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
		stop_signal_condition = stim.stop_signal_condition
		cued_dimension = stim.cued_dimension
		
		if (cued_condition == "switch"){
			cued_dimension = randomDraw(['magnitude','parity'].filter(function(y) {return $.inArray(y, [last_dim]) == -1}))
		} else if (cued_condition == "stay"){
			cued_dimension = last_dim
		}
		//console.log('condition = '+cued_condition+', stop_signal_condition: '+ stop_signal_condition+', cued_dimension: '+cued_dimension)
		
		number = numbers[Math.floor((Math.random() * 8))]
	
		response_arr = getCorrectResponse(number, cued_dimension, stop_signal_condition)
		
			
		stim = {
			cued_dimension: cued_dimension,
			cued_condition: cued_condition,
			stop_signal_condition: stop_signal_condition,
			magnitude: response_arr[1],
			parity: response_arr[2],
			correct_response: response_arr[0],
			number: number
			}
		
		new_stims.push(stim)
		

	}
	return new_stims	
}
	
var getNextStim = function(){
	stim = stims.shift()
	cued_condition = stim.cued_condition
	cued_dimension = stim.cued_dimension
	stop_signal_condition = stim.stop_signal_condition
	number = stim.number
	correct_response = stim.correct_response
	magnitude = stim.magnitude
	parity = stim.parity
	
	/*
	console.log('# = '+number+', stop_cond = '+stop_signal_condition+
				', whichQuad = '+whichQuadrant+', pred_dim = '+cued_dimension+
				'pred_cond = '+cued_condition+ ', correct_response = '+correct_response)
	*/
}

var getCue = function(){
	return '<div class = centerbox><div class = cue-text><font size = "10">'+cued_dimension+'</font></div></div>'

}

function getSSD(){
	return SSD
}

function getSSType(){
	return stop_signal_condition

}

var getStopStim = function(){
	return stop_boards[0] + 
		   	preFileType + 'stopSignal' + fileTypePNG + 
		   stop_boards[1] 
}


var getStim = function(){
	
	return task_boards[0] + 
				number +
		   task_boards[1]
		   		   
	
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
		stop_signal_condition: stop_signal_condition,
		number: number,
		correct_response: correct_response,
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

var accuracy_thresh = 0.80
var missed_thresh = 0.30 // must it be higher than standard 10% since stopping is part of task??
var practice_thresh = 2 // 3 blocks of 24 trials
var SSD = 250
var maxSSD = 850
var minSSD = 0 

var cued_conditions = jsPsych.randomization.repeat(['stay','switch'],1)
var cued_dimensions = jsPsych.randomization.repeat(['magnitude','parity'],1)
							 
var cued_dimensions_list = jsPsych.randomization.repeat([stim = {dim:'magnitude', values: jsPsych.randomization.repeat(['high','low'],1)},
								  						 stim = {dim:'parity', values: jsPsych.randomization.repeat(['odd','even'],1)}],1)
							 	  
var possible_responses = jsPsych.randomization.repeat([['M Key', 77],['Z Key', 90]],1)




var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/stop_signal_with_cued_task_switching/images/"
var pathSource = "/static/experiments/stop_signal_with_cued_task_switching/images/"


var current_trial = 0
var current_block = 0




var task_boards = ['<div class = bigbox><div class = centerbox><div class = cue-text><font size = "10">','</font><div></div><div></div>']				

var stop_boards = ['<div class = centerbox><div class = stopbox>','</div></div>']


var stims = createTrialTypes(practice_len)

var prompt_text_list = '<ul list-text>'+
						'<li>Cue was '+cued_dimensions_list[0].dim+': Judge number on '+cued_dimensions_list[0].dim+'</li>' +
						'<li>'+cued_dimensions_list[0].values[0]+': ' + possible_responses[0][0] + '</li>' +
						'<li>'+cued_dimensions_list[0].values[1]+': ' + possible_responses[1][0] + '</li>' +
						'<li>Cue was '+cued_dimensions_list[1].dim+': '+cued_dimensions_list[1].dim+'</li>' +
						'<li>'+cued_dimensions_list[1].values[0]+': ' + possible_responses[0][0] + '</li>' +
						'<li>'+cued_dimensions_list[1].values[1]+': ' + possible_responses[1][0] + '</li>' +
						'<li>Do not respond if a star appears!</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Cue was '+cued_dimensions_list[0].dim+': Judge number on '+cued_dimensions_list[0].dim+'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">'+cued_dimensions_list[0].values[0]+': ' + possible_responses[0][0]  + ' | ' + cued_dimensions_list[0].values[1]+': ' + possible_responses[1][0] +  '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Cue was '+cued_dimensions_list[1].dim+': '+cued_dimensions_list[1].dim+'</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">'+cued_dimensions_list[1].values[0]+': ' + possible_responses[0][0]  + ' | ' + cued_dimensions_list[1].values[1]+': ' + possible_responses[1][0] +  '</p>' +
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
					'<p class = block-text style="font-size:24px; line-height:100%;">This is what the first part of the trial will look like.  You will see a fixation point. There is no need to respond on this part of the trial.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">The cue will appear where the fixation is.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = centerbox><div class = fixation>+</div></div>'+
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
					'<p class = block-text style="font-size:24px; line-height:100%;">This is what the second part of the trial will look like.  You will see the cue appear, which will instruct you how to respond to the upcoming number.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If you see the cue '+cued_dimensions_list[0].dim+', please judge the number based on <strong>'+cued_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
					'  if '+cued_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+cued_dimensions_list[0].values[1]+'</strong>.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If you see the cue '+cued_dimensions_list[1].dim+', please judge the number based on <strong>'+cued_dimensions_list[1].dim+'.</strong>'+
					' Press the <strong>'+possible_responses[0][0]+' if '+cued_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+ ' if ' +cued_dimensions_list[1].values[1]+'</strong>.</p>'+
				'</div>'+
				
				'<div class = centerbox><div class = cue-text><font size = "10">Magnitude</font></div></div>'+
				
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

var practice3 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = instructBox>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">This is what the last part of the trial will look like.  Now you will see the number, and will need to respond.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If you saw the cue '+cued_dimensions_list[0].dim+', please judge the number based on <strong>'+cued_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
					'  if '+cued_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+cued_dimensions_list[0].values[1]+'</strong>.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If you saw the cue '+cued_dimensions_list[1].dim+', please judge the number based on <strong>'+cued_dimensions_list[1].dim+'.</strong>'+
					' Press the <strong>'+possible_responses[0][0]+' if '+cued_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+ ' if ' +cued_dimensions_list[1].values[1]+'</strong>.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = centerbox><div class = cue-text><font size = "10">9</font></div></div>'+
				
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

var practice4 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = instructBox>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">On some trials, a star will appear around the number.  The star will appear with, or shortly after the number appears.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If you see a star, please try you best to not make a response on that trial.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Do not slow down your responses to the number in order to wait for the star.  Continue to respond as quickly and accurate as possible to the number.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press enter to start practice.</p>'+
				'</div>'+
				
				'<div class = centerbox>'+
					'<div class = cue-text><font size = "10">9</font></div>'+
					'<div class = stopbox>' + preFileType + 'stopSignal' + fileTypePNG + '</div>'+
				'</div>'+
				
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


var feedback_text = 'We will start practice. During practice, you will receive a prompt to remind you of the rules.  <strong>This prompt will be removed for test!</strong> Press <strong>enter</strong> to begin.'
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
		
			'<p class = block-text>In this experiment you will see a cue, either magnitude or parity, followed by a single number.</p> '+
		
			'<p class = block-text>You will be asked to judge the number on magnitude (higher or lower than 5) or parity (odd or even), depending on which cue you see.</p>'+
		
			'<p class = block-text>If you see the cue '+cued_dimensions_list[0].dim+', please judge the number based on <strong>'+cued_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
				'  if '+cued_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+cued_dimensions_list[0].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>If you see the cue '+cued_dimensions_list[1].dim+', please judge the number based on <strong>'+cued_dimensions_list[1].dim+'.</strong>'+
			' Press the <strong>'+possible_responses[0][0]+' if '+cued_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+ ' if ' +cued_dimensions_list[1].values[1]+'</strong>.</p>'+
			
			'<p class = block-text>The cue will change from trial to trial.</p>'+
			
		'</div>',
		
		'<div class = centerbox>'+
		
			'<p class = block-text>On some trials, a star will appear around the number.  The star will appear with, or shortly after the number appears.</p>'+
			
			'<p class = block-text>If you see a star appear, please try your best to make no response on that trial.</p>'+
		
			'<p class = block-text>Please do not slow down your responses to the number in order to wait for the star.  Continue to respond as quickly and accurately as possible to the number.</p>'+
					
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

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
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
			
			'<p class = block-text>In this experiment you will see a cue, either magnitude or parity, followed by a single number.</p> '+
		
			'<p class = block-text>You will be asked to judge the number on magnitude (higher or lower than 5) or parity (odd or even), depending on which cue you see.</p>'+
		
			'<p class = block-text>If you see the cue '+cued_dimensions_list[0].dim+', please judge the number based on <strong>'+cued_dimensions_list[0].dim+'</strong>. Press the <strong>'+possible_responses[0][0]+
				'  if '+cued_dimensions_list[0].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+'  if '+cued_dimensions_list[0].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>If you see the cue '+cued_dimensions_list[1].dim+', please judge the number based on <strong>'+cued_dimensions_list[1].dim+'.</strong>'+
			' Press the <strong>'+possible_responses[0][0]+' if '+cued_dimensions_list[1].values[0]+'</strong>, and the <strong>'+possible_responses[1][0]+ ' if ' +cued_dimensions_list[1].values[1]+'</strong>.</p>'+
		
			'<p class = block-text>On some trials, a star will appear around the number.  The star will appear with, or shortly after the number appears.</p>'+
			
			'<p class = block-text>If you see a star appear, please try your best to make no response on that trial.</p>'+
		
			'<p class = block-text>Please do not slow down your responses to the number in order to wait for the star.  Continue to respond as quickly and accurately as possible to the number.</p>'+
	
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



var practiceTrials = []
practiceTrials.push(feedback_block)
for (i = 0; i < practice_len + 1; i++) {
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
		on_finish: getNextStim,
		prompt: prompt_text
	}
	
	var cue_block = {
		type: 'poldrack-single-stim',
		stimulus: getCue,
		is_html: true,
		choices: 'none',
		data: {
			trial_id: "practice_cue"
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
			"trial_id": "practice_trial"
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
		prompt: prompt_text
	  };
	practiceTrials.push(fixation_block)
	practiceTrials.push(cue_block)
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
	var fixation_block = {
		type: 'poldrack-single-stim',
		stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
		is_html: true,
		choices: 'none',
		data: {
			trial_id: "test_fixation"
		},
		timing_response: 500, //500
		timing_post_trial: 0,
		on_finish: getNextStim
	}
	
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
			if ((data[i].trial_id == "test_trial") && (data[i].stop_signal_condition == 'go')){
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



/* create experiment definition array */
stop_signal_with_cued_task_switching_experiment = []

//stop_signal_with_cued_task_switching_experiment.push(test_img_block)

stop_signal_with_cued_task_switching_experiment.push(instruction_node)

stop_signal_with_cued_task_switching_experiment.push(practice1)

stop_signal_with_cued_task_switching_experiment.push(practice2)

stop_signal_with_cued_task_switching_experiment.push(practice3)

stop_signal_with_cued_task_switching_experiment.push(practice4)

stop_signal_with_cued_task_switching_experiment.push(practiceNode)

stop_signal_with_cued_task_switching_experiment.push(start_test_block)

stop_signal_with_cued_task_switching_experiment.push(testNode)

stop_signal_with_cued_task_switching_experiment.push(post_task_block)

stop_signal_with_cued_task_switching_experiment.push(end_block)
