/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'go_nogo_with_flanker'})
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
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text + '</p></div>'
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}

var getCategorizeIncorrectText = function(){
	if (go_nogo_condition == 'go'){
		return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text
	} else {
		return '<div class = fb_box><div class = center-text><font size = 20>Letter is '+go_no_go_styles[1]+'</font></div></div>' + prompt_text
	}
}

var getTimeoutText = function(){
	if (go_nogo_condition == "go"){
		return '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text
	} else {
		return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text
	}
}

var getCorrectText = function(){
	if (go_nogo_condition == "go"){
		return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text
	} else {
		return '<div class = fb_box><div class = center-text><font size = 20>Letter is '+go_no_go_styles[1]+'</font></div></div>' + prompt_text
	}
}

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}
	 
var createTrialTypes = function(numTrialsPerBlock){
	
	var stims = []
	for(var numIterations = 0; numIterations < numTrialsPerBlock/20; numIterations++){
		for (var numFlankerConds = 0; numFlankerConds < flanker_trial_types.length; numFlankerConds++){
			for (var numgo_nogoConds = 0; numgo_nogoConds < go_nogo_trial_types.length; numgo_nogoConds++){
			
				flanker_condition = flanker_trial_types[numFlankerConds]
				go_nogo_condition = go_nogo_trial_types[numgo_nogoConds]
				
				if (go_nogo_condition == 'stop'){
					go_no_go_style = go_no_go_styles[1]
				} else {
					go_no_go_style = go_no_go_styles[0]
				}
				
				if (flanker_condition == 'H_congruent'){
					central_letter = 'H'
					flankers = 'H'
					correct_response = possible_responses[1][1]
				} else if (flanker_condition == 'H_incongruent'){
					central_letter = 'H'
					flankers = 'F'
					correct_response = possible_responses[1][1]
				} else if (flanker_condition == 'F_congruent'){
					central_letter = 'F'
					flankers = 'F'
					correct_response = possible_responses[0][1]
				} else if (flanker_condition == 'F_incongruent'){
					central_letter = 'F'
					flankers = 'H'
					correct_response = possible_responses[0][1]
				}
				
				
				stim = {
					go_nogo_condition: go_nogo_condition,
					flanker_condition: flanker_condition,
					correct_response: correct_response,
					go_no_go_style: go_no_go_style,
					central_letter: central_letter,
					flankers: flankers
					
					}
			
				stims.push(stim)
			}
			
		}
	}
	stims = jsPsych.randomization.repeat(stims,1)
	return stims	
}


var getResponse = function() {
	return correct_response
}

