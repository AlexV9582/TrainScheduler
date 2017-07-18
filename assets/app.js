var config = {
	apiKey: "AIzaSyAUpEMzWj02-qGfXY862k_kM9wDw2dYwVU",
	authDomain: "homework-stuff.firebaseapp.com",
	databaseURL: "https://homework-stuff.firebaseio.com",
	projectId: "homework-stuff",
	storageBucket: "homework-stuff.appspot.com",
	messagingSenderId: "1060355102489"
};
firebase.initializeApp(config);
var database    = firebase.database()
var trainName;
var destination;
var originTime;
var frequency;
var nextArrival = 0;
var minutesAway = 0;
var hoursSplit;
var minutesSplit;

database.ref().on("value", function(snapshot) {
	if (snapshot.child("trainName").exists() && snapshot.child("destination").exists() && snapshot.child("originTime").exists() && snapshot.child("frequency").exists()) {
	    trainName   = snapshot.val().trainName;
	    destination = snapshot.val().destination;
	    originTime  = snapshot.val().originTime;
	    frequency   = snapshot.val().frequency;

    // Log the local data to the console.
	    /*console.log(trainName);
	    console.log(destination);
	    console.log(originTime);
	    console.log(frequency);*/
  }
})
  
  //Clear Firebase
  $("#clear-button").on("click", function(){
  	database.ref().set({})
  })

  // Get user input from form and add to Firebase

$("#submit-button").on("click", function(){	
	database.ref().push({
		trainName:   $("#train-name-entry").val().trim(),
		destination: $("#destination-entry").val().trim(),
		originTime:  $("#origin-time-entry").val().trim(),
		frequency:   $("#frequency-entry").val().trim(),
		dateAdded:   firebase.database.ServerValue.TIMESTAMP,
		minutesAway: minutesAway
	})
	$("#train-name-entry").val("");
	$("#destination-entry").val("");
	$("#origin-time-entry").val("");
	$("#frequency-entry").val(""); 
	   
})

//Add data to table
database.ref().on("child_added", function(snapshot){
	var sv = snapshot.val();
	console.log(sv)
	// Convert frequency and currentTime to Unix time
	var freq = (parseInt(sv.frequency) * 60);
	var currentTime = moment().format("X")
	//console.log(currentTime)

	//Set time to new variable for moment object and set to Unix time

	hoursSplit = parseInt(sv.originTime.split(":")[0])
	//console.log(hoursSplit)
	minutesSplit = parseInt(sv.originTime.split(":")[1])
	//console.log(minutesSplit)
	var firstTime = moment().set({'hour': hoursSplit, 'minute': minutesSplit});
	var firstTimeFormatted = moment(firstTime).format("X")
	//console.log(firstTimeFormatted)
	//console.log(freq)

	// Find the difference between current time and new firstTime variable
	if (currentTime > firstTimeFormatted) {
		var timeRemainder = (currentTime - firstTimeFormatted)
		//console.log(timeRemainder)

		//Find number of trips made between origin and current times and add time for next trip

		var nextArrivalFreq    = ((Math.floor(timeRemainder / freq)) + 1) * parseInt(sv.frequency)
		var nextArrivalHours   = Math.floor(nextArrivalFreq / 60)
		var nextArrivalMinutes = nextArrivalFreq - (nextArrivalHours * 60)
		nextArrival            = moment(moment(firstTime).add({hours: nextArrivalHours, minutes: nextArrivalMinutes})).format("HH:mm")
		
		/*console.log(sv.originTime)
		console.log(nextArrivalMinutes)
		console.log(nextArrivalHours)
		console.log(nextArrival)*/
	}else {
		nextArrival = sv.originTime
	}

	//Convert current time into minutes

	var currentTimeStr             = moment().format("HH:mm")
	var hoursSplitCurrent          = parseInt(currentTimeStr.split(":")[0])
	var minutesSplitCurrent        = parseInt(currentTimeStr.split(":")[1])
	var hoursSplitCurrentConverted = hoursSplitCurrent * 60
	var convertedCurrent           = hoursSplitCurrentConverted + minutesSplitCurrent
	//console.log(convertedCurrent)

	//Convert the nextArrival time to minutes

	
	var hoursSplitNext          = parseInt(nextArrival.split(":")[0])
	var minutesSplitNext        = parseInt(nextArrival.split(":")[1])
	var hoursSplitNextConverted = hoursSplitNext * 60
	var convertedNext           = hoursSplitNextConverted + minutesSplitNext
	//console.log(convertedNext)

	//Find remaining minutes and display in table
	minutesAway                    = convertedNext - convertedCurrent
	//console.log(minutesAway)
	//console.log(nextArrival)
	$("tbody").append($("<tr><td>"+sv.trainName+"</td><td>"+sv.destination+"</td><td>"+sv.frequency+"</td><td>"+nextArrival+"</td><td>"+minutesAway+"</tr>"));
})

//Add last added data to panel

database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
	var sv = snapshot.val();
	$("#last-train-name").html(sv.trainName);
	$("#last-train-destination").html(sv.destination);
	$("#last-train-frequency").html(sv.frequency);
	$("#last-train-time").html(sv.originTime)
})
















