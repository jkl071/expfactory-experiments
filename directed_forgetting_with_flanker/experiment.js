/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'directed_forgetting_with_flanker'})
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
	return check_percent
}

function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	for (var k = 0; k < possible_responses.length; k++) {
		choice_counts[possible_responses[k]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'probe') {
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


var createTrialTypes = function(numTrialsPerBlock){
	
	var stims = []
	for(var numIterations = 0; numIterations < numTrialsPerBlock/8; numIterations++){
		for (var numDirectedConds = 0; numDirectedConds < directed_cond_array.length; numDirectedConds++){
			for (var numFlankerConds = 0; numFlankerConds < flanker_conditions.length; numFlankerConds++){
			
				flanker_condition = flanker_conditions[numFlankerConds]
				directed_condition = directed_cond_array[numDirectedConds]
				
				letters = getTrainingSet()
				cue = getCue()
				probe = getProbe(directed_condition, letters, cue)
				correct_response = getCorrectResponse(cue, probe, letters)
				 if (flanker_condition == 'congruent'){
				 	flanking_letter = probe
				 } else {
				 	flanking_letter = randomDraw(stimArray.filter(function(y) {return $.inArray(y, [probe]) == -1}))
				 }
				
				stim = {
					flanker_condition: flanker_condition,
					directed_condition: directed_condition,
					letters: letters,
					cue: cue,
					probe: probe,
					flanking_letter: flanking_letter,
					correct_response: correct_response
					}
			
				stims.push(stim)
			}
			
		}
	}
	
	stims = jsPsych.randomization.repeat(stims,1)
	return stims
		
}


//this is an algorithm to choose the training set based on rules of the game (training sets are composed of any letter not presented in the last two training sets)
var getTrainingSet = function() {
	preceeding1stims = []
	preceeding2stims = []
	trainingArray = jsPsych.randomization.repeat(stimArray, 1);
	if (current_trial < 1) {
		letters = trainingArray.slice(0,6)
	} else if (current_trial == 1) {
		preceeding1stims = letters.slice()
		letters = trainingArray.filter(function(y) {
			return (jQuery.inArray(y, preceeding1stims) == -1)
		}).slice(0,6)
	} else {
		preceeding2stims = preceeding1stims.slice()
		preceeding1stims = letters.slice()
		letters = trainingArray.filter(function(y) {
			return (jQuery.inArray(y, preceeding1stims.concat(preceeding2stims)) == -1)
		}).slice(0,6)
	}
	return letters
};

//returns a cue randomly, either TOP or BOT
var getCue = function() {
	
	cue = directed_cue_array[Math.floor(Math.random() * 2)]
	
	return cue
};

// Will pop out a probe type from the entire probeTypeArray and then choose a probe congruent with the probe type
var getProbe = function(directed_cond, letters, cue) {
	var trainingArray = jsPsych.randomization.repeat(stimArray, 1);
	var lastCue = cue
	var lastSet_top = letters.slice(0,3)
	var lastSet_bottom = letters.slice(3)
	if (directed_cond== 'pos') {
		if (lastCue == 'BOT') {
			probe = lastSet_top[Math.floor(Math.random() * 3)]
		} else if (lastCue == 'TOP') {
			probe = lastSet_bottom[Math.floor(Math.random() * 3)]
		}
	} else if (directed_cond == 'neg') {
		if (lastCue == 'BOT') {
			probe = lastSet_bottom[Math.floor(Math.random() * 3)]
		} else if (lastCue == 'TOP') {
			probe = lastSet_top[Math.floor(Math.random() * 3)]
		}
	} else if (directed_cond == 'con') {
		newArray = trainingArray.filter(function(y) {
			return (y != lastSet_top[0] && y != lastSet_top[1] && y != lastSet_top[2] && y !=
				lastSet_bottom[0] && y != lastSet_bottom[1] && y != lastSet_bottom[2])
		})
		probe = newArray.pop()
	}
	
	
	return probe
};

var getCorrectResponse = function(cue,probe,letters) {
	if (cue == 'TOP') {
		if (jQuery.inArray(probe, letters.slice(3)) != -1) {
			return possible_responses[0][1]
		} else {
			return possible_responses[1][1]
		}
	} else if (cue == 'BOT') {
		if (jQuery.inArray(probe, letters.slice(0,3)) != -1) {
			return possible_responses[0][1]
		} else {
			return possible_responses[1][1]
		}
	}		
}

var getResponse = function() {
	return correct_response
}



var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	
	if (trial_id == 'practice_trial'){
		current_block = practiceCount
	}else{
		current_block = testCount
	}
	
	current_trial+=1
	
	jsPsych.data.addDataToLastTrial({
		flanker_condition: flanker_condition,
		directed_condition: directed_condition,
		probe: probe,
		letters: letters,
		cue: cue,
		flanking_letter: flanking_letter,
		correct_response: correct_response,
		current_trial: current_trial
		
	})
}


var getNextStim = function(){
	stim = stims.shift()
	flanker_condition = stim.flanker_condition
	directed_condition = stim.directed_condition
	probe = stim.probe
	letters = stim.letters
	cue = stim.cue
	flanking_letter = stim.flanking_letter
	correct_response = stim.correct_response
	
	return stim
}

var getTrainingStim = function(){
	return task_boards[0]+letters[0]+
		   task_boards[1]+letters[1]+
		   task_boards[2]+letters[2]+
		   task_boards[3]+letters[3]+
		   task_boards[4]+letters[4]+
		   task_boards[5]+letters[5]+
		   task_boards[6]

}

var getDirectedCueStim = function(){
	return '<div class = bigbox><div class = centerbox><div class = cue-text>'+cue+'</font></div></div></div>'	

}


var getProbeStim = function(){
	return flanker_boards[0]+ 
			flanking_letter+
			flanking_letter+
			probe+
			flanking_letter+
			flanking_letter+
		   flanker_boards[1]
		   
	
	

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

// new vars
var practice_len = 16  // must be divisible by 8
var exp_len = 320 //320 must be divisible by 8
var numTrialsPerBlock = 64; // divisible by 64
var numTestBlocks = exp_len / numTrialsPerBlock

var accuracy_thresh = 0.80
var missed_thresh = 0.10
var practice_thresh = 3 // 3 blocks of 16 trials

var directed_cond_array = ['pos', 'pos', 'neg', 'con']
var directed_cue_array = ['TOP','BOT']
var flanker_conditions = ['congruent','incongruent']

var possible_responses = jsPsych.randomization.repeat([['M Key', 77],['Z Key', 90]],1)
							 
var current_trial = 0	

var current_trial = 0
var stimArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
	'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];
				 


var stims = createTrialTypes(practice_len)

var task_boards = [['<div class = bigbox><div class = topLeft><div class = fixation>'],['</div></div><div class = topMiddle><div class = fixation>'],['</div></div><div class = topRight><div class = fixation>'],['</div></div><div class = bottomLeft><div class = fixation>'],['</div></div><div class = bottomMiddle><div class = fixation>'],['</div></div><div class = bottomRight><div class = fixation>'],['</div></div></div>']]
var flanker_boards = [['<div class = bigbox><div class = centerbox><div class = flanker-text>'],['<div></div><div>']]				
				   

var prompt_text = '<ul list-text>'+
					'<li>Please respond if the probe (single letter) was in the memory set.</li>'+
					'<li>Yes: ' + possible_responses[0][0] + '</li>' +
					'<li>No: ' + possible_responses[1][0] + '</li>' +
				  '</ul>'
				  
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
var test_img_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = centerbox>'+
	
	'<div class = distractor_text><font color="red" size="10">G</font></div>'+
	
	'<div class = cue_text><font color="white" size="10">A</font></div>'+
	
	'</div></div>',
	is_html: true,
	choices: [13],
	data: {
		trial_id: "instruction_images"
	},
	timing_post_trial: 0,
	timing_stim: 300000,
	timing_response: 300000,
	response_ends_trial: true,
}


var feedback_text = 'We will start practice. Press <strong>enter</strong> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		exp_id: "flanker_with_predictive_task_switching",
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
// Set up attention check node
var attention_check_block = {
	type: 'attention-check',
	data: {
		trial_id: "attention_check"
	},
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

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
		exp_id: 'directed_forgetting_with_flanker'
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: assessPerformance
};

var feedback_text = 'We will start practice. Press <strong>enter</strong> to begin.'
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
	'Welcome to the experiment. This task will take around 30 minutes. Press <strong>enter</strong> to begin.'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: 'instruction'
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
		trial_id: 'instruction'
	},
	pages: [		
		'<div class = centerbox>'+
		'<p class = block-text>In this experiment you will be presented with 6 letters on each trial. You must memorize all 6 letters.</p> '+
				
		'<p class = block-text>There will be a short delay, then you will see a cue, either <strong>TOP</strong> or <strong>BOT</strong>. '+
		'This will instruct you to <strong>FORGET</strong> the 3 letters located at either the top or bottom (respectively) of the screen. '+
		'The three remaining letters that you must remember are called your <strong>MEMORY SET</strong>. Please forget the letters not in the memory set.</p>'+
		
		'<p class = block-text>After a short delay, you will be presented with a probe - a single white letter.  Please indicate whether this probe was in your memory set.</p>'+
		
		'<p class = block-text>Press the <strong>'+possible_responses[0][0]+
		' </strong>if the probe was in the memory set, and the <strong>'+possible_responses[1][0]+'  </strong>if not.</p>'+
		
		'<p class = block-text>You will see an additional red letter overlapping with the white probe, please ignore the red letter.  Your job is only to respond if the probe (white letter) was in the memory set.</p>'+

		
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

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	text: '<div class = centerbox>'+
			'<p class = block-text>This test will be exactly like practice. You will be presented with 6 letters on each trial. You must memorize all 6 letters.</p> '+
				
			'<p class = block-text>There will be a short delay, then you will see a cue, either <strong>TOP</strong> or <strong>BOT</strong>.</p>'+
		
			'<p class = block-text>This will instruct you to <strong>FORGET</strong> the 3 letters located at either the top or bottom (respectively) of the screen. '+
			'The three remaining letters that you must remember are called your <strong>MEMORY SET</strong>. Please forget the letters not in the memory set.</p>'+
		
			'<p class = block-text>After a short delay, you will be presented with a probe - a single white letter.  Please indicate whether this probe was in your memory set.</p>'+
		
			'<p class = block-text>Press the <strong>'+possible_responses[0][0]+
			' </strong>if the probe was in the memory set, and the <strong>'+possible_responses[1][0]+'  </strong>if not.</p>'+
		
			'<p class = block-text>You will see an additional red letter overlapping with the white probe, please ignore the red letter.  Your job is only to respond if the probe (white letter) was in the memory set.</p>'+
			
			'<p class = block-text>Press Enter to continue.</p>'+
		 '</div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function(){
		feedback_text = "We will now start the test portion. Press enter to begin."
	}
};



