$(function(){
	var socket = io.connect();
	var $messageForm = $('#messageForm');
	var $usernamewarning = $('#labelEnterUserName');
	var $message = $('#message');
	var $chat = $('#chat');
	var $userForm = $('#userForm');
	var $userFormArea = $('#userFormArea');
	var $messageArea = $('#messageArea');
	var $mainArea = $('#mainArea');
	var $users = $('#users');
	var $userlist = $('#UserListDiv');
	var $username = $('#username');
	var $piano = $('.piano');
	var $pianodiv = $('#pianodiv');
	var $pianotoggle = $('#pianotogglebutton');
	var $pedaldiv = $('#pedaldiv');
	var $SustainText = $('#sustaintext');
	var $harmonydiv = $('#harmonydiv');
	var $harmonytext = $('#harmonytext');
	var $TitleDiv = $('#TitleDiv');
	var $bpmspeed = $('#bpmspeed');

	var IsSustainOn = false;
	var IsHarmonyOn = false;
	var myUserName;
	var chordBPM = 110;
	var chordType = false;
	var whoIsPlayingChord;

	$messageForm.submit(function(e){
		e.preventDefault();
		socket.emit('send message', $message.val());
		$message.val('');
	});

	$message.on('keydown', function(event){
		var pressedkey = event.which;
		if (pressedkey == 13) {
			event.preventDefault();
			$messageForm.submit();
		}
	});

	socket.on('new message', function(data){
		if (data.user == myUserName) {
			$chat.append('<div class="well myMessage"><strong>'+data.user+'</strong>: '+data.msg+'</div>');
		} else {
			$chat.append('<div class="well"><strong>'+data.user+'</strong>: '+data.msg+'</div>');
		}
		$chat.scrollTop($chat[0].scrollHeight);
	});

	$userForm.submit(function(e){
		e.preventDefault();
		var username = $username.val();
		if (username === "") {
			$usernamewarning.html('User name cannot be blank. Please try again with a different user name.');
			$usernamewarning.addClass('red');
		} else {
			socket.emit('new user', username, function(data){
				if (data){
					$userFormArea.hide();
					$mainArea.show();
				}
			});
			$username.val('');
			myUserName = username;
			$TitleDiv.addClass('EnteredMain');
		}
	});

	socket.on('get users', function(data){
		var html = '';
		for (i = 0; i< data.length; i++){
			html += '<li class = "list-group-item">'+data[i]+'<img src="images/speaker.png" class="speakericon"></li>';
		}
		$users.html(html);
		$userlist.scrollTop($userlist[0].scrollHeight);
	});

	function findChord(key) {
		var indexstr = key.split('-')[0];
		var index = parseInt(indexstr);
		var firstharmony = index + 4;
		var secondharmony = index + 7;

		if (index < 32) {
			var secondspan = $('[data-note^="'+secondharmony+'"]');
			secondharmony = secondspan.attr('data-note');
		}

		if (index < 35) {
			var firstspan = $('[data-note^="'+firstharmony+'"]');
			firstharmony = firstspan.attr('data-note');
		}

		var chordarr = [firstharmony, secondharmony];
		console.log(chordarr);
		return chordarr;
	}

	function clearAllIntervals() {
		for(i=1; i<= 1000; i++) {
			window.clearInterval(i);
		}
	}

	function playnote(note, username, sustain, harmony, chord, bpm) {

		var key = note;
		if (typeof key != 'string') {
			key = note.key;
		}

		var chordarr = findChord(key);

		var noteaudio = document.createElement('audio');
		var harmonyaudio1 = document.createElement('audio');
		var harmonyaudio2 = document.createElement('audio');
		noteaudio.src = 'sounds/' + key + '.mp3';
		harmonyaudio1.src = 'sounds/' + chordarr[0] + '.mp3';
		harmonyaudio2.src = 'sounds/' + chordarr[1] + '.mp3';
		
		var userspeaker = $('li:contains("'+username+'") > img');
		userspeaker.css('display', 'inline-block');
		userspeaker.show();

		if (chord) {
			whoIsPlayingChord = username;

			clearAllIntervals();

			var bpmtime = 60 / bpm * 1000;

			if (chord == "Triads") {
				noteaudio.play();
				harmonyaudio1.play();
				harmonyaudio2.play();
				setInterval(function() {
					noteaudio.currentTime = 0;
					harmonyaudio1.currentTime = 0;
					harmonyaudio2.currentTime = 0;
					noteaudio.play();
					harmonyaudio1.play();
					harmonyaudio2.play();
				}, bpmtime * 4);

			} else if (chord == "Arpegio") {
				noteaudio.play();

				setInterval(function(){
					noteaudio.currentTime = 0;
					noteaudio.play();
				}, bpmtime * 4);

				setTimeout(function(){
					harmonyaudio1.currentTime = 0;
					harmonyaudio1.play();
					Interval3 = setInterval(function(){
						harmonyaudio1.currentTime = 0;
						harmonyaudio1.play();
					}, bpmtime * 2);
				}, bpmtime);

				setTimeout(function(){
					harmonyaudio2.currentTime = 0;
					harmonyaudio2.play();
					setInterval(function(){
						harmonyaudio2.currentTime = 0;
						harmonyaudio2.play();
					}, bpmtime * 4);
				}, bpmtime * 2);

			} else if (chord == "Waltz") {
				noteaudio.play();

				setInterval(function(){
					noteaudio.currentTime = 0;
					noteaudio.play();
				}, bpmtime * 3);

				setTimeout(function(){
					harmonyaudio1.currentTime = 0;
					harmonyaudio2.currentTime = 0;
					harmonyaudio1.play();
					harmonyaudio2.play();
					setInterval(function(){
						harmonyaudio1.currentTime = 0;
						harmonyaudio2.currentTime = 0;
						harmonyaudio1.play();
						harmonyaudio2.play();
					}, bpmtime * 3);
				}, bpmtime);

				setTimeout(function(){
					harmonyaudio1.currentTime = 0;
					harmonyaudio2.currentTime = 0;
					harmonyaudio1.play();
					harmonyaudio2.play();
					noteaudio.currentTime = 0;
					noteaudio.play();
					setInterval(function(){
						harmonyaudio1.currentTime = 0;
						harmonyaudio2.currentTime = 0;
						harmonyaudio1.play();
						harmonyaudio2.play();
						noteaudio.currentTime = 0;
						noteaudio.play();
					}, bpmtime * 3);
				}, bpmtime * 2);
			}
		} else {

			if (harmony) {
				harmonyaudio1.play();
				harmonyaudio2.play();
			}

			noteaudio.play();
			if (!sustain) {
				$(noteaudio).animate({volume: 0}, 1300);
				if (harmony) {
					$(harmonyaudio1).animate({volume: 0}, 1300);
					$(harmonyaudio2).animate({volume: 0}, 1300);
				}
			}
		}
	}

	socket.on('Turn off speaker', function(username) {	
		if (whoIsPlayingChord != username) {
			var userspeaker = $('li:contains("'+username+'") > img'); ////////////////////////////////////////// not working on the other server
			userspeaker.hide();
		}
	});

	$piano.on('mousedown', 'span', function(event){
		var me = $(this);
		var datanote = me.attr('data-note');
		socket.emit('playpianonote', {key: datanote, sustain: IsSustainOn, harmony: IsHarmonyOn, chord: chordType, chordbpm: chordBPM});
		playnote(datanote, myUserName, IsSustainOn, IsHarmonyOn, chordType, chordBPM);
	});

	$pedaldiv.on('click', function(event) {
		if ($pedaldiv.hasClass('active')) {
			$pedaldiv.removeClass('active');
			$SustainText.html('Sustain Off (Space)');
			IsSustainOn = false;
		} else {
			$pedaldiv.addClass('active');
			$SustainText.html('Sustain On (Space)');
			IsSustainOn = true;
		}
	});

	$harmonydiv.on('click', function(event) {
		if ($harmonydiv.hasClass('active')) {
			$harmonydiv.removeClass('active');
			$harmonytext.html('Harmony Off (Shift)');
			IsHarmonyOn = false;
		} else {
			$harmonydiv.addClass('active');
			$harmonytext.html('Harmony On (Shift)');
			IsHarmonyOn = true;
		}
	});

	$(document).on('keydown keyup', function(event){
		var mainAreaDisplay = $mainArea.css('display');
		var pianoDisplay = $pianodiv.css('display');
		if (!$('input,textarea').is(':focus') && mainAreaDisplay == 'block' && pianoDisplay == 'block') {
			var pressedkey = event.which;
			var $pressedkey = $('[data-key="'+pressedkey+'"]');
			var datanote = $pressedkey.attr('data-note');

			if (datanote) {
				if (event.type == 'keydown') {
					if (!$pressedkey.hasClass('active')) {
						socket.emit('playpianonote', {key: datanote, sustain: IsSustainOn, harmony: IsHarmonyOn, chord: chordType, chordbpm: chordBPM});
						playnote(datanote, myUserName, IsSustainOn, IsHarmonyOn, chordType, chordBPM);
						$pressedkey.addClass('active');
						$pressedkey.parent().addClass('active');
					}
				} else {
					$pressedkey.removeClass('active');
					$pressedkey.parent().removeClass('active');
				}
			} else if (pressedkey == 32) {
				if (event.type == 'keydown') {
					if (!$pedaldiv.hasClass('active')) {
						$pedaldiv.addClass('active');
						$SustainText.html('Sustain On (Space)');
						IsSustainOn = true;
					}
				} else {
					$pedaldiv.removeClass('active');
					$SustainText.html('Sustain Off (Space)');
					IsSustainOn = false;
				}
			} else if (pressedkey == 16) {
				if (event.type == 'keydown') {
					if (!$harmonydiv.hasClass('active')) {
						$harmonydiv.addClass('active');
						$harmonytext.html('Harmony On (Shift)');
						IsHarmonyOn = true;
					}
				} else {
					$harmonydiv.removeClass('active');
					$harmonytext.html('Harmony Off (Shift)');
					IsHarmonyOn = false;
				}
			}
		}
	});

	socket.on('sendpianonote', function(data){
		var note = data.key;
		var sustain = data.sustain;
		var harmony = data.harmony;
		var user = data.username;
		var chord = data.chord;
		var bpm = data.bpm;

		clearAllIntervals();

		playnote(note, user, sustain, harmony, chord, bpm);
	});

	$pianotoggle.change(function() {
		if ($pianotoggle.prop('checked')) {
			$pianodiv.slideDown();
		} else {
			$pianodiv.slideUp();
		}
	});

	$('.chordtogglebuttondiv').click(function(){
		if ($(this).find('input').prop('checked')) {
			$('chordtoggletablebutton').find('input').prop('checked', false);
			chordType = false;
		} else {
			$('.chordtoggletablebutton').not(this).prop('checked', false);
			chordType = $(this).find('input').attr('data-chord');
		}
		$('.chordtoggletablebutton').change();
	});

	$('.chordtoggleheaderbuttondiv').click(function(){
		if($(this).find('input').prop('checked')) {
			chordType = false;
			$('#chordtable').slideUp();
			$('.chordtoggletablebutton').prop('checked', false).change();
		} else {
			$('#chordtable').slideDown();
		}
	});

	$('#chordslider').on("change mousemove", function() {
		var bpm = $(this).val();
		chordBPM = bpm;
		
		$('#bpmtext').html(bpm);

		if (bpm < 66) {
			$bpmspeed.html("Largo");
		} else if (bpm < 76) {
			$bpmspeed.html("Adagio");
		} else if (bpm < 108) {
			$bpmspeed.html("Andante");
		} else if (bpm < 120) {
			$bpmspeed.html("Moderato");
		} else if (bpm < 168) {
			$bpmspeed.html("Allegro");
		} else {
			$bpmspeed.html("Presto");
		}
	});

});