var getStim = function(){
	stim = stims.shift()
	flanker_condition = stim.flanker_condition
	go_nogo_condition = stim.go_nogo_condition
	go_no_go_style = stim.go_no_go_style
	central_letter = stim.central_letter
	flankers = stim.flankers
	correct_response = stim.correct_response	
	
	return  task_boards[0] + preFileType + go_no_go_style + '_'+ flankers + fileTypePNG +
		 	task_boards[1] + preFileType + go_no_go_style + '_'+ flankers + fileTypePNG +
		 	task_boards[2] + preFileType + go_no_go_style + '_'+ central_letter + fileTypePNG +
		 	task_boards[3] + preFileType + go_no_go_style + '_'+ flankers + fileTypePNG +
		 	task_boards[4] + preFileType + go_no_go_style + '_'+ flankers + fileTypePNG +
		 	task_boards[5] 
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
		go_nogo_condition: go_nogo_condition,
		flanker_condition: flanker_condition,
		correct_response: correct_response,
		go_no_go_style: go_no_go_style,
		central_letter: central_letter,
		flankers: flankers,
		current_block: current_block,
		current_trial: current_trial
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
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0

// task specific variables
// Set up variables for stimuli
var practice_len = 20 // must be divisible by 20, [5 (go,go,go,go,stop) by 4 (flanker conditions)]
var exp_len = 40 //350 must be divisible by 10
var numTrialsPerBlock = 20; // 70 divisible by 10
var numTestBlocks = exp_len / numTrialsPerBlock

var accuracy_thresh = 0.80
var missed_thresh = 0.30
var practice_thresh = 3 // 3 blocks of 28 trials
 
var possible_responses = [['F key', 70],['H key', 72]]
var go_nogo_trial_types = ['go','go','go','go','stop']
var flanker_trial_types = ['H_congruent','H_incongruent','F_congruent','F_incongruent']
var go_no_go_styles = ['solid','unfilled'] //has dashed as well



var current_trial = 0
var current_block = 0

var fileTypePNG = '.png"></img>'
var preFileType = '<img class = center src="/static/experiments/go_nogo_with_flanker/images/'


var task_boards = [['<div class = bigbox><div class = centerbox><div class = leftbox1 style="background-color:'],['"></div><div class = leftbox2 style="background-color:'],['"></div><div class = centerimg style="background-color:'],['"></div><div class = rightbox1 style="background-color:'],['"></div><div class = rightbox2 style="background-color:'],['"></div></div></div>']]
var task_boards = [['<div class = bigbox><div class = centerbox><div class = leftbox1>'],['</div><div class = leftbox2>'],['</div><div class = centerimg>'],['</div><div class = rightbox1>'],['</div><div class = rightbox2>'],['</div></div></div>']]


var stims = createTrialTypes(practice_len)

var prompt_text_list = '<ul list-text>'+
						'<li>Indicate the identity of the center letter</li>' +
						'<li>Press the F key if center letter is F</li>' +
						'<li>Press the H key if center letter is H</li>' +
						'<li>Do not respond if the '+go_no_go_styles[1]+' version of the letters came out!</li>' +
					   '</ul>'
					  
var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Indicate the identity of the center letter</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Press the F key if center letter is F</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Press the H key if center letter is H</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Do not respond if the '+go_no_go_styles[1]+' version of the letters came out!</p>' +
				  '</div>' 	
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
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

var practice1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = instructBox>'+
					'<p class = block-text style="font-size:24px;">This is what the trial will look like. You will see a row of letters composed of H and F. Please indicate the identity of the center letter.</p>'+
					'<p class = block-text style="font-size:24px;">In this case, the center letter is F, so the correct answer is the F key.</p>'+
					'<p class = block-text style="font-size:24px;">Please ignore the letters that are not in the center, in this case, H.</p>'+
					'<p class = block-text style="font-size:24px;">Press Enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = centerbox>'+
					'<div class = leftbox1>' + preFileType +   go_no_go_styles[0]  + '_H'  + fileTypePNG + '</div>'+
					'<div class = leftbox2>' + preFileType +   go_no_go_styles[0]  + '_H'  + fileTypePNG + '</div>'+
					'<div class = centerimg>' + preFileType +   go_no_go_styles[0]  + '_F'  + fileTypePNG + '</div>'+
					'<div class = rightbox1>' + preFileType +   go_no_go_styles[0]  + '_H'  + fileTypePNG + '</div>'+
					'<div class = rightbox2>' + preFileType +   go_no_go_styles[0]  + '_H'  + fileTypePNG + '</div>'+
				'</div>'+
			  '</div>',
	is_html: true,
	choices: [13],
	data: {
		trial_id: "visual_instruction"
	},
	timing_post_trial: 0,
	timing_stim: 300000,
	timing_response: 300000,
	response_ends_trial: true,
}

var practice2 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = instructBox>'+
					'<p class = block-text style="font-size:24px;">If instead, the '+go_no_go_styles[1]+' version of the letters came out, then do not respond on that trial!</p>'+
					'<p class = block-text style="font-size:24px;">Remember, respond only if the number is '+go_no_go_styles[0]+', not if the number is '+go_no_go_styles[0]+'.</p>'+
					'<p class = block-text style="font-size:24px;">Press Enter to start practice.</p>'+
				'</div>'+
				
				'<div class = centerbox>'+
					'<div class = leftbox1>' + preFileType +   go_no_go_styles[1]  + '_H'  + fileTypePNG + '</div>'+
					'<div class = leftbox2>' + preFileType +   go_no_go_styles[1]  + '_H'  + fileTypePNG + '</div>'+
					'<div class = centerimg>' + preFileType +   go_no_go_styles[1]  + '_F'  + fileTypePNG + '</div>'+
					'<div class = rightbox1>' + preFileType +   go_no_go_styles[1]  + '_H'  + fileTypePNG + '</div>'+
					'<div class = rightbox2>' + preFileType +   go_no_go_styles[1]  + '_H'  + fileTypePNG + '</div>'+
				'</div>'+
			  '</div>',
	is_html: true,
	choices: [13],
	data: {
		trial_id: "visual_instruction"
	},
	timing_post_trial: 0,
	timing_stim: 300000,
	timing_response: 300000,
	response_ends_trial: true,
}

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


