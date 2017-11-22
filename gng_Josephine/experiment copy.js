/* ************************************ */
/* Define helper functions */
/* ************************************ */

function evalPhaseTwoAccuracy() {
	var percentCorrect = 1
	var tasks = jsPsych.data.getTrialsOfType('single-audio')
	for (i=0; i<24; i++){ 
		pTasks = tasks.shift()
	}
    var checks_pass = 0
    for (var i = 0; i < tasks.length; i++) {
    	if (tasks[i].correct === true) {
        	checks_pass += 1
      	}
    }
	percentCorrect = checks_pass / tasks.length
	jsPsych.data.addDataToLastTrial ({ 
		accuracy: percentCorrect
	})
};

var get_response_time = function() {
  gap = 750 + Math.floor(Math.random() * 500) + 250
  return gap;
}
/* Append gap and current trial to data and then recalculate for next trial*/
var appendPreTaskData = function(data) {
  jsPsych.data.addDataToLastTrial({
    trial_num: current_trial,
    initial_rating: initial_rating,
    preTaskStim: preTaskStim
  })
  current_trial = current_trial + 1
};

var appendData = function(data) {
  var correct = false
  if (data.key_press == data.correct_response) {
    correct = true
  }
  jsPsych.data.addDataToLastTrial({
    trial_num: current_trial,
    correct: correct,
    stim: stim
  })
  current_trial = current_trial + 1
};

var appendPostTaskData = function(data) {
	var correct = false
	jsPsych.data.addDataToLastTrial({
   		trial_num: current_trial,
    	final_rating: final_rating,
    	postTaskStim: postTaskStim,
    	condition: condition,
    	difference: difference
  	})
  	current_trial = current_trial + 1
};

var practice_index = 0
var getFeedback = function() {
  if (practice_trials[practice_index].key_answer == -1) {
    practice_index += 1
    return '<div class = centerbox>'+
    			'<div style="color:green"; class = center-text>'+
    				'Correct!'+
    			'</div>'+
			'</div>'
  } else {
    practice_index += 1
    return '<div class = centerbox>'+
    			'<div style="color:red"; class = center-text>'+
    				'Incorrect'+
    			'</div>'+
    		'</div>'
  }
}