var start_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation><span style="color:red">+</span></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_post_trial: 0,
	timing_stim: 1000, //1000
	timing_response: 1000,
	on_finish: function(){
		stim = getNextStim()
	}
}

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation><span style="color:red">+</span></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_post_trial: 0,
	timing_stim: 3000, //3000
	timing_response: 3000
}

var ITI_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation><span style="color:red">+</span></div></div>',
	is_html: true,
	choices: [possible_responses[0][1],possible_responses[1][1]],
	data: {
		trial_id: "ITI_fixation"
	},
	timing_post_trial: 0,
	timing_stim: 4000, //4000
	timing_response: 4000
}

var cue_directed_block = {
	type: 'poldrack-single-stim',
	stimulus: getDirectedCueStim,
	is_html: true,
	data: {
		trial_id: "cue",
	},
	choices: false,
	timing_post_trial: 0,
	timing_stim: 1000, //1000
	timing_response: 1000
};


var training_block = {
	type: 'poldrack-single-stim',
	stimulus: getTrainingStim,
	is_html: true,
	data: {
		trial_id: "stim"
	},
	choices: 'none',
	timing_post_trial: 0,
	timing_stim: 2500, //2500
	timing_response: 2500
};


var probe_block = {
	type: 'poldrack-single-stim',
	stimulus: getProbeStim,
	is_html: true,
	data: {
		trial_id: "test_trial",
	},
	choices: [possible_responses[0][1],possible_responses[1][1]],
	timing_post_trial: 0,
	timing_stim: 2000, //2000
	timing_response: 2000,
	response_ends_trial: false,
	on_finish: appendData
};


