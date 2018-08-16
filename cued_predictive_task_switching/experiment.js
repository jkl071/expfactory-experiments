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


function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

var getResponse = function() {
	return correct_response
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

var getCorrectResponse = function(magnitude,color,parity,size,predictive_dimension,cued_dimension){
	if (predictive_dimension == 'magnitude'){
			var first_dim = magnitude
		} else if (predictive_dimension == 'parity'){
			var first_dim = parity
		} else if (predictive_dimension == 'color'){
			var first_dim = color
		} else if (predictive_dimension == 'size'){
			var first_dim = size
		}
		
		if (cued_dimension == 'magnitude'){
			var second_dim = magnitude
		} else if (cued_dimension == 'parity'){
			var second_dim = parity
		} else if (cued_dimension == 'color'){
			var second_dim = color
		} else if (cued_dimension == 'size'){
			var second_dim = size
		}
		
		this_combo = first_dim + '_' + second_dim
		reverse_combo = second_dim + '_' + first_dim
		combo_index = getAllIndexesList(allCombos,this_combo)
		if (combo_index.length == 0){
			combo_index = getAllIndexesList(allCombos,reverse_combo)
		}
		
		correct_response = possible_responses[combo_index[0][1]]
		return correct_response
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


var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}

var getCue = function(){
	stim = stims.shift()
	magnitude = stim.magnitude
	color = stim.color
	parity = stim.parity
	size = stim.size
	number = stim.number
	whichQuadrant = stim.whichQuad
	correct_response = stim.correct_response
	
	cued_condition = stim.cued_condition
	cued_dimension = stim.cued_dimension
	predictive_condition = stim.predictive_condition
	predictive_dimension = stim.predictive_dimension
	
	return '<div class = centerbox><div class = cue-text><font size = 36>'+cued_dimension+'</font></div></div>'	
}


var getStim = function(){	
		
	return task_boards[whichQuadrant - 1][0] + preFileType + size + '_' + color + '_' + 
	magnitude + '_' + parity + '_' + number + fileTypePNG + task_boards[whichQuadrant - 1][1]
	
}


var createTrialTypes = function(numTrialsPerBlock){
	// 1 or 3 is stay for predictive
	// 2 or 4 is switch for predictive
	
	var whichQuadStart = jsPsych.randomization.repeat([1,2,3,4],1).pop()
	//1 2
	//4 3
	var predictive_cond_array = predictive_conditions[whichQuadStart%2]
	
	var cue_trial_type_list = []
	var cue_trial_types1 = jsPsych.randomization.repeat(['switch','stay'], numTrialsPerBlock/8)
	var cue_trial_types2 = jsPsych.randomization.repeat(['switch','stay'], numTrialsPerBlock/8)
	var cue_trial_types3 = jsPsych.randomization.repeat(['switch','stay'], numTrialsPerBlock/8)
	var cue_trial_types4 = jsPsych.randomization.repeat(['switch','stay'], numTrialsPerBlock/8)
	cue_trial_type_list.push(cue_trial_types1)
	cue_trial_type_list.push(cue_trial_types2)
	cue_trial_type_list.push(cue_trial_types3)
	cue_trial_type_list.push(cue_trial_types4)
	
	
	var stims = []
	var cued_dimensions = [third.dimension,fourth.dimension]
	var predictive_dimensions = [first.dimension,first.dimension,second.dimension,second.dimension]
	var numIndex = ''
	
	var magnitude = magnitudes[Math.floor(Math.random() * 2)]
	var color = colors[Math.floor(Math.random() * 2)]
	var parity = parities[Math.floor(Math.random() * 2)]
	var size = sizes[Math.floor(Math.random() * 2)]
	
	cued_dimension = cued_dimensions[Math.floor(Math.random() * 2)]
	predictive_dimension = predictive_dimensions[whichQuadStart - 1]
	
	if ((magnitude == "high") && (parity == "even")){
		numIndex = 0
	} else if ((magnitude == "high") && (parity == "odd")){
		numIndex = 1
	} else if ((magnitude == "low") && (parity == "even")){
		numIndex = 2
	} else if ((magnitude == "low") && (parity == "odd")){
		numIndex = 3
	}
	
	number = numbers_list[numIndex][Math.floor(Math.random() * 2)]
	correct_response = getCorrectResponse(magnitude,color,parity,size,predictive_dimension,cued_dimension)
	
	first_stim = {
		magnitude: magnitude,
		color: color,
		parity: parity,
		size: size,
		number: number,
		whichQuad: whichQuadStart,
		cued_dimension: cued_dimension,
		cued_condition: "N/A",
		predictive_dimension: predictive_dimension,
		predictive_condition: "N/A",
		correct_response: correct_response[1]
		
	}
	
	stims.push(first_stim)
	
	for (var i = 0; i < numTrialsPerBlock; i++){
		whichQuadStart += 1
		quadIndex = whichQuadStart%4
		if (quadIndex == 0){
			quadIndex = 4
		}
		
		cued_cond = cue_trial_type_list[quadIndex - 1].pop()
		predictive_cond = predictive_cond_array[i%2]
		
		
		if (cued_cond == "switch"){
			var temp = cued_dimensions[(cued_dimensions.indexOf(cued_dimension) + 1)%2]
			cued_dimension = temp
			
		} else if (cued_cond == "stay"){
			var temp = cued_dimensions[cued_dimensions.indexOf(cued_dimension)]
			cued_dimension = temp
		
		}
		
		predictive_dimension = predictive_dimensions[quadIndex - 1]
		
		magnitude = magnitudes[Math.floor(Math.random() * 2)]
		color = colors[Math.floor(Math.random() * 2)]
		parity = parities[Math.floor(Math.random() * 2)]
		size = sizes[Math.floor(Math.random() * 2)]
		
		if ((magnitude == "high") && (parity == "even")){
			numIndex = 0
		} else if ((magnitude == "high") && (parity == "odd")){
			numIndex = 1
		} else if ((magnitude == "low") && (parity == "even")){
			numIndex = 2
		} else if ((magnitude == "low") && (parity == "odd")){
			numIndex = 3
		}
		
		number = numbers_list[numIndex][Math.floor(Math.random() * 2)]
		correct_response = getCorrectResponse(magnitude,color,parity,size,predictive_dimension,cued_dimension)
	
		stim = {
			magnitude: magnitude,
			color: color,
			parity: parity,
			size: size,
			number: number,
			whichQuad: quadIndex,
			cued_dimension: cued_dimension,
			cued_condition: cued_cond,
			predictive_dimension: predictive_dimension,
			predictive_condition: predictive_cond,
			correct_response: correct_response[1]
		}
		
		stims.push(stim)
	}
	return stims
}



var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	
	
	if (trial_id == "practice_trial"){
		
		jsPsych.data.addDataToLastTrial({
			number: number,
			parity: parity,
			size: size,
			color: color,
			magnitude: magnitude,
			whichQuadrant: whichQuadrant,
			cued_condition: cued_condition,
			cued_dimension: cued_dimension,
			predictive_condition: predictive_condition,
			predictive_dimension: predictive_dimension,
			correct_response: correct_response		
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
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0


var practice_len = 24 // 24
var exp_len = 320 //320 must be divisible by 8
var numTrialsPerBlock = 64 // must be divisible by 8
var numTestBlocks = exp_len / numTrialsPerBlock

var accuracy_thresh = 0.80
var missed_thresh = 0.10

var practice_thresh = 4 // 3 blocks of 24 trials

var pathSource = "/static/experiments/cued_predictive_task_switching/images/"
var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/cued_predictive_task_switching/images/"


var numbers_list = [[6,8],[7,9],[2,4],[1,3]]

var cued_conditions = ['stay','switch']
var predictive_conditions = [['switch','stay'],
							 ['stay','switch']]
							 
var magnitudes = ['high','low']
var colors = ['blue','orange']
var parities = ['odd','even']
var sizes = ['small','large']
var possible_responses = [['A key', 65, 0],['S key', 83, 1],['K key', 75, 2],['L key', 76, 3]]


var magnitude = ''
var color = ''
var parity = ''
var size = ''
var whichQuadrant = ''

var prompt_text = '<ul list-text>'+
				  	'<li>remember 16 diff combos</li>' +
				  '</ul>'

/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var task_boards = [[['<div class = bigbox><div class = decision-top-left>'],['</div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div>']],
				   [['<div class = bigbox><div class = decision-top-left></div><div class = decision-top-right>'],['</div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div>']],
				   [['<div class = bigbox><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right>'],['</div><div class = decision-bottom-left></div></div>']],
				   [['<div class = bigbox><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left>'],['</div></div>']]]

//This shuffles which dimensions are predictive and cued, generates responses
all_dimensions = []
for (var i = 0; i < 1; i++){
	dimension1 = {
		dimension: 'magnitude',
		dim1: 'high',
		dim2: 'low'
	
	}
	
	dimension4 = {
		dimension: 'color',
		dim1: 'blue',
		dim2: 'orange'
	
	}
	
	dimension3 = {
		dimension: 'size',
		dim1: 'small',
		dim2: 'large'
	
	}
	
	dimension2 = {
		dimension: 'parity',
		dim1: 'odd',
		dim2: 'even'
	
	}
	all_dimensions.push(dimension1)
	all_dimensions.push(dimension2)
	all_dimensions.push(dimension3)
	all_dimensions.push(dimension4)
	
	all_dimensions = jsPsych.randomization.repeat(all_dimensions,1)
	
}

var first = all_dimensions.shift()
var second = all_dimensions.shift()
var third = all_dimensions.shift()
var fourth = all_dimensions.shift()

dimensions_1 = [[first.dim1,first.dim2],[second.dim1,second.dim2]]
dimensions_2 = [[third.dim1,third.dim2],[fourth.dim1,fourth.dim2]]

var combos1 = []
var combos2 = []
var combos3 = []
var combos4 = []
var allCombos = []

for (var i = 0; i < 2; i++){
	for (var x = 0; x < 1; x++){
		combos1.push(dimensions_1[0][0] + '_' + dimensions_2[i][0])
		combos1.push(dimensions_1[1][0] + '_' + dimensions_2[i][0])
		combos3.push(dimensions_1[0][1] + '_' + dimensions_2[i][0])
		combos3.push(dimensions_1[1][1] + '_' + dimensions_2[i][0])
		
		combos2.push(dimensions_1[0][0] + '_' + dimensions_2[i][1])
		combos2.push(dimensions_1[1][0] + '_' + dimensions_2[i][1])
		combos4.push(dimensions_1[0][1] + '_' + dimensions_2[i][1])
		combos4.push(dimensions_1[1][1] + '_' + dimensions_2[i][1])
		
	}
}

allCombos.push(combos1)
allCombos.push(combos2)
allCombos.push(combos3)
allCombos.push(combos4)



var stims = createTrialTypes(practice_len)

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
			'<p class = block-text>cue by predictive task switching. not sure how to instruct.</p> '+
			'<p class = block-text>We will start with practice after you finish the instructions.</p>'+
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
			
			'<p class = block-text>Please judge the <strong>center number</strong> on magnitude (higher or lower than 5) or parity (odd or even), depending on which quadrant '+
			'the numbers are in.</p>'+
	
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
for (i = 0; i < numTrialsPerBlock + 1; i++) {
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
	}
	
	var practice_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1],possible_responses[2][1],possible_responses[3][1]],
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
	practiceTrials.push(cue_block)
	practiceTrials.push(practice_block)
}

var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
		practiceCount += 1
		stims = createTrialTypes(practice_len)
	
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
		choices: [possible_responses[0][1],possible_responses[1][1],possible_responses[2][1],possible_responses[3][1]],
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


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var cued_predictive_task_switching_experiment = []

cued_predictive_task_switching_experiment.push(instruction_node);

cued_predictive_task_switching_experiment.push(practiceNode);

cued_predictive_task_switching_experiment.push(start_test_block);

cued_predictive_task_switching_experiment.push(testNode);

cued_predictive_task_switching_experiment.push(end_block);
