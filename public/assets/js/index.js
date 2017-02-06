var database = firebase.database();
var currentUser_local;


$("#mainLogin").on("click", function() {
  $("#loginModal").modal('toggle');
});
$("#mainRegister").on("click", function() {
  $("#registerModal").modal('toggle');
});


//Clicking the log in button...
$('#loginSubmit').on("click", function() {
   //Saves input fields into local variables
   var userEmail = $('#userEmail_log').val().trim();
   var userPass =  $('#userPw_log').val().trim();

   console.log(userEmail);
   console.log(userPass);

   //firebase authorization requirement
   var auth = firebase.auth();
   //Sign in function for firebase
   var promise = auth.signInWithEmailAndPassword(userEmail, userPass)
      .then (function() {
         //Loads the dashboard upon successful signin

        console.log("You've successfully logged in");
        currentUser_local = firebase.auth().currentUser;
        username = currentUser_local.email.split("@")[0];
        console.log(username);
        // debugger;
        window.location.href = "/dashboard";
      //   debugger;

      })
      .catch(function (error) {
         alert(error.message);
      });

return false; //REQUIRED, otherwise firebase code BREAKS.


});


$("#registerSubmit").on("click", function() {
  var userEmail = $('#userEmail_reg').val().trim();
  var userPass =  $('#userPw_reg').val().trim();
  var userName = $('#userName').val().trim();
  console.log(userEmail);
  console.log(userPass);
  console.log(userName);



  //Firebase authentication requirement
  var auth = firebase.auth();

  //Creates accounts to firebase
  var promise = auth.createUserWithEmailAndPassword(userEmail, userPass)
     .then(function() {
      //  debugger;
        var loggedUser = firebase.auth().currentUser;

        //If successful creation, creates the following children to the user branch (labeled by uid)
        database.ref("users").child(loggedUser.uid).set({
           email: loggedUser.email,
           username: userName,

        });
        firebase.auth().signOut(); //signs out current user
        //TODO not sure if this ALERT code breaks everything
        alert('Please log-in again!');

        location.reload(); //Reloads the log-in page

     })

     .catch(function (error) {
      //  debugger;
        // alert(error.message);
     });

return false;
}); //end of 'create' onclick function


// $('#listLogout').on('click', function(){
//    firebase.auth().signOut(); //signs out current user
//    location.reload(); //Reloads signin page
//
//    if(firebaseUser) { //if a user is logged in still...
//       console.log(firebaseUser);
//
//    } else { //if successful logout...
//       console.log('not logged in');
//       alert("You have been logged out!");
//    }
//
// });


// When an authentication state has been changed...
firebase.auth().onAuthStateChanged(firebaseUser => {

   // var refObject = firebase.database().ref().child('users');
  //  console.log(firebase.auth().currentUser.uid);


   if(firebaseUser) { //if user is logged in...

      console.log("auth status changed: logged in as: " + firebaseUser.email);

   } else {
      console.log('auth status changed: not logged in');

   }

});