var getInstructFeedback = function() {
  return '<div class = welcomeBox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

//makes that button press equivalent to the a button press
var hitKey = function(whichKey){
	e = jQuery.Event("keydown");
  	e.which = whichKey; // # Some key code value
  	e.keyCode = whichKey
  	$(document).trigger(e);
 	e = jQuery.Event("keyup");
  	e.which = whichKey; 
  	e.keyCode = whichKey
  	$(document).trigger(e)
}

//functions that dictate what happens when a button is pushed
var pressSubmit = function(current_value,whichKey){
	initial_rating = current_value//save current value
	preTaskStim = stim 
	value_stim = initial_rating + '_' + stim//put the number and stim into a matrix in the format of value_stim
	storage = [initial_rating, stim]
	stimLikertArray.push(value_stim)//makes the value_stim objects
	storedStims.push(stim)//stores the stim
	pairMatrix.push(storage)
	hitKey(whichKey)//end trial should be last 
};

var storedStims2 = [];
var pressSubmit2 = function(current_value,whichKey){
	final_rating = current_value
	postTaskStim = stim
	value_stim = final_rating + '_' + stim
	storage = [stim, final_rating]
	storedStims2.push(stim)
	but = getInit()
	difference = final_rating - but
	endPairMatrix.push(storage)
	for (var i=0; i<numGoStims; i++) {
		if (stim == goStims[i]) { 
			condition = 'go' 
		}
	}
	for (var i=0; i<groupSize; i++) { 
		if (stim == noGoStims[i]) { 
			condition = 'noGo'
		}
	}
	for (var i=0; i<groupSize; i++) { 
		if (stim == controlStims[i]) { 
			condition = 'untrained'
		}
	}
	hitKey(whichKey)
};

function getInit() { 
	for (var i=0; i<numStimsToWorkWith; i++) { 
		if (stim == finalSample[i][1]) {
			initR = finalSample[i][0]
			return initR
		} 
	}
}

//functions that get the finalSample
var sortTheStims = function () {
	var pairMatrixSorted = pairMatrix.sort();
	for(var i = 0; i<numStimsToWorkWith; i++) {
		poppedArray = pairMatrixSorted.pop()
		finalSample.push(poppedArray)
	};	
};

function seperateScores () { 
	sortTheStims()
	for (i=0; i<finalSample.length; i++) { 
		if (finalSample[i][0] == 7) { 
			rate7.push(finalSample[i][1]) 
		} 
		if (finalSample[i][0] == 6) { 
			rate6.push(finalSample[i][1]) 
		} 
		if (finalSample[i][0] == 5) { 
			rate5.push(finalSample[i][1]) 
		} 
		if (finalSample[i][0] == 4) { 
			rate4.push(finalSample[i][1]) 
		} 
		if (finalSample[i][0] == 3) { 
			rate3.push(finalSample[i][1]) 
		} 
		if (finalSample[i][0] == 2) { 
			rate2.push(finalSample[i][1]) 
		} 
		if (finalSample[i][0] == 1) { 
			rate1.push(finalSample[i][1]) 
		} 
	}
	rated1 = jsPsych.randomization.shuffle(rate1)
	rated2 = jsPsych.randomization.shuffle(rate2)
	rated3 = jsPsych.randomization.shuffle(rate3)
	rated4 = jsPsych.randomization.shuffle(rate4)
	rated5 = jsPsych.randomization.shuffle(rate5)
	rated6 = jsPsych.randomization.shuffle(rate6)
	rated7 = jsPsych.randomization.shuffle(rate7)
}


function popGrouping() { 
	if (rated7.length > 0){ 
		return rated7.pop()
	} 
	else { 
		if (rated6.length > 0) { 
			return rated6.pop()
		}
		else { 
			if (rated5.length > 0) { 
				return rated5.pop()
			} 
			else { 
				if (rated4.length > 0) { 
					return rated4.pop()
				} 
				else { 
					if (rated3.length > 0) { 
						return rated3.pop()
					} 
					else {
						if (rated2.length > 0) {
							return rated2.pop()
						}
						else {
							if (rated1.length > 0) { 
								return rated1.pop()
							}
						}
					}
				}
			}
		}
	}
};


function shiftGrouping() {
	if (rated1.length > 0){ 
		return rated1.pop()
	} 
	else { 
		if (rated2.length > 0) { 
			return rated2.pop()
		}
		else { 
			if (rated3.length > 0) { 
				return rated3.pop()
			} 
			else { 
				if (rated4.length > 0) { 
					return rated4.pop()
				} 
				else { 
					if (rated5.length > 0) { 
						return rated5.pop()
					} 
					else {
						if (rated6.length > 0) {
							return rated6.pop()
						}
						else {
							if (rated7.length > 0) { 
								return rated7.pop()
							}
						}
					}
				}
			}
		}
	}
};

function sortExpGroups(group) {
	var groupSplit = groupSize/2 
	for (var i=0; i<groupSplit; i++) {
		var lowStim = shiftGrouping()
		var highStim = popGrouping()
	    group.push(lowStim)
 	  	group.push(highStim)
	}
};

var sortFunction = function() {
    for (var i=0; i<6; i++) {
   		sortExpGroups(groups[i])
	}
};

//functions that randomly assign groups to conditions
var assignConditions = function () { 
	var shuffledGroups = jsPsych.randomization.shuffle(groups); 
	var goArray = shuffledGroups.pop()
		for(var i=0; i<groupSize; i++) {
			goStims.push(goArray[i])
		}
	var goArray2 = shuffledGroups.pop()
		for(var i=0; i<groupSize; i++) {
			goStims.push(goArray2[i])
		}
	var goArray3 = shuffledGroups.pop()
		for(var i=0; i<groupSize; i++) {
			goStims.push(goArray3[i])
		}
	var goArray4 = shuffledGroups.pop()
		for(var i=0; i<groupSize; i++) {
			goStims.push(goArray4[i])
		}
	var noGoArray = shuffledGroups.pop()
	for (var i=0; i<groupSize; i++) { 
		noGoStims.push(noGoArray[i])
	}
	var controlArray = shuffledGroups.pop() 
	for (var i=0; i<groupSize; i++) {
	controlStims.push(controlArray[i])
	}
};

// functions that pull stims for the blocks

var getPreTaskSample = function(){
	stim = pTS.pop()
	return ratingBoard1 + stim + ratingBoard2
}

var pStims = []
var getPracticeBigSample = function () { 
	for (i=0; i< pairMatrix.length; i++) { 
		pStims.push(pairMatrix[i][1])
	}
	shufflePStims = jsPsych.randomization.shuffle(pStims)
}

var getGoPracticeSample = function() { 
	stim = shufflePStims.pop()
	return '<div class = bigBox>'+
				'<div class = preTextBox2>'+
					'<p class = center-block-text style="70px"><font color="white">'+
						'RESPOND'+ 
					'</font>'+
					'</p>'+
				'</div>'+
				prePracticePic+stim+postPracticePic
			'</div>'
}; 

var getNoGoPracticeSample = function() { 
	stim = shufflePStims.pop()
	return '<div class = bigBox>'+
				'<div class = preTextBox2>'+
					'<p class = center-block-text style="70px"><font color="white">'+
						'DONT RESPOND'+ 
					'</font>'+
					'</p>'+
				'</div>'+
				prePracticePic+stim+postPracticePic
			'</div>'
}; 

function getGoSamples () { 
    for (var i=0;i<4;i++) {
        grab=jsPsych.randomization.shuffle(goStims)
        goSamples.push(grab)
    }
};	

var noGoSamples = [];
function getNoGoSamples () { 
    for (var i=0;i<4;i++) {
        grab=jsPsych.randomization.shuffle(noGoStims)
        noGoSamples.push(grab)
    }
};

//functions that call the stims for the tasks
function getTaskGoStims () {
	stim = goSamples[0].pop()
	return preTrialPic+stim+postTrialPic
}; 

function getTaskNoGoStims () { 
	stim=noGoSamples[0].pop() 
	return preTrialPic+stim+postTrialPic
}; 

function getTaskGoStims2 () { 
	stim = goSamples[1].pop()
	return preTrialPic+stim+postTrialPic
}; 

function getTaskNoGoStims2 () {  
	stim=noGoSamples[1].pop() 
	return preTrialPic+stim+postTrialPic
}; 

function getTaskGoStims3 () { 
	stim = goSamples[2].pop()
	return preTrialPic+stim+postTrialPic
}; 

function getTaskNoGoStims3 () {  
	stim=noGoSamples[2].pop() 
	return preTrialPic+stim+postTrialPic
}; 

function getTaskGoStims4 () { 
	stim = goSamples[3].pop()
	return preTrialPic+stim+postTrialPic
}; 

function getTaskNoGoStims4 () {  
	stim=noGoSamples[3].pop() 
	return preTrialPic+stim+postTrialPic
}; 

function getStimSample () { 
	for (var i=0; i< numGoStims; i++) { 
		stimSample.push(goStims[i])
	}
	for (var i=0; i< groupSize; i++) { 
		stimSample.push(noGoStims[i])
	}
	for (var i=0; i< groupSize; i++) { 
		stimSample.push(controlStims[i])
	}
	shuffledStimSample = jsPsych.randomization.shuffle(stimSample)
}; 

var getPostTaskSample = function() {
	stim = shuffledStimSample.pop()
	return ratingBoard1 + stim + endRatingBoard
};

/* **************************************************************************************/
/* Define experimental variables *******************************************************/
/* ************************************************************************************/
//Initial 120 images to draw from
/*var totalNumStims = 16;//total number of stims that we begin with at the beginning of the experiment. 
var numStimsToWorkWith = 12;//
var unusedStims = 4;
var numGoStims = 8;
var groupSize = 2;
*/
var totalNumStims = 119;//total number of stims that we begin with at the beginning of the experiment. 
var numStimsToWorkWith = 72;//
var unusedStims = 48;
var numGoStims = 48;
var groupSize = 12;
var stim = ""
var endStim = ""
var bigSample = [
	'hundredgrand_small.bmp',
	'Musketeers.bmp',
	'AnimalCrackers.bmp',
	'AppleJacks.bmp', 
	'ApplePie.bmp',
	'almondjoy.bmp',
	'BabyRuth.bmp',
	'banana.bmp',
	'bbqgoldfish.bmp',
	'blueberryyogart.bmp',
	'brocollincauliflower.bmp',
	'butterfinger.bmp',
	'carrots.bmp',
	'Cheese_PeanutButterCrackers.bmp',
	'CheesyDoritos.bmp',
	'cellery.bmp','Cheetos.bmp','cheezits.bmp','cherryicecream.bmp','CherryPie.bmp',
	'ChipsAhoy_small.bmp','chocolate_mm.bmp','ChocolateDonuts.bmp','chocpudding.bmp',
	'CornPops.bmp','cookiencream.bmp','cranberries.bmp','Crunch.bmp','Cupcakes.bmp',
	'donettesbrown.bmp','Doritosranch.bmp','Dots_one.bmp','FamousAmos_small.bmp',
	'ffraspsorbet.bmp','FigNewton_small.bmp','FlamingCheetos.bmp','Fritos.bmp',
	'FrootLoops.bmp','frostedcheerios.bmp','FrostedFlakes.bmp','Funyuns_small.bmp',
	'Ghiradelli_milk.bmp','Ghiradelli_milk_Almonds.bmp','Goldfish.bmp','grannysmith.bmp',
	'granolabar.bmp','grapenerds.bmp','haagendaas.bmp','hersheykisses.bmp',
	'hersheymilk_several.bmp','HoHo.bmp','icecreamsandwich.bmp','jollyrancherblue.bmp',
	'jollyranchergreen.bmp','jollyrancheryellow.bmp','KitKat_small.bmp',
	'keeblerfudgestripes.bmp','keeblerrainbow.bmp','laffytaffyred_one.bmp','laysclassic.bmp',
	'Lindt_small.bmp','lollipopred.bmp','luckycharms.bmp','milano.bmp','milkduds.bmp',
	'MilkyWay.bmp','mixedyogart.bmp','MrGoodbar.bmp','MrsFields.bmp','nutterbutter.bmp',
	'orange.bmp','Oreos.bmp','PayDay.bmp','PeanutMMs.bmp','pizza.bmp','PopTartsCinnamon.bmp',
	'PopTartsStrawberry.bmp','PowderedDonuts_small.bmp','Pringles.bmp','pringlescheezums.bmp',
	'PringlesRed.bmp','reddelicious.bmp','redgrapes.bmp','redvines_small.bmp','Reeses.bmp',
	'RiceKrispyTreat_small.bmp','riprolls.bmp','RitzBitz2.bmp','Ruffles.bmp','sbcrackers.bmp',
	'sbdietbar.bmp','Skittles.bmp','slimfastC.bmp','slimfastV.bmp','slimjim.bmp','snickers.bmp',
	'SnoBall.bmp','Sourpatch.bmp','SourSkittles.bmp','specialKbar.bmp','starburst.bmp',
	'strawberries.bmp','TeddyGrahamschocolate.bmp','TeddyGrahamsCinnamon.bmp',
	'TeddyGrahamsplain_small.bmp','toast_peanutbutter.bmp','Toberlorone.bmp','TootsieRolls.bmp',
	'trix.bmp','Twix.bmp','vanillapudding.bmp','Whatchamacallit.bmp','wheatcrisps.bmp',
	'WheatThins.bmp','whitegrapes.bmp','wildberrynerds.bmp','wwbrownie.bmp','wwmuffin.bmp',
	'zingers.bmp',
]; 
var pTS = jsPsych.randomization.shuffle(bigSample)
var pathSourceImgs = '/static/experiments/gng_food/images/';
var pathSourceMp3 = '/static/experiments/gng_food/audio/';
var preFileType = "<img class='img.displayed' src='";
var postFileType = "'></img>";
var prePracticePic = '<div class = pictureBox>'+preFileType+pathSourceImgs;
var postPracticePic = postFileType+'</div>';
var preTrialPic = '<div class = bigBox><div class = pictureBox>'+preFileType+pathSourceImgs;
var postTrialPic = postFileType+'</div></div>';

var stimSample = []; 
var ratingBoard1 ='<div class = bigBox>'+
						"<div class = pictureBox>"+preFileType+pathSourceImgs
						
var ratingBoard2 = postFileType+'</div>'+
'<div class = sliderbox>' +
		'<div class = buttonBox>'+
			'<div class = Button1><input type="button" id = "button1" value="1" onClick = "pressSubmit(1, 81)"></div>'+
			'<div class = Button2><input type="button" id = "button2" value="2" onClick = "pressSubmit(2, 81)"></div>'+
			'<div class = Button3><input type="button" id = "button3" value="3" onClick = "pressSubmit(3, 81)"></div>'+
			'<div class = Button4><input type="button" id = "button4" value="4" onClick = "pressSubmit(4, 81)"></div>'+
			'<div class = Button5><input type="button" id = "button5" value="5" onClick = "pressSubmit(5, 81)"></div>'+
			'<div class = Button6><input type="button" id = "button6" value="6" onClick = "pressSubmit(6, 81)"></div>'+
			'<div class = Button7><input type="button" id = "button7" value="7" onClick = "pressSubmit(7, 81)"></div>'+
		'</div>' +
	'</div>'+
'</div>'

var endRatingBoard = postFileType+'</div>'+
'<div class = sliderbox>' +
		'<div class = buttonBox>'+
			'<div class = Button1><input type="button" id = "button1" value="1" onClick = "pressSubmit2(1, 81)"></div>'+
			'<div class = Button2><input type="button" id = "button2" value="2" onClick = "pressSubmit2(2, 81)"></div>'+
			'<div class = Button3><input type="button" id = "button3" value="3" onClick = "pressSubmit2(3, 81)"></div>'+
			'<div class = Button4><input type="button" id = "button4" value="4" onClick = "pressSubmit2(4, 81)"></div>'+
			'<div class = Button5><input type="button" id = "button5" value="5" onClick = "pressSubmit2(5, 81)"></div>'+
			'<div class = Button6><input type="button" id = "button6" value="6" onClick = "pressSubmit2(6, 81)"></div>'+
			'<div class = Button7><input type="button" id = "button7" value="7" onClick = "pressSubmit2(7, 81)"></div>'+
		'</div>' +
	'</div>'+
'</div>'

//empty arrays used to sort the groups
var preTaskSample = [];
var but = ""; 
var difference = ""; 
var condition = "";
var samplePics = [];
var endSamplePics = [];
var stimLikertArray = []; //add 1 for label
var storedStims = [];
var pairMatrix = [];
var endStim = [];
var group1 = [];
var group2 = [];
var group3 = [];
var group4 = [];
var group5 = [];
var group6 = [];
var groups = [group1, group2, group3, group4, group5, group6];
var finalSample = [];
var goStims = [];
var noGoStims = [];
var controlStims = [];
var endPairMatrix = [];
var taskGoStims = [];
var goSamples = []; 
var taskNoGoStims = [];
var rated7 = [];
var rated6 = [];
var rated5 = [];
var rated4 = [];
var rated3 = [];
var rated2 = [];
var rated1 = [];
var rate7 = [];
var rate6 = [];
var rate5 = [];
var rate4 = [];
var rate3 = [];
var rate2 = [];
var rate1 = [];

// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.45
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true

// task specific variables
var num_go_stim = 4 //per one no-go stim
var correct_responses = [
  ['go', 32],
  ['nogo', -1]
]

var tones = [['highTone.mp3', 'high-pitched tone'], ['lowTone.mp3', 'low-pitched tone']];
var stimTones = jsPsych.randomization.shuffle(tones)
var gap = 0
var current_trial = 0
for (var i=0; i<4; i++) {
var practice_stimuli = [{
  stimulus: pathSourceMp3 + stimTones[0][0],
  data: {
    correct_response: correct_responses[0][1],
    //condition: correct_responses[0][0],
    trial_id: 'practice'
  },
  prompt: getGoPracticeSample,
  key_answer: correct_responses[0][1],
  ms_delay: 300
}, {
  stimulus: pathSourceMp3 + stimTones[1][0],
  data: {
    correct_response: correct_responses[1][1],
    //condition: correct_responses[1][0],
    trial_id: 'practice'
  },
  prompt: getNoGoPracticeSample,
  key_answer: correct_responses[1][1],
  ms_delay: 300
}];
}

//set up block stim. test_stim_responses indexed by [block][stim][type]
var test_stimuli_block = [{
  stimulus: pathSourceMp3 + stimTones[1][0],
  data: {
    correct_response: correct_responses[1][1],
    //condition: correct_responses[1][0],
    trial_id: 'test_block_nogo'
  },
  prompt: getTaskNoGoStims
}];

for (var i = 0; i < num_go_stim; i++) {
  test_stimuli_block.push({
    stimulus: pathSourceMp3 + stimTones[0][0],
    data: {
      correct_response: correct_responses[0][1],
      //condition: correct_responses[0][0],
      trial_id: 'test_block_go'
    }, 
    prompt: getTaskGoStims
  })
}

var test_stimuli_block2 = [{
  stimulus: pathSourceMp3 + stimTones[1][0],
  data: {
    correct_response: correct_responses[1][1],
    //condition: correct_responses[1][0],
    trial_id: 'test_block_nogo'
  },
  prompt: getTaskNoGoStims2
}];

for (var i = 0; i < num_go_stim; i++) {
  test_stimuli_block2.push({
    stimulus: pathSourceMp3 + stimTones[0][0],
    data: {
      correct_response: correct_responses[0][1],
      //condition: correct_responses[0][0],
      trial_id: 'test_block_go'
    }, 
    prompt: getTaskGoStims2
  })
}

var test_stimuli_block3 = [{
  stimulus: pathSourceMp3 + stimTones[1][0],
  data: {
    correct_response: correct_responses[1][1],
    //condition: correct_responses[1][0],
    trial_id: 'test_block_nogo'
  },
  prompt: getTaskNoGoStims3
}];

for (var i = 0; i < num_go_stim; i++) {
  test_stimuli_block3.push({
    stimulus: pathSourceMp3 + stimTones[0][0],
    data: {
      correct_response: correct_responses[0][1],
     // condition: correct_responses[0][0],
      trial_id: 'test_block_go'
    }, 
    prompt: getTaskGoStims3
  })
}

var test_stimuli_block4 = [{
  stimulus: pathSourceMp3 + stimTones[1][0],
  data: {
    correct_response: correct_responses[1][1],
   // condition: correct_responses[1][0],
    trial_id: 'test_block_nogo'
  },
  prompt: getTaskNoGoStims4
}];

for (var i = 0; i < num_go_stim; i++) {
  test_stimuli_block4.push({
    stimulus: pathSourceMp3 + stimTones[0][0],
    data: {
      correct_response: correct_responses[0][1],
      //condition: correct_responses[0][0],
      trial_id: 'test_block_go'
    }, 
    prompt: getTaskGoStims4
  })
}

var practice_trials = jsPsych.randomization.repeat(practice_stimuli, 12); //(array, repetitions,unpack)
var test_trials = jsPsych.randomization.repeat(test_stimuli_block, 12); 
var test_trials2 = jsPsych.randomization.repeat(test_stimuli_block2, 12);   
var test_trials3 = jsPsych.randomization.repeat(test_stimuli_block3, 12);   
var test_trials4 = jsPsych.randomization.repeat(test_stimuli_block4, 12);
/*  
var practice_trials = jsPsych.randomization.repeat(practice_stimuli, 2); //(array, repetitions,unpack)
var test_trials = jsPsych.randomization.repeat(test_stimuli_block, 2); 
var test_trials2 = jsPsych.randomization.repeat(test_stimuli_block2, 2);   
var test_trials3 = jsPsych.randomization.repeat(test_stimuli_block3, 2);   
var test_trials4 = jsPsych.randomization.repeat(test_stimuli_block4, 2);    
/* ***************************************************************************************/
/* Set up jsPsych blocks ****************************************************************/
/* *********************************************************************************** */

// Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  data: {
    trial_id: "attention_check"
  },
  timing_response: 180000,
  response_ends_trial: true,
  timing_post_trial: -1
}

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
}

