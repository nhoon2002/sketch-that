// console.log();
console.log("Timeout 1s");
setTimeout(function() {
  console.log("Running app.js----");


// var poop = require('./firebaseconfig.js');
console.log(firebase.auth().currentUser);
// var auth = firebase.auth();
var database = firebase.database();
var chatData = database.ref("/chat"); //chatbranch
var playersRef = database.ref("players"); //playersbranch
var currentTurnRef = database.ref("turn");
var currentWordRef = database.ref("currentword");
var currentUser_local = firebase.auth().currentUser;
var pointsp1 = 0;
var pointsp2 = 0;
var username = "guest"; //Can make this = currentUser_local.email.split("@")[0]; since firebase already knows if you are logged in or not.
var currentPlayers = null;
var currentTurn = null;
var playerNum = false;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;
var currentWord;
var wordBank = ['javascript', 'jquery', 'firebase', 'poop', 'node', 'extension', 'development', 'json', 'frontend', 'backend'];
var points = 0;
var guesser = null;
// var clockrunning = false;
var counter;
// ------------------------------------------------
// TIMER
// Set our number counter to 100.

        // Set our number counter to 100.
        var number = 30;

        // When the stop button gets clicked, run the stop function.
        // $('#stop').on('click', stop);
        // When the resume button gets clicked, execute the run function.
        $('#modalOk').on('click', function() {
          number = 30;
            $("#drawing").html('<iframe src="https://fast-shore-34962.herokuapp.com/" id="canvasiframe" style="width:755px; height:400px;"></iframe>');
        });

        // The run function sets an interval
        // that runs the decrement function once a second.
        // Notice how we name the interval "counter."
        function run(){
            // clockrunning = true;
            number = 30;
            counter = setInterval(decrement, 1000);
            console.log("running");
        }

        // The decrement function.
        function decrement(){
            // Decrease number by one.
            number--;
            // Show the number in the #show-number tag.
            $('#timer').html('<h2>' + number + '</h2>');

            // Once number hits zero...
            if (number === 0){
              $('#timer').html('<h2>Time Up!!</h2>');

                // ...run the stop function.
                stop();

            }
        }

        // The stop function
        function stop(){
          // clockrunning = false;
            // Clears our "counter" interval.
            // We just pass the name of the interval
            // to the clearInterval function.
            clearInterval(counter);
            console.log("stopping");

        }

        // Execute the run function.
        // run();
//END TIMER/////////////////////////////////////////////////////



console.log("User: " + firebase.auth().currentUser.email);


// NOTE Sort of redundant. can get rid of the click trigger, bring out getInGame() to the outside to immediately start game.
//  getInGame();

if (playerTwoExists && playerOneExists) {
  $("#buttonJoin").hide();
}
$("#buttonJoin").click(function() {
  username = currentUser_local.email.split("@")[0];
  console.log("current user: " + username);

  getInGame();
  $('#buttonJoin').hide();


});






// CHAT LISTENERS
// Chat send button listener, grabs input and pushes to firebase. (Firebase's push automatically creates a unique key)
// if (number === 0) {
//
// }
$("#chat-send").click(function() {




  if ($("#chat-input").val() !== "") {

    var message = $("#chat-input").val();
    if (message === currentWord) {
      guesser = playerNum;
      turnWon(playerNum);
    }

    chatData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });

    $("#chat-input").val("");
  }
});

// Chatbox input listener

$("#chat-input").keypress(function(e) {

  if (e.keyCode === 13 && $("#chat-input").val() !== "") {

    var message = $("#chat-input").val();
    if (message === currentWord) {
      guesser = playerNum;
      points++;
    }

    chatData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });


    $("#chat-input").val("");
  }

});




// Click event for dynamically added <li> elements
// TODO: instead of "li", add an element on a modal which shows when 1) guesser correctly guesses the word or 2) timer is up.
// TODO: on click of "next" (or moving on), increment turn.

