/**
 * Created by Jason Ho on 11/6/2014.
 */

"use strict";

var dataUrl = 'https://api.parse.com/1/classes';

angular.module('CoursesApp', ['ui.bootstrap'])
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'ak8Tj902WzkNW9UPaOtKpyiDavZUjLA0kX5UtcAt';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'yaNum4wz2FQcIzSPniCalxDKiU8gxtgyAfn0SHXU';
    })
    .controller('CoursesController', function($scope, $http) {
        $scope.coursesRaw = [];
        $scope.coursesAll = [];
        $scope.commentsRaw = [];
        $scope.errorMessage = null;
        $scope.loading = false;
        $scope.categories = [];
        $scope.searchString = '';
        $scope.newComment = {rating: 1, name: '', title: '', body: '', score: 0, courseId: null};
        $scope.quarterSort = {aut: false, win: false, spr: false, sum: false};

        //gets courses from the parse database
        $scope.getCourses = function() {
            $scope.loading = true;

            $http.get(dataUrl + '/courses')
                .success(function(data) {
                    $scope.coursesRaw = data.results;
                    $scope.sortCourses();
                })
                .error(function(err) {
                    $scope.errorMessage = err;
                })
                .finally(function() {
                    $scope.loading = false;
                });
        }; // getCourses()

        //sorts the courses leaving the raw array intact
        $scope.sortCourses = function() {
            _.forEach($scope.coursesRaw, function(courseData) {
                if($scope.categories.indexOf(courseData.category) < 0) {
                    $scope.categories.push(courseData.category);
                }

                //adds a few properties that don't need to be stored in the database but are required for the webapp
                courseData.fullName = courseData.school + ' ' + courseData.number;
                courseData.collapsed = true;
                courseData.commentsCollapsed = true;
            });

            $scope.categories.sort();

            //for each category, push an object to our array with two properties, a category and an array containing objects from parse that match that category
            _.forEach($scope.categories, function(cat) {
                $scope.coursesAll.push({category: cat, coursesFiltered: _.filter($scope.coursesRaw, function(course) {return course.category == cat;})});
            });
        };

        //checks for and allows sorting by quarter offered
        $scope.quarterCheck = function(course) {
            if(!$scope.quarterSort.aut && !$scope.quarterSort.win && !$scope.quarterSort.spr && !$scope.quarterSort.sum){
                return true;
            }else{
                //we only need to compare if the user selected a specific quarter, for example if the user selects autumn and spring we don't need to check summer at all, we don't care if it's offered summer or not
                var match = true;
                if($scope.quarterSort.aut){match &= $scope.quarterSort.aut == course.autumn;}
                if($scope.quarterSort.win){match &= $scope.quarterSort.win == course.winter;}
                if($scope.quarterSort.spr){match &= $scope.quarterSort.spr == course.spring;}
                if($scope.quarterSort.sum){match &= $scope.quarterSort.sum == course.summer;}
                return match;
            }
        };

        ////////////////////////////////////
        ///////////nav bar fixing///////////
        ////////////////////////////////////
        var nav = $('nav');
        var navTop = nav.offset().top; //returns location of top of navbar
        var navHeight = nav.outerHeight(); //returns height of nav bar
        var navPlaceholder = $('.nav-placeholder'); //placeholder so that when nav is removed from pageflow we don't jump
        navPlaceholder.height(navHeight);

        $(window).scroll(function () {
            var scrollPos = $(this).scrollTop(); //returns scroll position of this (which is the current window)
            //console.log(scrollPos);

            //once the nav bar's top is off the screen...
            if (scrollPos > navTop) {
                //...fix it to the window
                nav.addClass('nav-fixed');
                navPlaceholder.show();
            } else {
                nav.removeClass('nav-fixed');
                navPlaceholder.hide();
            }
        });
        ////////////////////////////////////
        ////////nav bar fixing end//////////
        ////////////////////////////////////

        //get comments from parse database
        $scope.getComments = function() {
            $scope.loading = true;
            $http.get(dataUrl + '/comments')
                .success(function(data) {
                    //sort the comments by score
                    $scope.commentsRaw = _.sortBy(data.results, 'score').reverse();
                })
                .error(function(err) {
                    $scope.errorMessage = err;
                })
                .finally(function() {
                    $scope.loading = false;
                });
        }; //getComments()

        //add a comment
        $scope.addComment = function(course) {
            $scope.newComment.courseId = course.objectId;
            $scope.loadingComment = true;
            $http.post(dataUrl + '/comments', $scope.newComment)
                .success(function(responseData) {
                    $scope.newComment.objectId = responseData.objectId;
                    $scope.commentsRaw.push($scope.newComment);
                    $scope.newComment = {rating: 1, name: '', title: '', body: '', score: 0, courseId: null};
                })
                .error(function(err) {
                    $scope.errorMessage = err;
                })
                .finally(function() {
                    $scope.loadingComment = false;
                });
        }; //addComment()

        //increment the score of a comment
        $scope.incrementScore = function(comment, amt) {
            if(!$.cookie('comment' + comment.objectId)) {
                $http.put(dataUrl + '/comments/' + comment.objectId, {
                    score: {
                        __op: 'Increment',
                        amount: amt
                    }
                })
                    //TODO allow negative score?
                    //TODO find more secure way than cookies to prevent multiple votes
                    .success(function(responseData) {
                        //console.log(responseData);
                        if(responseData.score < 0) {
                            //catch the case where two people are voting on the same thing and stop it from going below 0
                            $scope.incrementScore(comment, 1);
                        } else {
                            comment.score = responseData.score;
                            $.cookie('comment' + comment.objectId, 'true', {expires: 30});
                        }
                    })
                    .error(function(err) {
                        $scope.errorMessage = err;
                    });
            }

        }; //incrementScore()

        //get all data
        $scope.getCourses();
        $scope.getComments();
    });