/* define static blocks */
//WELCOMES THE PARTICIPANT TO THE EXPERIMENT
var feedback_instruct_text =
	'<div class = bigBox>'+
  			'<div class = welcomeBox>'+
  				'<p class = center-block-text>'+
  					'<font color = "white">'+
  						'Welcome to the experiment. This experiment had 3 phases and will '+
  						'take about 40 minutes.'+
  						' Press <strong>enter</strong> to begin.'+
  					'</font>'+
  				'</p>'+
    		'</div>'+
    	'</div>';
var feedback_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  data: {
    trial_id: "instruction"
  },
  text: feedback_instruct_text,
  timing_post_trial: -1,
  timing_response: 180000
};

/// GIVES INSTRUCTIONS FOR THE RATING TASK
var rating_instruction_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = bigBox>'+
    		'<p class = ratingPadding>'+
    			'<font color = "white">'+
    				'We will now begin phase 1 of the experiment. In this phase you will '+
    				'be rating foods based on how tasty you find them. You will rate each '+
    				'food on a scale of 1-7 by clicking your desired rating on the screen.'+
    			'</font></p>'+
    		'<p class = padding2>'+
    			'<font color = "white">'+
    				'1 is for food that is disgusting. '+
    				'7 is for food that is delicious. A rating of 4 should be used for foods '+ 
    				'that you neither like nor dislike.'+
    			'</font></p>'+
   		'</div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: -1
};

