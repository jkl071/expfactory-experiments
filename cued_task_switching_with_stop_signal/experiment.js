/* ************************************ */
/* Define helper functions */
/* ************************************ */
function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'cued_task_switching_with_stop_signal'})
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
	credit individual experiments in expfactory. 
	 */
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	//experiment_data = experiment_data.concat(jsPsych.data.getTrialsOfType('poldrack-categorize'))
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	for (var k = 0; k < choices.length; k++) {
    choice_counts[choices[k]] = 0
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
	
	console.log(trial_id)
	if ((trial_id == 'practice_with_stop') && (jsPsych.data.getDataByTrialIndex(curr_trial).SS_trial_type != 'stop')){
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

/* Staircase procedure. After each successful stop, make the stop signal delay longer (making stopping harder) */
var updateSSD = function(data) {
	if (data.SS_trial_type == 'stop') {
		if (data.rt == -1 && SSD < 850) {
			SSD = SSD + 50
		} else if (data.rt != -1 && SSD > 0) {
			SSD = SSD - 50
		}
	}
}

var getSSD = function() {
	return SSD
}

var resetSSD = function() {
	SSD = 250
}


// Task Specific Functions
var getKeys = function(obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }
  return keys
}

var genStims = function(n) {
  stims = []
  for (var i = 0; i < n; i++) {
    var numString = randomDraw('12346789')
    var readableNumber = parseInt(numString)
    var stim = readableNumber
    stims.push(stim)
  }
  return stims
}

//Sets the cue-target-interval for the cue block
var setCTI = function() {
  return CTI
}

var getCTI = function() {
  return CTI
}

/* Index into task_switches using the global var current_trial. Using the task_switch and cue_switch
change the task. If "stay", keep the same task but change the cue based on "cue switch". 
If "switch new", switch to the task that wasn't the current or last task, choosing a random cue. 
If "switch old", switch to the last task and randomly choose a cue.
*/
var setStims = function() {
  var tmp;
  switch (task_switches[current_trial].task_switch) {
    case "stay":
      if (curr_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks))
      }
      if (task_switches[current_trial].cue_switch == "switch") {
        cue_i = 1 - cue_i
      }
      break
    case "switch_old":
      cue_i = randomDraw([0, 1])
      if (last_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        }))
        last_task = tmp
      } else {
        tmp = curr_task
        curr_task = last_task
        last_task = tmp
      }
      break

  }
  curr_cue = tasks[curr_task].cues[cue_i]
  curr_stim = stims[current_trial]
  current_trial = current_trial + 1
  CTI = setCTI()
}

var getCue = function() {
  var cue_html = '<div class = upperbox><div class = "center-text" >' + curr_cue +
    '</div></div><div class = lowerbox><div class = fixation>+</div></div>'
  return cue_html
}

var getStim = function() {
  var stim_html = '<div class = upperbox><div class = "center-text" >' + curr_cue +
    '</div></div><div class = lowerbox><div class = "center-text" style=color: blue;>' + curr_stim + '</div>'
  return stim_html
}



//Returns the key corresponding to the correct response for the current
// task and stim
var getResponse = function() {
  switch (curr_task) {
    case 'magnitude':
      if (curr_stim > 5) {
      	correct_response = response_keys.key[0]
        return response_keys.key[0]
      } else {
      	correct_response = response_keys.key[1]
        return response_keys.key[1]
      }
      break;
    case 'parity':
      if (curr_stim % 2 === 0) {
      	correct_response = response_keys.key[0]
        return response_keys.key[0]
      } else {
      	correct_response = response_keys.key[1]
        return response_keys.key[1]
      }
  }
}

var getAnotherResponse = function () {
  if (curr_task == 'magnitude') {
    if (curr_stim > 5) {
  		correct_response = response_keys.key[0]
    	return response_keys.key[0]
    } else {
    	correct_response = response_keys.key[1]
    	return response_keys.key[1]
    }
  } else if (curr_task == 'parity') {
    if (curr_stim % 2 === 0 ) {
    	correct_response = response_keys.key[0]
      return response_keys.key[0]
    } else {
     correct_response = response_keys.key[1]
      return response_keys.key[1]
    }
  }
}


