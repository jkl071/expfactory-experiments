/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

function getITI(){
/* Quick implementation of Exponential and Geometric random number generators
For example you can use it to simulate when an event is going to happen next, given its average rate:
Buses arrive every 30 minutes on average, so that's an average rate of 2 per hour.
I arrive at the bus station, I can use this to generate the next bus ETA:
  randomExponential(2); // => 0.3213031016466269 hours, i.e. 19 minutes   
*/
// Exponential random number generator
// Time until next arrival
function randomExponential(rate, randomUniform) {
  // http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates
  rate = rate || 1;

  // Allow to pass a random uniform value or function
  // Default to Math.random()
  var U = randomUniform;
  if (typeof randomUniform === 'function') U = randomUniform();
  if (!U) U = Math.random();

  return -Math.log(U)/rate;
}

ITI = randomExponential(1200) * 60 * 60 * 1000 // 1200 because mean is 3s, so 1200 per hour. multiplied by two 60's and 1 1000, to turn hours -> milliseconds.

if (ITI > 12000){
	ITI = 12000

} else if (ITI < 1000){
	ITI = 1000

}
	return ITI
}

function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}


function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'stop_change_food', subject_ID: subject_ID})
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


var createBlockStims = function(WTP_sort){
	var stimArray = []
	for (var i = 1; i < WTP_sort.length; i++){
		var temp_stim = WTP_sort[i]
		var stim_num = temp_stim[5] + temp_stim[6]
		var index = getAllIndexesList(all_lists,i)
		WTP = temp_stim[0]+temp_stim[1]+temp_stim[2]+temp_stim[3]

		stim = {
			stim: stims[parseInt(stim_num)],
			stim_num: stim_num,
			stim_WTP: WTP,
			condition: all_lists_names[index[0][1]],
			stim_WTP_order_number: i,
			correct_response: correct_responses[index[0][1]][1],
			stop_type: correct_responses[index[0][1]][2]
			
		}
		stimArray.push(stim)
	}
	stimArray = jsPsych.randomization.repeat(stimArray,1,true)
	return stimArray
}


var createForcedStims = function(){
	var whichComparisons = [[1,0],[2,3],[5,7],[4,6]]
	var numComparisons = whichComparisons.length
	all_forced_array = []
	for (var i = 0; i < numComparisons; i++){
		var combo = whichComparisons.pop()
		var first_set = all_lists[combo[0]]
		var second_set = all_lists[combo[1]]
		
		for (var x = 0; x < numComparisons; x++){
			for (var y = 0; y < numComparisons; y++){
				all_forced_array.push([first_set[x], second_set[y]])
				all_forced_array.push([second_set[y], first_set[x]])			
			
			}
		}
	
	}
	all_forced_array = jsPsych.randomization.repeat(all_forced_array,1)
	return all_forced_array
}


var createStimsArray = function(numStims){
	var stimArray = []
	for (var i = 0; i < numStims; i++){
		num_zeros = 2 - i.toString().length
		if (num_zeros === 0) {
			stimArray.push(i.toString())
		}else if (num_zeros == 1) {
			stimArray.push('0' + i)
		}
		
	}
	stimArray = jsPsych.randomization.repeat(stimArray,1)
	return stimArray
	
}

var hitKey = function(whichKey){
	e = jQuery.Event("keydown");
  	e.which = whichKey; // # Some key code value
  	e.keyCode = whichKey
  	$(document).trigger(e);
 	e = jQuery.Event("keyup");
  	e.which = whichKey; // # Some key code value
  	e.keyCode = whichKey
  	$(document).trigger(e)
}


document.addEventListener("keydown", function(e){
    var keynum;
    if(window.event){
    	keynum = e.keyCode;
    } else if(e.which){
    	keynum = e.which;
    }
        
    if (exp_phase == 'pre_rating'){
    	if (keynum == 13){
    		ratingSubmit(document.getElementById('myRange'))
    	}
    
    } 
    
    if (exp_phase == 'post_rating'){
    	if (keynum == 13){
    		ratingSubmit(document.getElementById('myRange'))
    	}
    
    }
    
    
    if (exp_phase == 'forced_choice'){
    	forcedButtonTracker.push(keynum)
    	if ((keynum == 37) &&  (forcedButtonTracker.indexOf(39) == -1)){
    		forced_chosen = stimLeft
    		$('#image_left').addClass('selected');
    		hitKey(81)
    	} else if ((keynum == 39) && (forcedButtonTracker.indexOf(37) == -1)){
    		forced_chosen = stimRight
    		$('#image_right').addClass('selected');
    		hitKey(81)
    
    	}
    
    } 
    
});