//THIS BLOCK CREATES A TIMELINE OF THE INSTRUCTIONS AND MAKES SURE THAT THE PARTICIPANTS DONT MOVE THROUGH INSTRUCTIONS TOO QUICKLY
var instruction_node = {
  timeline: [feedback_instruct_block, rating_instruction_block],
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
      	'<div class = bigBox>'+
      		'<div class = instructionBox>'+
      			'<p class = center-block-text>'+
      				'<font color = "white">'+
        				'Read through instructions too quickly.'+
        				' Please take your time and make sure you understand the instructions.'+
        				' Press <strong>enter</strong> to continue.'+
        			'</font>'+
        		'</p>'+
        	'</div>'+
        '</div>'
      return true
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        '<div class = bigBox>'+
        	'<div class = instructionBox>'+
        		'<p class = center-block-text>'+
        			'<font color = "white">'+
        				'Done with instructions. Press <strong>enter</strong> to continue.'+
        		'</font></p>'+
        	'</div>'+
        '</div>'
      return false
    }
  }
};


//INITIAL RATING TASK
for(var i = 0; i <bigSample.length; i++){
	var pre_task_evaluation = {
		type: 'poldrack-single-stim', 
		stimulus: getPreTaskSample, 
		choices: [81],//49,50,51,52,53,54,55
		is_html: true,
		timing_post_trial: -1,
		timing_stim: -1,
		response_ends_trial: true,
		prompt:'<div class = "preTextBox">'+
					'<p class = center-block-text style="20px"><font color="white">'+
						' 1: Disgusting   2: Tastes Bad   3: Not Tasty'+
					'</font></p>'+
					'<p class = center-block-text style="20px"><font color="white">'+
						' 4: Neutral   5: Fairly Tasty   6: Tasty   7: Delicious'+
					'</font></p>'+
				'</div>',
		on_finish: appendPreTaskData
	}
	samplePics.push(pre_task_evaluation) //creates an array that contains all of the trials in this task
}