var feedback_text = 'We will start practice. During practice, you will receive a prompt to remind you of the rules.  <strong>This prompt will be removed for test!</strong> Press <strong>enter</strong> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		exp_id: "go_nogo_with_flanker",
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
		"<div class = centerbox>"+
		"<p class = block-text>In this experiment you will see a row of letters composed of H's and F's.</p> "+
				
		"<p class = block-text>Please indicate the identity of the center letter! If the center letter is F, press the "+possible_responses[0][0]+" as quickly as possible.  If the center letter is H, press the "+possible_responses[1][0]+".</p>"+
		
		"<p class = block-text>Ignore the letters not in the center!</p>"+
		
		"<p class = block-text>On most trials, the letters will be "+go_no_go_styles[0]+".  Sometimes, the letters will be "+go_no_go_styles[1]+".  If the letters are "+go_no_go_styles[1]+", please make no response on that trial.</p>"+
						
		"<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. You will be given a reminder of the rules for practice. <i>This will be removed for test!</i></p>"+
		"</div>",
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
    	exp_id: 'go_nogo_with_flanker'
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
	text: "<div class = centerbox>"+
			"<p class = block-text>We will now start the test portion</p>"+
			
			"<p class = block-text>Please indicate the identity of the center letter! If the center letter is F, press the "+possible_responses[0][0]+" as quickly as possible.  If the center letter is H, press the "+possible_responses[1][0]+".</p>"+
		
			"<p class = block-text>Ignore the letters not in the center!</p>"+
		
			"<p class = block-text>On most trials, the letters will be "+go_no_go_styles[0]+".  Sometimes, the letters will be "+go_no_go_styles[1]+".  If the letters are "+go_no_go_styles[1]+", please make no response on that trial.</p>"+
	
			"<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>"+
		 "</div>",
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
practiceTrials.push(instructions_block)
for (i = 0; i < practice_len; i++) {
	var practice_block = {
		type: 'poldrack-categorize',
		stimulus: getStim,
		is_html: true,
		choices: [possible_responses[0][1],possible_responses[1][1]],
		key_answer: getResponse,
		data: {
			trial_id: "practice_trial"
			},
		correct_text: getCorrectText,
		incorrect_text: getCategorizeIncorrectText,
		timeout_message: getTimeoutText,
		timing_stim: 2000, //2000
		timing_response: 2000,
		timing_feedback: 500, //500
		show_stim_with_feedback: false,
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: prompt_text,
	}
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
			if ((data[i].trial_id == "practice_trial") && (data[i].go_nogo_condition == 'go')){
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
testTrials.push(attention_node)
for (i = 0; i < numTrialsPerBlock; i++) {
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
		timing_post_trial: 500,
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
	stims = createTrialTypes(numTrialsPerBlock)
	current_trial = 0
	
	var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
	
		for (var i = 0; i < data.length; i++){
			if ((data[i].trial_id == "test_trial") && (data[i].go_nogo_condition == 'go')){
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
					'</p><p class = block-text>Your accuracy is too low.  Remember, judge if the green shape on the left matches or mismatches the <strong>CENTER</strong> white shape on the right: <br>' + prompt_text_list
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
go_nogo_with_flanker_experiment = []

//go_nogo_with_flanker_experiment.push(test_img_block)
//go_nogo_with_flanker_experiment.push(instruction_node)
//go_nogo_with_flanker_experiment.push(practice1)
//go_nogo_with_flanker_experiment.push(practice2)

go_nogo_with_flanker_experiment.push(practiceNode)
go_nogo_with_flanker_experiment.push(feedback_block)

go_nogo_with_flanker_experiment.push(start_test_block)
go_nogo_with_flanker_experiment.push(testNode)
go_nogo_with_flanker_experiment.push(feedback_block)

go_nogo_with_flanker_experiment.push(post_task_block)
go_nogo_with_flanker_experiment.push(end_block)