/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function() {
  var trial_num = current_trial - 1 //current_trial has already been updated with setStims, so subtract one to record data
  var task_switch = task_switches[trial_num]
  jsPsych.data.addDataToLastTrial({
    cue: curr_cue,
    stim_number: curr_stim,
    task: curr_task,
    task_switch: task_switch.task_switch,
    cue_switch: task_switch.cue_switch,
    trial_num: trial_num
    })
    
    curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	if (trial_id != 'cue'){
		jsPsych.data.addDataToLastTrial({
			correct_response: correct_response
		})
	}
	
	if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 1,
		})
	
	} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 0,
		})
	
	}
  
}


var getSSPractice_trial_type = function() {
  var trial_num = current_trial - 1 //current_trial has already been updated with setStims, so subtract one to record data
  var trial_type = practice_stop_trials[trial_num]
	return trial_type
}

var getSStrial_type = function() {
  var trial_num = current_trial - 1 //current_trial has already been updated with setStims, so subtract one to record data
  var trial_type = stop_trials[trial_num]
	return trial_type
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.45
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true
var practice_repetitions = 1
var practice_repetition_thresh = 5
var rtMedians = []
var stopAccMeans =[]	
var RT_thresh = 1000
var rt_diff_thresh = 75
var missed_response_thresh = 0.1
var accuracy_thresh = 0.8
var stop_thresh = 0.2
var numconditions = 2
var numblocks = 6
var test_block_data = []
var pathSource = '/static/experiments/cued_task_switching_with_stop_signal/images/'
var fileType = '.png'


var SSD = 250
var stop_signal =
	'<div class = stopbox><div class = centered-shape id = stop-signal></div><div class = centered-shape id = stop-signal-inner></div></div>'


// task specific variables
var response_keys = jsPsych.randomization.repeat([{
  key: 77,
  key_name: 'M'
}, {
  key: 90,
  key_name: 'Z'
}], 1, true)
var choices = response_keys.key
var practice_length = 10
var test_length = 10

//set up block stim. correct_responses indexed by [block][stim][type]
var tasks = {
  parity: {
    task: 'parity',
    cues: ['Parity', 'Parity']
  },
  magnitude: {
    task: 'magnitude',
    cues: ['Magnitude', 'Magnitude']
  }
}

var task_switch_types = ["stay", "switch_old"]
var cue_switch_types = ["stay", "switch"]
var task_switches = []
for (var t = 0; t < task_switch_types.length; t++) {
  for (var c = 0; c < cue_switch_types.length; c++) {
    task_switches.push({
      task_switch: task_switch_types[t],
      cue_switch: cue_switch_types[c]
    })
  }
}

var practice_stop_trials = ['stop', 'stop', 'stop', 'go', 'go', 'go', 'go', 'go', 'go', 'go']
var practice_stop_trials = jsPsych.randomization.repeat(practice_stop_trials, practice_length / 10)

var stop_trials = ['stop', 'stop', 'stop', 'go', 'go', 'go', 'go', 'go', 'go', 'go']
var stop_trials = jsPsych.randomization.repeat(practice_stop_trials, test_length / 10)

var task_switches = jsPsych.randomization.repeat(task_switches, practice_length / 4)
var practiceStims = genStims(practice_length)
var testStims = genStims(test_length)
var stims = practiceStims
var curr_task = randomDraw(getKeys(tasks))
var last_task = 'na' //object that holds the last task, set by setStims()
var curr_cue = 'na' //object that holds the current cue, set by setStims()
var cue_i = randomDraw([0, 1]) //index for one of two cues of the current task
var curr_stim = 'na' //object that holds the current stim, set by setStims()
var current_trial = 0
var CTI = 300 //cue-target-interval, only has 1 value
var exp_stage = 'NoSS_practice' // defines the exp_stage, switched by start_test_block

var prompt_text_list = '<ul list-text>'+
						'<li>If judging number based on parity</li>' +
						'<li>Even: ' + response_keys.key_name[0] + ' key</li>' +
						'<li>Odd: ' + response_keys.key_name[1] + ' key</li>' +
						'<li>If judging number based on magnitude</li>' +
						'<li>High: ' + response_keys.key_name[0] + ' key</li>' +
						'<li>Low: ' + response_keys.key_name[1] + ' key</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">If judging number based on parity</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">Even: ' + response_keys.key_name[0] + ' key ' + ' | ' + ' Odd: ' + response_keys.key_name[1] + ' key' + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">If judging number based on magnitude</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%;">High: ' + response_keys.key_name[0] + ' key ' + ' | ' + ' Low: ' + response_keys.key_name[1] + ' key' + '</p>' +
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


var practice1 = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox>'+
				'<div class = instructBox>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">This is what the first part of the trial will look like.  You will not see the cue yet, just two fixations on the top and bottom.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">The cue will appear where the top fixation is, and the number where the bottom fixation is.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>'+
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
					'<p class = block-text style="font-size:24px; line-height:100%;">If you see the cue, <strong>magnitude</strong>, please judge the upcoming number whether it was higher or lower than 5. Press the '+response_keys.key[0]+' key if higher than 5, and the '+response_keys.key[0]+' key if lower than 5.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If you see the cue, <strong>parity</strong>, please judge the upcoming number whether it was even or odd. Press the '+response_keys.key[0]+' key if even, and the '+response_keys.key[0]+' key if odd. Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = upperbox><div class = "center-text">magnitude</div></div>'+
				'<div class = lowerbox><div class = fixation>+</div></div>'+
				
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
					'<p class = block-text style="font-size:24px; line-height:100%;">This is what the last part of the trial will look like.  Now you will see the number.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If you see the cue, <strong>magnitude</strong>, please judge the upcoming number whether it was higher or lower than 5. Press the '+response_keys.key[0]+' key if higher than 5, and the '+response_keys.key[0]+' key if lower than 5.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">If you see the cue, <strong>parity</strong>, please judge the upcoming number whether it was even or odd. Press the '+response_keys.key[0]+' key if even, and the '+response_keys.key[0]+' key if odd.</p>'+
					'<p class = block-text style="font-size:24px; line-height:100%;">Press enter to continue. You will not be able to go back.</p>'+
				'</div>'+
				
				'<div class = upperbox><div class = "center-text">magnitude</div></div>'+
				'<div class = lowerbox><div class = "center-text" style=color: blue;>9</div>'+
				
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
				
				'<div class = upperbox><div class = "center-text">magnitude</div></div>'+
				'<div class = lowerbox><div class = "center-text" style=color: blue;>9</div></div>' +
				'<div class = stopbox><img class = center src ="' + pathSource + 'stop' + fileType +'"></img></div>'+
				
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


/* define static blocks */
var feedback_instruct_text =
  'Welcome to the experiment. This experiment will take about 30 minutes. Press <strong>enter</strong> to begin.'
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

var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages: [
		'<div class = centerbox>'+
			
			'<p class = block-text>In this experiment you will see a cue, either <strong>magnitude</strong> or <strong>parity</strong>, followed by a number.</p>'+
			
			'<p class = block-text>The cue will instruct you how to respond to the upcoming number.</p>'+
			
			'<p class = block-text>If you see the cue, <strong>magnitude</strong>, please judge whether the number is higher or lower than 5.  Press the '+response_keys.key_name[0]+' key if higher than 5, and the '+response_keys.key_name[1]+' key if lower than five.</p> '+
		
			'<p class = block-text>If you see the cue, <strong>parity</strong>, please judge whether the number is odd or even.  Press the '+response_keys.key_name[0]+' key if even, and the '+response_keys.key_name[1]+' key if odd.</p> '+
						
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

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.



var end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "end",
    exp_id: 'cued_task_switching_with_stop_signal'
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13],
  timing_response: 180000,
  on_finish: assessPerformance
};

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

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "test_intro"
	},
	timing_response: 180000,
	text: '<div class = centerbox>'+
			'<p class = block-text>We will now start the test portion</p>'+
			
			'<p class = block-text>You will see a cue, either <strong>magnitude</strong> or <strong>parity</strong>, followed by a number.</p>'+
			
			'<p class = block-text>The cue will instruct you how to respond to the upcoming number.</p>'+
			
			'<p class = block-text>If you see the cue, <strong>magnitude</strong>, please judge whether the number is higher or lower than 5.  Press the '+response_keys.key_name[0]+' key if higher than 5, and the '+response_keys.key_name[1]+' key if lower than five.</p> '+
		
			'<p class = block-text>If you see the cue, <strong>parity</strong>, please judge whether the number is odd or even.  Press the '+response_keys.key_name[0]+' key if even, and the '+response_keys.key_name[1]+' key if odd.</p> '+
			
			'<p class = block-text>On some trials, a star will appear around the number.  The star will appear with, or shortly after the number appears.</p>'+
			
			'<p class = block-text>If you see a star appear, please try your best to make no response on that trial.</p>'+
		
			'<p class = block-text>Please do not slow down your responses to the number in order to wait for the star.  Continue to respond as quickly and accurately as possible to the number.</p>'+
	
			'<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press Enter to begin.</p>'+ 
		 '</div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function(){
		feedback_text = "We will now start the test portion. Press enter to begin."
		current_trial = 0
		stims = testStims
		task_switches = jsPsych.randomization.repeat(task_switches, test_length / 4)
	}
};