//Sets up the timeline and loops it
var pre_task_evaluation_node = {
	timeline: samplePics,
	data: { 
		trial_id: "pre_task"
	},
	loop_function: function(data){
	}
};

//SORTING THE STIMS FROM PRE TASK EVALUATION
var sort_stims_block = { 
	type: 'call-function',
	func: seperateScores
};

var sort_stims_block2 = { 
	type: 'call-function',
	func: sortFunction
};

var assign_condition_function = { 
	type: 'call-function', 
	func: assignConditions
};

var get_practice_big = { 
	type: 'call-function',
	func: getPracticeBigSample
}

var get_go_samples = { 
	type: 'call-function', 
	func: getGoSamples
}

var get_no_go_samples = { 
	type: 'call-function', 
	func: getNoGoSamples
};

var get_stim_sample = { 
	type: 'call-function', 
	func: getStimSample
};

//INSTRUCTIONS FOR THE TASK BLOCK
var task_instruction_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
  	 '<div class = bigBox>'+
  	  		'<p class = padding>'+
				'<font color = "white">'+
    				'We will now begin phase 2 of the experiment. '+
    				'In this phase there will be pictures of food presented on the screen '+
    				'accompanied by one of two tones. One of the tones will indicate that '+ 
    				'you should respond by pressing the space bar as quickly as you can. '+
    				'The other tone will indicate that you should not respond and let the '+
    				'picture time out. You should keep your eyes focused on the screen '+
    				'throughout the entirety of this task'+
    			'</font>'+
    		'</p>'+
    		'<p class = padding2>'+
    			'<font color = "white">'+
    				'We will begin with practice. In practice you will learn the tone that '+
    				'you should respond to and the one you should not respond to. During '+
    				'practice, there will be an instruction at the top of the screen accompanying '+
    				'each tone that will tell you whether or not to respond.'+
    			'</font>'+
    		'</p>'+	
   	'</div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: -1
};