var getRatingBoard = function(){
	stim_num = stimArray.pop()
	return ratingBoard1 + stim_num + ratingBoard2
}


var getForcedChoiceBoard = function(){
		var forced_combo = forced_stims.pop()
		var stimLeftTemp = forced_combo[0]
		var stimRightTemp = forced_combo[1]
		
		var stimLeftTemp2 = WTP_sort[stimLeftTemp]
		var stimRightTemp2 = WTP_sort[stimRightTemp]
		
		stimLeft = stimLeftTemp2[5] + stimLeftTemp2[6]
		stimLeftWTP = stimLeftTemp2[0] + stimLeftTemp2[1] + stimLeftTemp2[2]
		stimRight = stimRightTemp2[5] + stimRightTemp2[6]
		stimRightWTP = stimRightTemp2[0] + stimRightTemp2[1] + stimRightTemp2[2]
		
	return forcedChoiceBoard1 + stimLeft + forcedChoiceBoard2 + stimRight + forcedChoiceBoard3
}


var ratingSubmit = function(myRange){
	WTP = myRange.value
	
	WTP_sort.push(parseFloat(WTP).toFixed(2) + '_' + stim_num)
	hitKey(81)
}

var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	
	if ((trial_id == "pre_rating") || (trial_id == "post_rating")){
		
		jsPsych.data.addDataToLastTrial({
			stim_number: stim_num,
			stim: stims[parseInt(stim_num)],
			stim_WTP: WTP,
			current_exp_stage: exp_phase
		})
	
	} else if (trial_id == "forced_choice"){
		
		jsPsych.data.addDataToLastTrial({
			stim_left_number: stimLeft,
			stim_left: stims[parseInt(stimLeft)],
			stim_left_WTP: stimLeftWTP,
			stim_right_number: stimRight,
			stim_right: stims[parseInt(stimRight)],
			stim_right_WTP: stimRightWTP,
			forced_chosen: forced_chosen,
			current_exp_stage: exp_phase
		})
	
	} else if (trial_id == "stopping"){	
		jsPsych.data.addDataToLastTrial({
			stim: stim,
			stim_num: stim_num,
			stim_WTP: stim_WTP,
			condition: stim_condition,
			stim_WTP_order_number: stim_WTP_order_number,
			correct_response: correct_response,
			stop_type: stop_type,
			SSD: SSD,
			current_exp_stage: exp_phase
		})
		
	
		if((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response) && (SSD<884) && (stop_type == 'stop')){
			SSD = SSD + 17
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response) && (SSD>0) && (stop_type == 'stop')){
			SSD = SSD - 50
		}
	
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response) && (stop_type == 'go')){
			jsPsych.data.addDataToLastTrial({no_stop_change_acc: 1})
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response) && (stop_type == 'go')){
			jsPsych.data.addDataToLastTrial({no_stop_change_acc: 0})
		}
	
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == stim.correct_response) && (stim.stop_type == 'stop')){
			jsPsych.data.addDataToLastTrial({stop_change_acc: 1})
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != stim.correct_response) && (stim.stop_type == 'stop')){
			jsPsych.data.addDataToLastTrial({stop_change_acc: 0})
		}
	}
}


var getForcedText = function(){
	if (forcedCount == 0){
		return '<div class = bigbox><div class = centerbox>'+
		  		'<p class = center-textJamie><font color="white">We will now move onto the selection phase.</font></p>'+
		  		'<p class = center-textJamie><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		   	   '</div></div>'
	} else if (forcedCount == 1){
		return '<div class = bigbox><div class = centerbox>'+
		  		'<p class = center-textJamie><font color="white">Take a break.</font></p>'+
		  		'<p class = center-textJamie><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		   	   '</div></div>'
	}
}

var getSSD = function(){
	return SSD

}		
			
var getStopType = function(){
	return stop_type
}

var getStoppingBoard = function(){
	stim_num = block_stims.stim_num.pop()
	stim = block_stims.stim.pop()
	stim_WTP = block_stims.stim_WTP.pop()
	stim_condition = block_stims.condition.pop()
	stim_WTP_order_number = block_stims.stim_WTP_order_number.pop()
	correct_response = block_stims.correct_response.pop()
	stop_type = block_stims.stop_type.pop()
	
	
	return stoppingBoard1 + stim_num + stoppingBoard2
}


