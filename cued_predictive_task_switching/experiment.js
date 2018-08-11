/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'cued_predictive_task_switching', subject_ID: subject_ID})
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


var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
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


var getCue = function(){
	stim = stims.shift()
	magnitude = stim.magnitude
	color = stim.color
	parity = stim.parity
	size = stim.size
	number = stim.number
	whichQuadrant = stim.whichQuad
	
	cued_condition = stim.cued_condition
	cued_dimension = stim.cued_dimension
	predictive_condition = stim.predictive_condition
	predictive_dimension = stim.predictive_dimension
	
	return '<div class = bigbox><div class = centerbox><div class = fixation><font color="white">' + cued_dimension + '</font></div></div></div>'	
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
	var cued_cond_array = jsPsych.randomization.repeat(cued_conditions,numTrialsPerBlock/2)
	var predictive_cond_array = predictive_conditions[whichQuadStart%2]
	
	var stims = []
	var cued_dimensions = [third.dimension,fourth.dimension]
	var predictive_dimensions = [first.dimension,first.dimension,second.dimension,second.dimension]
	var numIndex = ''
	
	var magnitude = magnitudes[Math.floor(Math.random() * 2)]
	var color = colors[Math.floor(Math.random() * 2)]
	var parity = parities[Math.floor(Math.random() * 2)]
	var size = sizes[Math.floor(Math.random() * 2)]
	
	cued_dimension = cued_dimensions[Math.floor(Math.random() * 2)]
	
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
	
	first_stim = {
		magnitude: magnitude,
		color: color,
		parity: parity,
		size: size,
		number: number,
		whichQuad: whichQuadStart,
		cued_dimension: cued_dimension,
		cued_condition: "N/A",
		predictive_dimension: predictive_dimensions[whichQuadStart - 1],
		predictive_condition: "N/A"
		
	}
	
	stims.push(first_stim)
	
	for (var i = 0; i < numTrialsPerBlock; i++){
		cued_cond = cued_cond_array.pop()
		predictive_cond = predictive_cond_array[i%2]
		whichQuadStart += 1
		quadIndex = whichQuadStart%4
		if (quadIndex == 0){
			quadIndex = 4
		}
		
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
	
		stim = {
			magnitude: magnitude,
			color: color,
			parity: parity,
			size: size,
			number: number,
			whichQuad: quadIndex,
			cued_dimension: cued_dimension,
			cued_condition: cued_cond,
			predictive_dimension: predictive_dimensions[quadIndex - 1],
			predictive_condition: predictive_cond
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
			predictive_dimension: predictive_dimension		
		})
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
		
		jsPsych.data.addDataToLastTrial({
			correct_response: possible_responses[combo_index[0][1]][1],
		})
		
		response_index = getAllIndexesList(possible_responses,jsPsych.data.getDataByTrialIndex(curr_trial).key_press)
		if (response_index.length > 0){
			response_index = possible_responses[response_index[0][1]][2]
		}
		
		if (combo_index == response_index){
			jsPsych.data.addDataToLastTrial({
				correct_trial: 1,
			})
		
		} else if (combo_index != response_index){
			jsPsych.data.addDataToLastTrial({
				correct_trial: 0,
			})
		
		}
		
		
		console.log('here')
		
	} 
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
var subject_ID = 472

var numTrialsPerBlock = 10

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
	
	//all_dimensions = jsPsych.randomization.repeat(all_dimensions,1)
	
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



var stims = createTrialTypes(numTrialsPerBlock)

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
	text: '<div class = bigbox><div class = picture_box>'+
		  '<p class = block-text><font color="white">We will now move onto the stopping portion.</font></p>'+
		  '<p class = block-text><font color="white">You will see items come up on the screen one at a time.</font></p>'+
		  '<p class = block-text><font color="white">For every item, please press the M key, as quickly as possible with your right index finger.</font></p>'+
		  '<p class = block-text><font color="white">On some trials, a tone will also occur concurrently or shortly after the food item. When you hear this tone please try to press the Z key with your left index finger, instead of the M key.</font></p>'+
		  '<p class = block-text><font color="white">Do not slow down your responses to the food items in order to wait to for the tone.</font></p>'+
		  '<p class = block-text><font color="white">Press<strong> enter</strong> to continue.</font></p>'+
		  '</div></div>',
	cont_key: [13],
	timing_post_trial: 0
};



var instructions_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instructions",
	},
	timing_response: -1,
	text: '<div class = bigbox><div class = picture_box>'+
			'<p class = block-text><font color = "white">This experiment is composed of four phases.</font></p>'+
			'<p class = block-text><font color = "white">In this first phase, you will participate in a hypothetical auction.  Food items will be presented on the screen one at a time.</font></p>'+
			'<p class = block-text><font color = "white">Imagine you have up to $3 to spend on <strong>each food item on every trial</strong>.</font></p>'+	
			'<p class = block-text><font color = "white">For each item, please use the slider to input how much you are willing to pay for that item.  Once you have chosen your amount, press <strong>enter</strong> to move on to the next trial.</font></p>'+
			'<p class = block-text><font color = "white">This phase is self-paced, so take your time to decide the amount of money you are willing to spend on each item.</font></p>'+	
			'<p class = block-text><font color = "white">We will start with a practice trial.</font></p>'+
			'<p class = block-text><font color = "white">Press <strong>enter</strong> to continue.</font></p>'+		
		 '</div></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = bigbox><div class = centerbox><div class = fixation><font color="white">+</font></div></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		exp_id: "cued_predictive_task_switching",
		trial_id: "fixation",
	},
	timing_post_trial: 0,
	timing_stim: 500,
	timing_response: 500
};

/* ************************************ */
/*        Set up timeline blocks        */
/* ************************************ */

var practiceTrials = []
practiceTrials.push(feedback_block)
for (i = 0; i < numTrialsPerBlock; i++) {
	var cue_block = {
		type: 'poldrack-single-stim',
		stimulus: getCue,
		is_html: true,
		data: {
			exp_id: "cued_predictive_task_switching",
			"trial_id": "practice_cue_block",
		},
		choices: 'none',
		timing_stim: 500,
		timing_response: 500,
		timing_post_trial: 0,
		response_ends_trial: false,
	}
	var practice_block = {
		type: 'poldrack-single-stim',
		stimulus: getStim,
		is_html: true,
		data: {
			exp_id: "cued_predictive_task_switching",
			"trial_id": "practice_trial",
		},
		choices: [possible_responses[0][1],possible_responses[1][1],possible_responses[2][1],possible_responses[3][1]],
		timing_stim: 1000,
		timing_response: 1000,
		timing_post_trial: 0,
		response_ends_trial: false,
		on_finish: appendData,
	}
	//practiceTrials.push(fixation_block)
	practiceTrials.push(cue_block)
	practiceTrials.push(practice_block)
}

var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
		
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var cued_predictive_task_switching_experiment = []


cued_predictive_task_switching_experiment.push(welcome_block);
cued_predictive_task_switching_experiment.push(practiceNode);


cued_predictive_task_switching_experiment.push(instructions_block);

cued_predictive_task_switching_experiment.push(end_block);




