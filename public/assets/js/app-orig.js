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

var username = "guest"; //Can make this = currentUser_local.email.split("@")[0]; since firebase already knows if you are logged in or not.
var currentPlayers = null;
var currentTurn = null;
var playerNum = false;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;
var randomWord;
var wordBank = ['javascript', 'jquery', 'firebase', 'poop', 'node'];
var points = 0;
var guesser = null;

// TODO: modalElement onclick (resetGame);
// TODO: player1 or player2 on disconnect (resetGame);


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
$("#chat-send").click(function() {

  if ($("#chat-input").val() !== "") {

    var message = $("#chat-input").val();
    if (message === randomWord) {
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

// Chatbox input listener

$("#chat-input").keypress(function(e) {

  if (e.keyCode === 13 && $("#chat-input").val() !== "") {

    var message = $("#chat-input").val();
    if (message === randomWord) {
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

  if (snapshot.val().message === randomWord) {
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
      $("#modalOk").click(function() {
      });
    }
      $("#resultMsg").modal('toggle');
      guesser = null;
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

  // Gets current turn from snapshot
  currentTurn = snapshot.val();


  // Don't do the following unless you're logged in
  if (playerNum) {

    // For turn 1
    if (currentTurn === 1) {
      if (playerNum === 1) {

        var currentWord = wordBank[Math.floor(Math.random()*wordBank.length)];
        //resets the current word to a random word
        currentWordRef.set(currentWord);
      }
      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerNum) {
        setTimeout(function() {
          $("#result").html("<p>It's Your Turn to Draw, "+playerOneData.name +"! The word is: </p>" + randomWord);
        }, 2000);
      }
      else {

        // If it isnt the current players turn, tells them theyre waiting for player one
        $("#result").html("<p>It's Your Turn to Guess.<p>");
      }

      // Shows yellow border around active player
      $("#player1").css("border", "2px solid yellow");
      $("#player2").css("border", "1px solid black");
    }
    else if (currentTurn === 3) {
        if (playerNum === 1) {
          var currentWord = wordBank[Math.floor(Math.random()*wordBank.length)];
          //resets the current word to a random word
          currentWordRef.set(currentWord);
        }
      // If its the current player's turn, tell them and show choices
        if (currentTurn === (parseInt(playerNum)+2)) {
        setTimeout(function() {
          $("#result").html("<p>It's Your Turn to Draw, "+playerOneData.name +"! The word is: </p>" + randomWord);
        }, 2000);
        // $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
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
      if (playerNum === 1) {
        var currentWord = wordBank[Math.floor(Math.random()*wordBank.length)];
          //resets the current word to a random word
          currentWordRef.set(currentWord);
        }
      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerNum) {
        setTimeout(function() {
          $("#result").html("<p>It's Your Turn to Draw, "+playerTwoData.name +"! The word is: </p>" + randomWord);
        }, 2000);
        // $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
      }
      else {

        // If it isnt the current players turn, tells them theyre waiting for player two
        $("#result").html("<p>It's your turn to guess.");

      }

      // Shows yellow border around active player
      $("#player2").css("border", "2px solid yellow");
      $("#player1").css("border", "1px solid black");
    }
    else if (currentTurn === 4) {
      if (playerNum === 1) {
      var currentWord = wordBank[Math.floor(Math.random()*wordBank.length)];
          //resets the current word to a random word
          currentWordRef.set(currentWord);
        }
      // If its the current player's turn, tell them and show choices
      if (currentTurn == (parseInt(playerNum)+2)) {
        setTimeout(function() {
          $("#result").html("<p>It's Your Turn to Draw, "+playerTwoData.name +"! The word is: </p>" + randomWord);
        }, 2000);
        // $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
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

      // Where the game win logic takes place then resets to turn 1
      // debugger;
      setTimeout(function() {

      gameLogic(points,username);
      // debugger;
      // reveal both player choices

      // $("#modal-title").text("You won, "+username+"!");
      // $(".modal-body").text("Nice work!");
      // $("#resultMsg").modal('toggle');


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

      //  show results for 6 seconds, then resets
        setTimeout(moveOn, 6000);
      }, 3000);

    }
}
});


// Updates the current Word.
// currentWordRef.on("value", function(snapshot) {
//   randomWord = snapshot.val();
//   console.log(randomWord);
// });


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
      losses: 0
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
function gameLogic(points, username, playerNum) {
  if (points > 2) {
    $("#modal-title").text("You won, "+username+"!");
    $(".modal-body").text("Nice work!");
    playersRef.child(playerNum).child("wins").transaction(function(wins) {
      return wins + 1;
    });

  } else if (points < 2) {
    $("#modal-title").text("You lost, "+username+"!");
    $(".modal-body").text("Better luck next time!");
    playersRef.child(playerNum).child("losses").transaction(function(losses){
      return losses + 1;
    });
  } else if (points === 2) {
    $("#modal-title").text("It's a draw!");
    $(".modal-body").text("");
  }

  $("#endMsg").modal('toggle');
}



}, 3000);