// Update chat on screen when new message detected - ordered by 'time' value
chatData.orderByChild("time").on("child_added", function(snapshot) {

  // If idNum is 0, then its a disconnect message and displays accordingly
  // If not - its a user chat message
  if (snapshot.val().idNum === 0) {
    $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }
  else {
    $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }

  // Keeps div scrolled to bottom on each update.
  $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);

  if (snapshot.val().message === currentWord) {
    console.log("guesser"+guesser);
    console.log("points"+points);
    console.log("player"+playerNum);
    if (playerNum === guesser) {
      $("#modalAnswer").text(snapshot.val().message);
      $(".modal-body").text("You earned 1 Point! Nice work!");
      currentTurnRef.transaction(function(turn) {
        return turn + 1;
      });

    } else if (playerNum !== guesser) {
      $(".modal-title").text("Correct answer was guessed!");
      $(".modal-body").text("Prepare to guess next!");

    }
    stop();
    $("#resultMsg").modal('toggle');
    // guesser = null;

  }


  else if (number === 0) {
    $("#modalAnswer").text(snapshot.val().message);
    $(".modal-body").text("Time up. Nobody earned a point!");
    currentTurnRef.transaction(function(turn) {
      return turn + 1;
    });
    stop();
    $("#resultMsg").modal('toggle');
    // guesser = null;
  }



});

// Tracks changes in key which contains player objects
playersRef.on("value", function(snapshot) {

  // length of the 'players' array
  currentPlayers = snapshot.numChildren();

  // Check to see if players exist
  playerOneExists = snapshot.child("1").exists();
  playerTwoExists = snapshot.child("2").exists();

  // Player data objects
  playerOneData = snapshot.child("1").val();
  playerTwoData = snapshot.child("2").val();

  // If theres a player 1, fill in name and win loss data
  if (playerOneExists) {
    $("#player1-name").text(playerOneData.name);
    $("#player1-wins").text("Wins: " + playerOneData.wins);
    $("#player1-losses").text("Losses: " + playerOneData.losses);
  }
  else {

    // If there is no player 1, clear win/loss data and show waiting
    $("#player1-name").text("Waiting for Player 1");
    $("#player1-wins").empty();
    $("#player1-losses").empty();
  }

  // If theres a player 2, fill in name and win/loss data
  if (playerTwoExists) {
    $("#player2-name").text(playerTwoData.name);
    $("#player2-wins").text("Wins: " + playerTwoData.wins);
    $("#player2-losses").text("Losses: " + playerTwoData.losses);
  }
  else {

    // If no player 2, clear win/loss and show waiting
    $("#player2-name").text("Waiting for Player 2");
    $("#player2-wins").empty();
    $("#player2-losses").empty();
  }
});

// Detects changes in current turn key
currentTurnRef.on("value", function(snapshot) {
  // stop();
  // Gets current turn from snapshot
  currentTurn = snapshot.val();


  // Don't do the following unless you're logged in
  if (playerNum) {

    // For turn 1
    if (currentTurn === 1) {

        run();
        currentWordRef.set(wordBank[0]);
        currentWord = wordBank[0];
      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerNum) {
        $("#result").html("<p>It's Your Turn to Draw, "+playerOneData.name +"! The word is: </p>" + wordBank[0]);


      }

      else {
        // If it isnt the current players turn, tells them theyre waiting for player one
        $("#result").html("<p>It's Your Turn to Guess.<p>");
      }

      // Shows yellow border around active player
      $("#player1").css("border", "2px solid yellow");
      $("#player2").css("border", "1px solid black");
    }

    else if (currentTurn === 2) {

          run();
          //resets the current word to a random word
          currentWordRef.set(wordBank[1]);
          currentWord = wordBank[1];
      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerNum) {
        $("#result").html("<p>It's Your Turn to Draw, "+playerTwoData.name +"! The word is: </p>" + wordBank[1]);

      }
      else {

        // If it isnt the current players turn, tells them theyre waiting for player two
        $("#result").html("<p>It's your turn to guess.<p>");

      }

      // Shows yellow border around active player
      $("#player2").css("border", "2px solid yellow");
      $("#player1").css("border", "1px solid black");
    }
    else if (currentTurn == 3) {
      run();
      //resets the current word to a random word
      currentWordRef.set(wordBank[2]);
      currentWord = wordBank[2];
      // If its the current player's turn, tell them and show choices
      if (currentTurn === (parseInt(playerNum)+2)) {
        $("#result").html("<p>It's Your Turn to Draw, "+playerOneData.name +"! The word is: </p>" + wordBank[2]);

      }
      else {

        // If it isnt the current players turn, tells them theyre waiting for player one
        $("#result").html("<p>It's Your Turn to Guess.<p>");
      }

      // Shows yellow border around active player
      $("#player1").css("border", "2px solid yellow");
      $("#player2").css("border", "1px solid black");
    }
    else if (currentTurn === 4) {
          run();
          //resets the current word to a random word
          currentWordRef.set(wordBank[3]);
          currentWord = wordBank[3];

      // If its the current player's turn, tell them and show choices
      if (currentTurn == (parseInt(playerNum)+2)) {
        $("#result").html("<p>It's Your Turn to Draw, "+playerTwoData.name +"! The word is: </p>" + wordBank[3]);
      }
      else {

        // If it isnt the current players turn, tells them theyre waiting for player two
        $("#result").html("<p>It's your turn to guess.<p>");

      }
      // Shows yellow border around active player
      $("#player2").css("border", "2px solid yellow");
      $("#player1").css("border", "1px solid black");
    }

///////////////RESULTS///////////////////////
    else if (currentTurn === 5) {
      $("#modalOk").on("click", function() {

        gameLogic(points,username,playerNum);
      });
      // Where the game win logic takes place then resets to turn 1

      // reveal both player choices



      //  reset after timeout
      var moveOn = function() {
        currentTurn = null;
        points = 0;
        guesser = null;



        // check to make sure players didn't leave before timeout
        if (playerOneExists && playerTwoExists) {
          currentTurnRef.set(1);

          console.log("Starting a new game!");
        }
      };

      //  show results for 2 seconds, then resets
      $("#modalOk2").on("click", function() {
          moveOn();
      });

    }



  }
});

