/**
 * jspsych-single-audio
 *
 * Jamie Li (adapted from jspsych for poldracklab)
 * Josh de Leeuw (jspsych)
 *
 * plugin for playing a visual stim, playing an auditory stim (can be at delay), and getting a response relative to visual stim.
 *
 * New parameters:
 * - SS_trial_type - has to  == 'stop' for audio to play
 * - SS_delay - if set to >0, audio will play at a delay.  Use ms
 * - SS_path - path to audio file
 * - stimulus - in original version, this parameter led to the audio file, it now accepts html for the visual stimulus.
 * - timing_stim - amount of time in ms to show visual stim for.
 *
 * documentation of original plugin / plugin template: docs.jspsych.org
 **/

jsPsych.plugins["poldrack-single-audio"] = (function() {

  var plugin = {};

  var context = new AudioContext();

  jsPsych.pluginAPI.registerPreload('poldrack-single-audio', 'SS_path', 'audio');

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.choices = trial.choices || [];
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    // timing parameters
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    trial.timing_stim = trial.timing_stim || -1; //if -1, then wait for response forever
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
    
    // stop signal parameters
    trial.SS_delay = trial.SS_delay || 0;
    trial.SS_path = trial.SS_path || ""
    trial.SS_trial_type = trial.SS_trial_type

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];


	// play stimulus
    var source = context.createBufferSource();
    source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.SS_path);
    source.connect(context.destination);
    startTime = context.currentTime; //context.currentTime + 0.1
	startTime += trial.SS_delay/1000
	
	if ( trial.SS_trial_type == "stop"){
	
		source.start(startTime);
	
	}
    
    
     // display stimulus
    if (!trial.is_html) {
      display_element.append($('<img>', {
        src: trial.stimulus,
        id: 'jspsych-poldrack-single-audio-stimulus'
      }));
    } else {
      display_element.append($('<div>', {
        html: trial.stimulus,
        id: 'jspsych-poldrack-single-audio-stimulus'
      }));
    }

    // show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }

    // store response
    var response = {
      rt: -1,
      key: -1
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }

      // stop the audio file if it is playing
      if (trial.SS_trial_type == "stop"){
      source.stop();
		}
		
      // kill keyboard listeners
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

     //calculate stim and block duration
		var stim_duration = trial.timing_stim
		var block_duration = trial.timing_response
		if (trial.response_ends_trial & response.rt != -1) {
			block_duration = response.rt
		}
		if (stim_duration != -1) {
			stim_duration = Math.min(block_duration,trial.timing_stim)
		} else {
			stim_duration = block_duration
		}

		// gather the data to store for the trial
		var trial_data = {
			"stimulus": trial.stimulus,
			"rt": response.rt,
			"key_press": response.key,
			"SS_delay": trial.SS_delay,
			"SS_stim" : trial.SS_path,
			"SS_trial_type": trial.SS_trial_type,
			"possible_responses": trial.choices,
			"stim_duration": stim_duration,
			"block_duration": block_duration,
			"timing_post_trial": trial.timing_post_trial
		};


      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {
    
	  // allows styling to be added when subject responds
	  $("#jspsych-poldrack-single-audio-stimulus").addClass('responded');

      // only record the first response
      if (response.key == -1) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (JSON.stringify(trial.choices) != JSON.stringify(["none"])) {
		var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
		  callback_function: after_response,
		  valid_responses: trial.choices,
		  rt_method: 'date',
		  persist: false,
		  allow_held_key: false,
		  audio_context: context,
		  audio_context_start_time: startTime
		});
	}
    
    // hide image if timing is set
    if (trial.timing_stim > 0) {
      var t1 = setTimeout(function() {
        $('#jspsych-poldrack-single-audio-stimulus').css('visibility', 'hidden');
      }, trial.timing_stim);
      setTimeoutHandlers.push(t1);
    }
    
    // end trial if time limit is set
    if (trial.timing_response > 0) {
      var t2 = setTimeout(function() {
        end_trial();
      }, trial.timing_response);
      setTimeoutHandlers.push(t2);
    }

  };

  return plugin;
})();
