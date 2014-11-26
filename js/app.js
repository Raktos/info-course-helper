/**
 * Created by Jason Ho on 11/6/2014.
 */

"use strict";

var coursesUrl = 'https://api.parse.com/1/classes/courses';

angular.module('CoursesApp', ['ui.bootstrap'])
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'ak8Tj902WzkNW9UPaOtKpyiDavZUjLA0kX5UtcAt';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'yaNum4wz2FQcIzSPniCalxDKiU8gxtgyAfn0SHXU';
    })
    .controller('CoursesController', function($scope, $http) {
        $scope.coursesRaw = [];
        $scope.coursesAll = [];
        $scope.errorMessage = null;
        $scope.loading = false;
//        $scope.categories = ['Core', 'Prerequisite', 'Elective'];
        $scope.categories = [];
        $scope.searchString = '';

        $scope.quarterSort = {aut: false, win: false, spr: false, sum: false};

        $scope.getCourses = function() {
            $scope.loading = true;

            $http.get(coursesUrl)
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

        $scope.sortCourses = function() {
            _.forEach($scope.coursesRaw, function(courseData) {
                if($scope.categories.indexOf(courseData.category) < 0) {
                    $scope.categories.push(courseData.category);
                }

                courseData.fullName = courseData.school + ' ' + courseData.number;
                courseData.collapsed = true;
            });

            $scope.categories.sort();

            //for each category, push an object to our array with two properties, a category and an array containing objects from parse that match that category
            _.forEach($scope.categories, function(cat) {
                $scope.coursesAll.push({category: cat, coursesFiltered: _.filter($scope.coursesRaw, function(course) {return course.category == cat;})});
            });
            console.log($scope.coursesAll);
        };

        $scope.quarterCheck = function(course) {
            if(!$scope.quarterSort.aut && !$scope.quarterSort.win && !$scope.quarterSort.spr && !$scope.quarterSort.sum){
                return true;
            }else{
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

        $scope.getCourses();

        console.log($scope.coursesAll);
    });