/* define practice and test blocks */
var setStims_block = {
  type: 'call-function',
  data: {
    trial_id: "set_stims"
  },
  func: setStims,
  timing_post_trial: 0
}


var fixation_block = {
  type: 'poldrack-single-stim',
  stimulus: '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "fixation"
  },
  timing_post_trial: 0,
  timing_stim: 500,
  timing_response: 500,
  prompt: prompt_text,
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({
      exp_stage: exp_stage
    })
  }
}
var cue_block = {
  type: 'poldrack-single-stim',
  stimulus: getCue,
   is_html: true,
   choices: 'none',
   data: {
     trial_id: 'cue'
  },
  timing_response: getCTI,
  timing_stim: getCTI,
  timing_post_trial: 0,
  prompt: prompt_text,
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({
      exp_stage: exp_stage
    })
     appendData()
  }
};

var test_feedback_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "feedback",
		exp_stage: "test"
	},
	timing_response: 180000,
	cont_key: [13],
	text: getFeedback,
	on_finish: function() {
    test_block_data = []
    current_trial = 0
    stims = testStims
    task_switches = jsPsych.randomization.repeat(task_switches, test_length / 4)
	}
};





NoSS_practice_trials = []
NoSS_practice_trials.push(feedback_block)
for (var i = 0; i < practice_length; i++) {
  NoSS_practice_trials.push(setStims_block)
  NoSS_practice_trials.push(fixation_block)
  NoSS_practice_trials.push(cue_block)
    var stim_block = {
      type: 'poldrack-categorize',
      stimulus: getStim,
      is_html: true,
      key_answer: getResponse,
     choices: choices,
     data: {
       trial_id: 'stim',
        exp_stage: "NoSS_practice"
        
      },
	correct_text: '<div class = fb_box><div class = center-text><font size =20>Correct!</font></div></div>',
	incorrect_text: '<div class = fb_box><div class = center-text><font size =20>Incorrect!</font></div></div>',
	timeout_message: '<div class = fb_box><div class = center-text><font size =20>Respond Faster!</font></div></div>',
    timing_feedback_duration: 750,
    show_stim_with_feedback: false,
    timing_response: 2000,
    timing_stim: 1000,
    timing_post_trial: 0,
    prompt: prompt_text,
    on_finish: appendData
  }
    NoSS_practice_trials.push(stim_block)
} 
var NoSS_practice_node = {
    timeline: NoSS_practice_trials,
    loop_function: function(data) {
      practice_repetitions += 1
      var rt_array = [];
      var sum_correct = 0;
      var go_length = 0;
      var num_responses = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i].trial_id == 'stim') {
          if (data[i].rt != -1) {
            num_responses += 1
            rt_array.push(data[i].rt);
            var correct_response = getResponse()
            if (data[i].key_press === correct_response) {
              sum_correct += 1

            }
          }
          go_length += 1
        } 
      }
      var average_rt = -1
      if (rt_array.length !== 0){
        average_rt = math.median(rt_array);

      }
      
      var GoCorrect_percent = sum_correct / go_length;
      var missed_responses = (go_length - num_responses) / go_length
      feedback_text = "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy for non-star trials: " + Math.round(GoCorrect_percent * 100)+ "%</strong>" 
      if ((average_rt < RT_thresh && GoCorrect_percent > accuracy_thresh && missed_responses <
				missed_response_thresh) || practice_repetitions > practice_repetition_thresh) {
			// end the loop
			current_trial = 0
			practice_repetitions = 1
			feedback_text +=
				'</p><p class = block-text>For the rest of the experiment, on some proportion of trials a black "stop signal" in the shape of a star will appear around the number on the screen, as shown below. When this happens please try your best to stop your response and press nothing on that trial.</p><p class = block-text>The star will appear around the same time or shortly after the shape appears. Because of this, you will not always be able to successfully stop when a star appears. However, if you continue to try very hard to stop when a star appears, you will be able to stop sometimes but not always.</p><p class = block-text><strong>Please balance the requirement to respond quickly and accurately to the tasks while trying very hard to stop to the stop signal.</strong></p><p class = block-text>Press <strong>Enter</strong> to continue'
        return false;
		} else {
      stims = genStims(practice_length)
			// keep going until they are faster!
			feedback_text += '</p><p class = block-text>We will try another practice block. '
			if (average_rt > RT_thresh) {
				feedback_text +=
					'</p><p class = block-text>You have been responding too slowly, please respond to each cue as quickly and as accurately as possible.'
			}
			if (missed_responses >= missed_response_thresh) {
				feedback_text +=
					'</p><p class = block-text><strong>We have detected a number of trials that required a response, where no response was made.  Please ensure that you are responding to each number.</strong>'
			}
			if (GoCorrect_percent <= accuracy_thresh) {
				feedback_text +=
					'</p><p class = block-text>Your accuracy is too low. Remember, the correct keys are as follows: ' + prompt_text
			}
			feedback_text += '</p><p class = block-text>Press <strong>Enter</strong> to continue'
      current_trial = 0
      return true;
		}
   }
}