/* define practice block */
var practice_block = {
  type: 'single-audio',
  timeline: practice_trials,
  is_html: true,
  data: {
    trial_id: "stim",
    exp_stage: "practice"
  },
  timeout_message: getFeedback,
  choices: [32],
  timing_response: get_response_time,
  response_ends_trial: false,
  timing_stim: 1000,
  timing_feedback_duration: 1000,
  show_stim_with_feedback: false,
  timing_post_trial: -1,
  on_finish: appendData
}

//THE INSTRUCTIONS THAT LET THE PARTICIPANTS KNOW THAT PRACTICE IS OVER
var start_test_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "test_intro"
  },
  text: '<div class = bigBox>'+
  				'<p class = ratingPadding>'+
  					'<font color = "white">'+
  						'Practice is over, we will now begin the experiment.'+
  					'</font>'+
  				'</p>'+
  				'<p class = padding2>'+
  					'<font color = "white">'+
  						' You will no longer get feedback about your responses. '+
  						'Remember, when you hear the '+ stimTones[0][1] + ' you should respond and '+
  						'when you hear the '+stimTones[1][1] +' you should not respond.'+
  						'Press <strong>enter</strong> to begin.'+
  					'</font>'+
  				'</p>'+ 
  		'</div>', 
  cont_key: [13],
  timing_post_trial: -1
};

