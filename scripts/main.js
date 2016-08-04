/**
 * Main javascript file for Mindset Quiz / PERTS Challenege
 * by Payam Yousefi | 08-01-16
 */

'use strict'; // Keep global scope happy

var mindsetQuizApp = angular.module("quizApp", []);

// Controller for information section
mindsetQuizApp.controller('informationalCtrl', function($scope) {
$scope.showingMore = false;
  $scope.showMoreInfo = function(){
    $scope.showingMore = true;
  };
});

// Controller for quiz section
mindsetQuizApp.controller('quizCtrl', function($scope, questionFactory,
  $timeout, $interval) {
  // Set defaults to 0 / false
  var true_value = 0;
  var false_value = 0;
  var increaseInterval; // For results gauge interval
  $scope.score = 0;
  $scope.inProgress = false;
  $scope.finished = false;
  $scope.flip = false;

  $scope.startQuiz = function () {
    $scope.flip = true;
    $scope.questionID = 0;
    $scope.inProgress = true;
    $scope.finished = false;
    $scope.shuffleQuestions(); // Shuffle to random order
    $scope.getQuestion();
  };
  $scope.shuffleQuestions = function (){
    questionFactory.shuffleQuestions();
  };
  $scope.getQuestion = function() {
    var question = questionFactory.getQuestion($scope.questionID);
    if (question) {
      $scope.question = question.question_text;
      true_value = question.true_value;
      false_value = question.false_value;
    } else {
      // End of quiz!
      $scope.question = "";
      // Hide the card briefly
      $scope.flip = false;
      $('.quiz-active').css('opacity', '1');
      $scope.finished=true;
      var result = $scope.score/4;
      var mindsetResult = "";

      // Determine results
      if(result >= 0 && result < 0.25){
        mindsetResult = "You have a strong fixed mindset.";
      } else if (result >= 0.25 && result < 0.5){
        mindsetResult = "You have a fixed mindset with some growth ideas.";
      } else if(result >= 0.5 && result <= 0.75) {
        mindsetResult = "You have a growth mindset with some fixed ideas.";
      } else if (result > 0.75){
        mindsetResult = "You have a strong growth mindset.";
      }

      // Show results
      $scope.mindset = mindsetResult;
      $timeout(function() {
        $scope.setGauge(result*100);
      }, 600);
    }
  };
  $scope.setGauge = function(percentScore){
    var val = 0;
    increaseInterval = $interval(function(){
      if (val === 0){
        // start animation at interval start instead of earlier
        $('.gauge-container .gauge-c').css(
          'transform', 'rotate('+ (percentScore / 200) +'turn)');
        $('#gauge-percent').text("0%"); // in case 0
      }
      if (val < percentScore){
        val += 1;
        $('#gauge-percent').text(val+"%");
      } else {
        $scope.stopGauge(); // stop intervals
      }
    }, 10);
  };
  $scope.stopGauge = function(){
    if (angular.isDefined(increaseInterval)) {
      $interval.cancel(increaseInterval);
      increaseInterval = undefined; // reset
    }
  };
  $scope.answer = function(ans) {
    // Prevent buttons from staying focused between cards
    $("button.option").blur();
    if($scope.questionID < 4){
      $('.quiz-active').css('opacity', '0');
    }
    // Slow down question cycling a little
    $timeout(function() {

      // Collect score
      if(ans === true) {
        $scope.score += true_value;
      } else {
        $scope.score += false_value;
      }

      if($scope.questionID < 3){
        $('.quiz-active').css('opacity', '1');
      }
      $scope.questionID++;
      $scope.getQuestion();

    }, 500);

  };
  $scope.reset = function() {
    // Take quiz again!
    $('.quiz-active').css('opacity', '0');
    $timeout(function() {
      $('.gauge-container .gauge-c').css('transform', ''); // reset gauge
      $('#gauge-percent').text("0%"); // reset gauge
      $scope.inProgress = true;
      $scope.finished = false;
      $scope.score = 0;
      $('.quiz-active').css('opacity', '1');
      $scope.startQuiz();
    }, 500);
  };
});

// Set up questions database + relevant methods
mindsetQuizApp.factory('questionFactory', function(){
  var questions = [
    {
      "question_text": "You can learn new things, but you can't really change your basic intelligence.",
      "true_value": 0,
      "false_value": 1
    }, {
      "question_text": "Your intelligence is something about you that you can't change very much.",
      "true_value": 0,
      "false_value": 1
    }, {
      "question_text": "You have a certain amount of intelligence and you really can't do much to change it.",
      "true_value": 0,
      "false_value": 1
    }, {
      "question_text": "I often feel threatened by successful people.",
      "true_value": 0,
      "false_value": 1
    }, {
      "question_text": "When I don't succeed at something, it makes me excited to try again.",
      "true_value": 1,
      "false_value": 0
    }, {
      "question_text": "I'm not worried about looking foolish. I'll take on challenges even if they look difficult.",
      "true_value": 1,
      "false_value": 0
    }
  ];

  var methods = {
    // Function to randomize questions array element order
    shuffleQuestions: function() {
      for (var i = questions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = questions[i];
        questions[i] = questions[j];
        questions[j] = temp;
      }
    },
    // Get the question
    getQuestion: function(id){
      if( id < 4 ){ // limit to 4 questions
        return questions[id];
      }  else {
        return false;
      }
    }
  };

  return methods;
});