var practice_trials = []
practice_trials.push(feedback_block)
for (i = 0; i < practice_length; i++) {
  practice_trials.push(setStims_block)
  practice_trials.push(fixation_block)
  practice_trials.push(cue_block)
  var stop_signal_block = {
    type: 'stop-signal',
    stimulus: getStim,
    SS_stimulus: stop_signal,
    SS_trial_type: getSSPractice_trial_type,
    data: {
        trial_id: "practice_with_stop",
        exp_stage: "SS_practice",
        task: curr_task
    },
    is_html: true,
    key_answer: getResponse,
    choices: choices,
    show_stim_with_feedback: true,
      timing_response: 2000,
     timing_stim: 1000,
     SSD: SSD,
     timing_SS: 500,
     timing_post_trial: 0,
     prompt: prompt_text,
      on_finish: appendData
  }
  
  var categorize_block = {
	type: 'poldrack-single-stim',
	data: {
		exp_id: "cued_predictive_task_switching",
		trial_id: "practice-no-stop-feedback"
	},
	choices: 'none',
	stimulus: getCategorizeFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_stim: 500,
	timing_response: 500,
	response_ends_trial: false, 

  };
  practice_trials.push(stop_signal_block)
  practice_trials.push(categorize_block)
}



var practice_node = {
  timeline: practice_trials,
  loop_function: function(data) {
    practice_repetitions += 1
    var rt_array = [];
    var sum_correct = 0;
    var go_length = 0;
    var num_responses = 0;
    var stop_length = 0
    var successful_stops = 0
    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == 'stim') {
        if (data[i].SS_trial_type == "go") {
          if (data[i].rt != -1) {
            num_responses += 1
            rt_array.push(data[i].rt);
            var correct_response = 0
            if (data[i].task == 'magnitude') {
              if (data[i].stim_number > 5) {
                correct_response = response_keys.key[0]
              } else {
                correct_response = response_keys.key[1]
              }
            } else if (data[i].task == 'parity') {
              if (data[i].stim_number % 2 === 0) {
                correct_response = response_keys.key[0]
              } else {
                correct_response = response_keys.key[1]
              }
            }
            if (data[i].key_press == correct_response) {
              sum_correct += 1
          }
        }
        go_length += 1
      } else if (data[i].SS_trial_type == "stop") {
        stop_length += 1
        if (data[i].rt == -1) {
          successful_stops += 1
        }
      }
    }
  }
    var average_rt = -1
    if (rt_array.length !== 0){
      average_rt = math.median(rt_array);

    }
    var GoCorrect_percent = sum_correct / go_length;
    var missed_responses = (go_length - num_responses) / go_length
    var StopCorrect_percent = successful_stops / stop_length
    feedback_text = "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy for non-star trials: " + Math.round(GoCorrect_percent * 100)+ "%</strong>" 
    if ((average_rt < RT_thresh && GoCorrect_percent > accuracy_thresh && missed_responses <
      missed_response_thresh && StopCorrect_percent > 0.2 && StopCorrect_percent < 0.8) || practice_repetitions > practice_repetition_thresh) {
    // end the loop
    current_trial = 0
    feedback_text +=
      '</p><p class = block-text>Done with practice. We will now begin the ' + 
      numblocks +
      ' test blocks. There will be a break after each block. Press <strong>enter</strong> to continue.'
    return false;
  } else {
    //rerandomize stim and stop_trial order
    stims = genStims(practice_length)
    practice_stop_trials = jsPsych.randomization.repeat(practice_stop_trials, practice_length / 10)
    // keep going until they are faster!
    feedback_text += '</p><p class = block-text>We will try another practice block. '
    if (average_rt > RT_thresh) {
      feedback_text +=
        '</p><p class = block-text>You have been responding too slowly, please respond to each cue as quickly and as accurately as possible.'
    }
    if (missed_responses >= missed_response_thresh) {
      feedback_text +=
        '</p><p class = block-text><strong>We have detected a number of trials that required a response, where no response was made.  Please ensure that you are responding to each number, unless a star appears.</strong>'
    }
    if (GoCorrect_percent <= accuracy_thresh) {
      feedback_text +=
        '</p><p class = block-text>Your accuracy is too low. Remember, the correct keys are as follows: ' + prompt_text_list
    }
    if (StopCorrect_percent < 0.8) {
      feedback_text +=
      '</p><p class = block-text><strong>Remember to try and withhold your response when you see a stop signal.</strong>'  
    } else if (StopCorrect_percent > 0.2) {
      feedback_text +=
      '</p><p class = block-text><strong>Remember, do not slow your responses to the number to see if a star will appear before you respond.  Please respond to each number as quickly and as accurately as possible.</strong>'
    }
    feedback_text += '</p><p class = block-text>Press <strong>Enter</strong> to continue'
    current_trial = 0
    return true;
    }
  }
}