/* define test block */
var test_block = {
  type: 'single-audio',
  timeline: test_trials,
  data: {
    trial_id: "stim",
    exp_stage: "test_block_1"
  },
  is_html: true,
  choices: [32],
  timing_stim: 1000,
  ms_delay: 100,
  response_ends_trial: false,
  timing_response: get_response_time,
  timing_post_trial: -1,
  on_finish: appendData
};

var test_block2 = {
  type: 'single-audio',
  timeline: test_trials2,
  data: {
    trial_id: "stim",
    exp_stage: "test_block_2"
  },
  is_html: true,
  choices: [32],
  timing_stim: 1000,
  ms_delay: 100,
  response_ends_trial: false,
  timing_response: get_response_time,
  timing_post_trial: -1,
  on_finish: appendData
};

var test_block3 = {
  type: 'single-audio',
  timeline: test_trials3,
  data: {
    trial_id: "stim",
    exp_stage: "test_block_3"
  },
  is_html: true,
  choices: [32],
  timing_stim: 1000,
  ms_delay: 100,
  response_ends_trial: false,
  timing_response: get_response_time,
  timing_post_trial: -1,
  on_finish: appendData
};

var test_block4 = {
  type: 'single-audio',
  timeline: test_trials4,
  data: {
    trial_id: "stim",
    exp_stage: "test_block_4"
  },
  is_html: true,
  choices: [32],
  timing_stim: 1000,
  ms_delay: 100,
  response_ends_trial: false,
  timing_response: get_response_time,
  timing_post_trial: -1,
  on_finish: appendData
};