// Updates the current Word.
currentWordRef.on("value", function(snapshot) {
  currentWord = snapshot.val();
  console.log(currentWord);
});


// When a player joins, checks to see if there are two players now. If yes, then it will start the game.
playersRef.on("child_added", function(snapshot) {

  if (currentPlayers === 1) {

    // set turn to 1, which starts the game
    currentTurnRef.set(1);
  }
});
//
// Function to get in the game
function getInGame() {

  // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
  // Needed because Firebase's '.push()' creates its unique keys client side,
  // so you can't ".push()" in a ".onDisconnect"
  var chatDataDisc = database.ref("/chat/" + Date.now());



  // Checks for current players, if theres a player one connected, then the user becomes player 2.
  // If there is no player one, then the user becomes player 1
  if (currentPlayers < 2) {

    if (playerOneExists) {
      playerNum = 2;
    }
    else {
      playerNum = 1;
    }

    // Creates key based on assigned player number
    playerRef = database.ref("/players/" + playerNum);

    // Creates player object. 'choice' is unnecessary here, but I left it in to be as complete as possible
    playerRef.set({
      name: username,
      wins: 0,
      losses: 0,
      roundswon: 0,
      // choice: null
    });

    // On disconnect remove this user's player object
    //TODO:
    playerRef.onDisconnect().remove();

    // If a user disconnects, set the current turn to 'null' so the game does not continue
    currentTurnRef.onDisconnect().remove();

    // Send disconnect message to chat with Firebase server generated timestamp and id of '0' to denote system message
    chatDataDisc.onDisconnect().set({
      name: username,
      time: firebase.database.ServerValue.TIMESTAMP,
      message: "has disconnected.",
      idNum: 0
    });

    // Remove name input box and show current player number.

  }
  else {

    // If current players is "2", will not allow the player to join
    alert("Sorry, Game Full! Try Again Later!");
  }
}
//
// Game logic - Tried to space this out and make it more readable. Displays who won, lost, or tie game in result div.
// Increments wins or losses accordingly.
function turnWon(playerNum) {
    playersRef.child(playerNum).child("roundswon").transaction(function(roundswon) {
      return roundswon + 1;
    });
    console.log("Player"+playerNum+" won a point.");
}
playersRef.child("1").child("roundswon").on("value", function(snapshot) {
  pointsp1 = snapshot.val();
  console.log("pointsp1 = "+pointsp1);

});
playersRef.child("2").child("roundswon").on("value", function(snapshot) {
  pointsp2 = snapshot.val();
  console.log("pointsp2 = "+pointsp2);
});
function gameLogic(pointsp1,pointsp2, username, playerNum) {
  if (pointsp1 > pointsp2) {
    $(".modal-title").text("Player 1 won!");
    $(".modal-body").text("");
    playersRef.child("1").child("wins").transaction(function(wins) {
      return wins + 1;
    });
    playersRef.child("2").child("losses").transaction(function(losses){
      return losses + 1;
    });

  } else if (pointsp1 < pointsp2) {
    $(".modal-title").text("Player 2 won!");
    $(".modal-body").text("");
    playersRef.child("2").child("wins").transaction(function(wins){
      return wins + 1;
    });
    playersRef.child("1").child("losses").transaction(function(losses){
      return losses + 1;
    });
  } else if (pointsp1 === pointsp2) {
    $(".modal-title").text("It's a draw!");
    $(".modal-body").text("");
  }

  $("#endMsg").modal('toggle');
}



}, 3000);