var test_SSblock = []

  test_SSblock.push(feedback_block)
    for (i = 0; i < test_length; i++) {
      test_SSblock.push(setStims_block)
      test_SSblock.push(fixation_block)
        var test_block = {
          type: 'stop-signal',
          stimulus: getStim,
          SS_stimulus: stop_signal,
          SS_trial_type: getSStrial_type,
          is_html: true,
          key_answer: getResponse,
          choices: choices,
          data: {
            trial_id: 'stim',
            exp_stage: 'test'
          },
          timing_post_trial: 0,
          timing_response: 2000,
          timing_stim: 1000,
          SSD: getSSD,
          timing_SS: 500,
          prompt: prompt_text,
          on_finish: function(data) {
            appendData()
            updateSSD(data)
            test_block_data.push(data)
          } 
        }
        test_SSblock.push(test_block)
      } 
    

    var test_node = {
      timeline: test_SSblock,
      loop_function: function(data) {
        var rt_array = [];
        var sum_correct = 0;
        var go_length = 0;
        var num_responses = 0;
        var stop_length = 0
        var successful_stops = 0
        for (var i = 0; i < data.length; i++) {
          if (data[i].trial_id == 'stim') {
            if (data[i].SS_trial_type == "go") {
              go_length += 1
              if (data[i].rt != -1) {
                num_responses += 1
                rt_array.push(data[i].rt);
                var correct_response = 0
                if (data[i].task == 'magnitude') {
                  if (data[i].stim_number > 5) {
                    correct_response = response_keys.key[0]
                  } else {
                    correct_response = response_keys.key[1]
                  }
                } else if (data[i].task == 'parity') {
                  if (data[i].stim_number % 2 === 0) {
                    correct_response = response_keys.key[0]
                  } else {
                    correct_response = response_keys.key[1]
                  }
                }
                if (data[i].key_press == correct_response) {
                  sum_correct += 1
              }
            }
           
          } else {
            stop_length += 1
            if (data[i].rt == -1) {
              successful_stops += 1
            }
          }
        }
      }
      var average_rt = -1;
  if (rt_array.length !== 0) {
    average_rt = math.median(rt_array);
    rtMedians.push(average_rt)
  }
  var rt_diff = 0
  if (rtMedians.length !== 0) {
    rt_diff = (average_rt - rtMedians.slice(-1)[0])
  }
  var GoCorrect_percent = sum_correct / go_length;
  var missed_responses = (go_length - num_responses) / go_length
  var StopCorrect_percent = successful_stops / stop_length
  stopAccMeans.push(StopCorrect_percent)
  var stopAverage = math.mean(stopAccMeans)
  
	feedback_text = "<br>Done with a test block. Please take this time to read your feedback and to take a short break! Press <strong>enter</strong> to continue after you have read the feedback."
	feedback_text += "</p><p class = block-text><strong>Average reaction time:  " + Math.round(average_rt) + " ms. Accuracy for non-star trials: " + Math.round(GoCorrect_percent * 100)+ "%</strong>" 
	if (average_rt > RT_thresh || rt_diff > rt_diff_thresh) {
		feedback_text +=
			'</p><p class = block-text>You have been responding too slowly, please respond to each number as quickly and as accurately as possible.'
	}
	if (missed_responses >= missed_response_thresh) {
		feedback_text +=
			'</p><p class = block-text><strong>We have detected a number of trials that required a response, where no response was made.  Please ensure that you are responding to each number, unless a star appears.</strong>'
	}
	if (GoCorrect_percent < accuracy_thresh) {
		feedback_text += '</p><p class = block-text>Your accuracy is too low. Remember, the correct keys are as follows: ' + prompt_text_list
	}
	if (StopCorrect_percent < (0.5-stop_thresh) || stopAverage < 0.45){
			 	feedback_text +=
			 		'</p><p class = block-text><strong>Remember to try and withhold your response when you see a stop signal.</strong>'	
	} else if (StopCorrect_percent > (0.5+stop_thresh) || stopAverage > 0.55){
	 	feedback_text +=
	 		'</p><p class = block-text><strong>Remember, do not slow your responses to the numbers to see if a star will appear before you respond.  Please respond to each number as quickly and as accurately as possible.</strong>'
	}


 return false;

      }
}




/* create experiment definition array */ 
var cued_task_switching_with_stop_signal_experiment = [];
cued_task_switching_with_stop_signal_experiment.push(instruction_node);
cued_task_switching_with_stop_signal_experiment.push(practice1);
cued_task_switching_with_stop_signal_experiment.push(practice2);
cued_task_switching_with_stop_signal_experiment.push(practice3);
cued_task_switching_with_stop_signal_experiment.push(practice4);

cued_task_switching_with_stop_signal_experiment.push(practice_node)

cued_task_switching_with_stop_signal_experiment.push(start_test_block)

for (var b =0; b < numblocks; b++) {
cued_task_switching_with_stop_signal_experiment.push(test_node)
}
cued_task_switching_with_stop_signal_experiment.push(test_feedback_block)


cued_task_switching_with_stop_signal_experiment.push(attention_node)
cued_task_switching_with_stop_signal_experiment.push(post_task_block)
cued_task_switching_with_stop_signal_experiment.push(end_block)