var reset_block = {
  type: 'call-function',
  data: {
    trial_id: "reset_trial"
  },
  func: function() {
    current_trial = 0
  },
  timing_post_trial: -1
}

//block that ends the experiment
var end_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "end",
    exp_id: 'go_nogo'
  },
  text: '<div class = bigBox>'+
  			'<div class = welcomeBox>'+
  				'<p class = center-block-text><font color = "white">'+
  					'Thanks for completing this task!'+
  				'</font></p>'+
  				'<p class = center-block-text><font color = "white">'+
  					'Press <strong>enter</strong> to continue.'+
  				'</font></p>'+
  			'</div>'+
  		'</div>',
  cont_key: [13],
  timing_post_trial: -1,
};

//check participants accuracy on the task

var evaluate_accuracy = { 
	type: 'call-function', 
	data: { 
		trial_id: 'accuracy'
	},
	func: evalPhaseTwoAccuracy 
}

//INSTRUCTIONS FOR POST TASK EVALUATION
var end_rating_instruction_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = bigBox>'+
    		'<p class = ratingPadding>'+
    			'<font color = "white">'+
    				'We will now begin phase 3. This phase will be the same as phase 1. '+
    				'You will rate the pictures that you see on a scale of 1 to 7 based on '+
    				'how tasty you find them.'+
    				'There will be a reminder of how to use the scale at the top of the screen '+
    			'</font>'+
    		'</p>'+
   		'</div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: -1
};

//POST TASK EVALUATION

var endRating = [];
for(var i = 0; i <numStimsToWorkWith; i++){
	var post_task_evaluation = {
		type: 'poldrack-single-stim', 
		stimulus: getPostTaskSample, 
		choices: [81],
		is_html: true,
		timing_post_trial: -1,
		timing_stim: -1,
		response_ends_trial: true,
		prompt:'<div class = "preTextBox">'+
					'<p class = center-block-text style="20px"><font color="white">'+
						' 1: Disgusting   2: Tastes Bad   3: Not Tasty'+
					'</font></p>'+
					'<p class = center-block-text style="20px"><font color="white">'+
						' 4: Neutral   5: Fairly Tasty   6: Tasty   7: Delicious'+
					'</font></p>'+
				'</div>',
		on_finish: appendPostTaskData
	}
	endRating.push(post_task_evaluation)
};

var post_task_evaluation_node = {
	timeline: endRating,
	data: { 
		trial_id: "post_task"
	},
	loop_function: function(data){
	}
};

/* create experiment definition array */
var gng_food_experiment = [];
gng_food_experiment.push(instruction_node);
gng_food_experiment.push(pre_task_evaluation_node);
gng_food_experiment.push(sort_stims_block);
gng_food_experiment.push(sort_stims_block2);
gng_food_experiment.push(assign_condition_function); 
gng_food_experiment.push(get_practice_big);
gng_food_experiment.push(get_go_samples);
gng_food_experiment.push(get_no_go_samples);
gng_food_experiment.push(get_stim_sample);
gng_food_experiment.push(task_instruction_block);
gng_food_experiment.push(practice_block);
gng_food_experiment.push(attention_node)
gng_food_experiment.push(reset_block)
gng_food_experiment.push(start_test_block);
gng_food_experiment.push(test_block);
gng_food_experiment.push(attention_node)
gng_food_experiment.push(reset_block)
gng_food_experiment.push(test_block2);
gng_food_experiment.push(attention_node)
gng_food_experiment.push(reset_block)
gng_food_experiment.push(test_block3);
gng_food_experiment.push(attention_node)
gng_food_experiment.push(reset_block)
gng_food_experiment.push(test_block4);
gng_food_experiment.push(attention_node)
gng_food_experiment.push(reset_block)
gng_food_experiment.push(evaluate_accuracy)
gng_food_experiment.push(end_rating_instruction_block)
gng_food_experiment.push(post_task_evaluation_node)
gng_food_experiment.push(end_block);