var practice_probe_block = {
	type: 'poldrack-categorize',
	stimulus: getProbeStim,
	key_answer: getResponse,
	choices: [possible_responses[0][1],possible_responses[1][1]],
	data: {trial_id: "practice_trial"},
	correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>',
	incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>',
	timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>',
	timing_stim: 2000, //2000
	timing_response: 2000,
	timing_feedback_duration: 500,
	is_html: true,
	on_finish: appendData
};


var practiceTrials = []
practiceTrials.push(feedback_block)
for (i = 0; i < practice_len; i++) {
	practiceTrials.push(start_fixation_block)
	practiceTrials.push(training_block)
	practiceTrials.push(cue_directed_block)
	practiceTrials.push(fixation_block)
	practiceTrials.push(practice_probe_block)
	practiceTrials.push(ITI_fixation_block)
}

var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data){
		practiceCount += 1
		current_trial = 0
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
for (i = 0; i < numTrialsPerBlock; i++) {
	testTrials.push(start_fixation_block)
	testTrials.push(training_block)
	testTrials.push(cue_directed_block)
	testTrials.push(fixation_block)
	testTrials.push(probe_block)
	testTrials.push(ITI_fixation_block)
}

var testCount = 0
var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
	testCount += 1
	current_trial = 0
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


/* create experiment definition array */
var directed_forgetting_with_flanker_experiment = [];

//directed_forgetting_with_flanker_experiment.push(test_img_block);


directed_forgetting_with_flanker_experiment.push(instruction_node);

directed_forgetting_with_flanker_experiment.push(practiceNode);

directed_forgetting_with_flanker_experiment.push(start_test_block);

directed_forgetting_with_flanker_experiment.push(testNode);

directed_forgetting_with_flanker_experiment.push(post_task_block);

directed_forgetting_with_flanker_experiment.push(end_block);