/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
var subject_ID = 472


var numStims = stims.length
var stimArray = createStimsArray(numStims)


var preFileType = "<img class = center src='/static/experiments/stop_change_food/images/"
var forcedLeftFileType = "<img id = 'image_left' class = center src='/static/experiments/stop_change_food/images/"
var forcedRightFileType = "<img id = 'image_right' class = center src='/static/experiments/stop_change_food/images/"
var pathSource = "/static/experiments/stop_change_food/images/stim_numbered/"
var fileTypePNG = ".png'></img>"


var audioFiles = ['/static/experiments/stop_change_food/' + 'audio/100ms.wav']
jsPsych.pluginAPI.preloadAudioFiles(audioFiles)


var stim = ''
var SSD = 250
var WTP = ''
var exp_phase = 'start'
var block_stims = []
var forcedButtonTracker = []
var forced_sitms = []
var WTP_sort = []
var all_lists = [[8, 11, 12, 15],[9, 10, 13, 14],[46, 49, 50, 53],[47, 48, 51, 52],[16, 19, 20, 23],[17, 18, 21, 22],[38, 41, 42, 45],[39, 40, 43, 44],[1,2,3,4,5,6,7,24,25,26,27,28,29,30,31,32,33,34,35,36,37,54,55,56,57,58,59,60]]
// above variable partitions conditions, and puts them in a list of lists
var all_lists_names = ['high_val_no_stop_change_1','high_val_stop_change_1','low_val_no_stop_change_1','low_val_stop_change_1','high_val_no_stop_change_2','high_val_stop_change_2','low_val_no_stop_change_2','low_val_stop_change_2','no_stop_change_remainder']
// above variable has names, whose position in all_lists_names corresponds to the list in all_lists.
var correct_responses = [['M key',77,'go'],['Z key',90,'stop'],['M key',77,'go'],['Z key',90,'stop'],['M key',77,'go'],['Z key',90,'stop'],['M key',77,'go'],['Z key',90,'stop'],['M key',77,'go']]
var stimLeft = ''
var stimLeftWTP = ''
var stimRight = ''
var stimRightWTP = ''
var forced_chosen = ''

/* ************************************ */
/*          Define Game Boards          */
/* ************************************ */

var practiceRatingBoard1 = '<div class = bigbox><div class = centerbox>'+
							'<div class = practice_rating_text>'+
								'<p class = center-text2><font color = "white">This is a practice auction trial.  For this trial, please input how much you are willing to pay for the item.</font></p>'+
								'<p class = center-text2><font color = "white">Use the slider, then press enter when you are done. </font></p>'+
						   	'</div>'+
						   	'<div class = picture_box>'+preFileType 


var ratingBoard1 = '<div class = bigbox><div class = centerbox>'+
						'<div class = picture_box>'+
						preFileType

var ratingBoard2 = fileTypePNG +
						'</div>'+
		  				'<div class = slider_box>'+
		  					'<input type="range" step="0.01" min="0" max="3" value="1.50" class="slider" id="myRange">'+
		  				'</div>'+
		  				'<div id="number_box">'+
  							'<div><font color="white">$0</font></div>'+
  							'<div><font color="white">$1</font></div>'+
  							'<div><font color="white">$2</font></div>'+
  							'<div><font color="white">$3</font></div>'+
		    			'</div>'+	
		  			'</div></div>'
		  		

	
		  			
var stoppingBoard1 = '<div class = bigbox><div class = centerbox>'+
						'<div class = picture_box>'+
						preFileType

var stoppingBoard2 = fileTypePNG +
						'</div>'+	
		 			 '</div></div>'
		 			 

		 			 
		 			 
var forcedChoiceBoard1 = '<div class = bigbox>'+
							'<div class = decision-left>'+forcedLeftFileType
							
var forcedChoiceBoard2 = 	fileTypePNG+'</div>'+
							'<div class = decision-right>'+forcedRightFileType
							
var forcedChoiceBoard3 = 	fileTypePNG+'</div>'+'<div class = fixationbox><div class = fixation><font color="white">+</font></div></div>'+
		  				'</div>'


/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */

var test_img_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = centerbox><div class = fixation><font color="white">+</font></div></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
		},
	timing_post_trial: 0,
	timing_stim: 1,
	timing_response: 1
	};


var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie><font color="white">Thanks for completing this task!</font></p>'+
		  '<p class = center-textJamie><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0
};


var welcome_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "welcome",
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie><font color="white">Welcome to the task!</font></p>'+
		  '<p class = center-textJamie><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var stopping_intro_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "stopping_intro",
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie><font color="white">We will now move onto the stopping portion.</font></p>'+
		  '<p class = center-textJamie><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var post_rating_intro_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "stopping_intro",
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie><font color="white">In this phase, you will participate in a second auction.  Please input how much you are willing to pay for each food item on the screen.</font></p>'+
		  '<p class = center-textJamie><font color="white">You will have $3 to spend on every food item.</font></p>'+
		  '<p class = center-textJamie><font color="white">Please ensure that you are inputting your <strong>TRUE</strong> willingness to pay value for each item.</font></p>'+	
		  '<p class = center-textJamie><font color="white">This phase is self-paced, so take your time to decide the amount of money you are willing to spend on each item.</font></p>'+	
		  '<p class = center-textJamie><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: function(){
	exp_phase = 'post_rating'
	}
};

var pre_rating_intro_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "stopping_intro",
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie><font color="white">We will now begin the auction.</font></p>'+
		  '<p class = center-textJamie><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: function(){
	exp_phase = 'pre_rating'
	}
};

var instructions_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instructions",
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
			'<p class = block-text><font color = "white">This experiment is composed of four phases.</font></p>'+
			'<p class = block-text><font color = "white">In this first phase, you will participate in an auction.  Food items will be presented on the screen one at a time.</font></p>'+
			'<p class = block-text><font color = "white">For each item, please use the slider to input how much you are willing to pay for that item.  Once you have chosen your amount, press <strong>enter</strong> to move on to the next trial.</font></p>'+
			'<p class = block-text><font color = "white">You will have $3 to spend for <strong>each food item on every trial</strong>.</font></p>'+	
			'<p class = block-text><font color = "white">Please ensure that you are inputting your <strong>TRUE</strong> willingness to pay value for each item.</font></p>'+	
			'<p class = block-text><font color = "white">This phase is self-paced, so take your time to decide the amount of money you are willing to spend on each item.</font></p>'+	
			'<p class = block-text><font color = "white">We will start with a practice trial.</font></p>'+
			'<p class = block-text><font color = "white">Press <strong>enter</strong> to continue.</font></p>'+		
		 '</div></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var forced_intro_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "forced_intro",
	},
	timing_response: -1,
	text: getForcedText,
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: function(){
		exp_phase = 'forced_choice'
	}
};


var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = centerbox><div class = fixation><font color="white">+</font></div></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
	},
	timing_post_trial: 0,
	timing_stim: getITI,
	timing_response: getITI
};

var BIS11_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "stopping_intro",
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie><font color="white">Please get the experimenter.</font></p>'+	
		  '<p class = center-textJamie><font color="white">You will complete a survey in the next phase.</font></p>'+	
		  '<p class = center-textJamie><font color="white">Patrick, press Q to escape this page.</font></p>'+	
		  '</div></div>',
	cont_key: [81],
	timing_post_trial: 0,
};

/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */

var practice_rating_block = {
	type: 'poldrack-single-stim',
	stimulus: practiceRatingBoard1 + '/demo/MrsFields' + ratingBoard2,
	is_html: true,
	choices: [81],
	data: {
		trial_id: 'pre_rating',
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true,
	}

pre_rating_trials = []
for(var x = 0; x < stimArray.length; x++){
	var rating_block = {
	type: 'poldrack-single-stim',
	stimulus: getRatingBoard,
	is_html: true,
	choices: [81],
	data: {
		trial_id: 'pre_rating',
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true,
	on_finish: appendData
};
	
	pre_rating_trials.push(rating_block)
}

var pre_rating_node = {
	timeline: pre_rating_trials,
	loop_function: function(data){
		exp_phase = 'stop_change_trials'
		WTP_sort.sort()
		WTP_sort.reverse()
		WTP_sort.unshift('placeholder')
		block_stims = createBlockStims(WTP_sort)
	
	

	}
}


stopping_trials = []
for(var x= 0; x < stimArray.length; x++){
	var stopping_block = {
	type: 'poldrack-single-audio',
	stimulus: getStoppingBoard,
	is_html: true,
	choices: [77,90],
	data: {
		trial_id: "stopping",
	},
	timing_post_trial: 0,
	timing_stim: 1000,
	timing_response: 1000,
	SS_path:  '/static/experiments/stop_change_food/audio/100ms.wav', 
	SS_delay:  getSSD, 
	SS_trial_type: getStopType,
	on_finish: appendData
	};
	
	var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = centerbox><div class = fixation><font color="white">+</font></div></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: getITI
	};
	
	stopping_trials.push(stopping_block)
	stopping_trials.push(fixation_block)
};

var stopping_node = {
	timeline: stopping_trials,
	loop_function: function(data){
	forced_stims = createForcedStims()
	
	}
}



var getFeedbackTiming = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial - 1).trial_id
	if(trial_id == 'forced_choice'){
		if (jsPsych.data.getDataByTrialIndex(curr_trial - 1).rt != -1){
			return 1
		
		}
		else if (jsPsych.data.getDataByTrialIndex(curr_trial - 1).rt == -1){
			return 500
		
		}
	
	}
	
}


var getForcedFeedback = function(){
	curr_trial = jsPsych.progress().current_trial_global
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial - 1).trial_id
	if(trial_id == 'forced_choice'){
		if (jsPsych.data.getDataByTrialIndex(curr_trial - 1).rt != -1){
			return '<div class = bigbox><div class = centerbox><div class = fixation><font color="white">+</font></div></div></div>'
		
		}
		else if (jsPsych.data.getDataByTrialIndex(curr_trial - 1).rt == -1){
			return '<div class = bigbox><div class = centerbox>'+
		  '<p class = center-textJamie><font color="white">Respond Faster</font></p>'+
		  '</div></div>'
		
		}
	
	}

	

}

forced_choice_trials = []
forced_choice_trials.push(forced_intro_block)

for(var x = 0; x < numStims; x++){
	var forced_choice_block = {
	type: 'poldrack-single-stim',
	stimulus: getForcedChoiceBoard,
	is_html: true,
	choices: [81],
	data: {
		trial_id: 'forced_choice',
	},
	timing_post_trial: 0,
	timing_stim: 1500,
	timing_response: 1500,
	response_ends_trial: false,
	on_finish: appendData,
	on_start: function(){
		forcedButtonTracker = []
		forced_chosen = ''
		}	
	};
	
	var feedback_block = {
	type: 'poldrack-single-stim',
	stimulus: getForcedFeedback,
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
		},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: getFeedbackTiming
	};
	
	var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = centerbox><div class = fixation><font color="white">+</font></div></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
		},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: getITI
	};
	forced_choice_trials.push(forced_choice_block)
	forced_choice_trials.push(feedback_block)
	forced_choice_trials.push(fixation_block)
}

var forcedCount = 0
var forced_choice_node = {
	timeline: forced_choice_trials,
	loop_function: function(data){
	
		forcedCount += 1
		if (forcedCount == 1){
			return true
		
		} else if (forcedCount == 2){
			stimArray = createStimsArray(numStims)
			WTP_sort = []					
			return false
	
		}

	}
}


post_rating_trials = []
for(var x = 0; x < stimArray.length; x++){
	var rating_block = {
	type: 'poldrack-single-stim',
	stimulus: getRatingBoard,
	is_html: true,
	choices: [81],
	data: {
		trial_id: 'post_rating',
	},
	timing_post_trial: 0,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true,
	on_finish: appendData
};
	
	post_rating_trials.push(rating_block)
}

var post_rating_node = {
	timeline: post_rating_trials,
	loop_function: function(data){
	
	}
}
/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var stop_change_food_experiment = []

stop_change_food_experiment.push(welcome_block);

stop_change_food_experiment.push(instructions_block);
stop_change_food_experiment.push(practice_rating_block);

stop_change_food_experiment.push(pre_rating_intro_block);
stop_change_food_experiment.push(pre_rating_node);

stop_change_food_experiment.push(stopping_intro_block);
stop_change_food_experiment.push(stopping_node);

stop_change_food_experiment.push(BIS11_block)

stop_change_food_experiment.push(forced_choice_node);

stop_change_food_experiment.push(post_rating_intro_block);
stop_change_food_experiment.push(post_rating_node);

stop_change_food_experiment.push(end_block);




