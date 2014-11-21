/**
 * Created by Jason Ho on 11/6/2014.
 */

"use strict";

var coursesUrl = 'https://api.parse.com/1/classes/courses';

angular.module('CoursesApp', [])
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'ak8Tj902WzkNW9UPaOtKpyiDavZUjLA0kX5UtcAt';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'yaNum4wz2FQcIzSPniCalxDKiU8gxtgyAfn0SHXU';
    })
    .controller('CoursesController', function($scope, $http) {
        $scope.coursesAll = [];
        $scope.errorMessage = null;
        $scope.loading = false;
//        $scope.categories = ['Core', 'Prerequisite', 'Elective'];
        $scope.categories = [];

        $scope.getCourses = function() {
            $scope.loading = true;

            $http.get(coursesUrl)
                .success(function(data) {
                    _.forEach(data.results, function(courseData) {
                        if($scope.categories.indexOf(courseData.category) < 0) {
                            $scope.categories.push(courseData.category);
                        }
                    });

                    $scope.categories.sort();

                    //for each category, push an object to our array with two properties, a category and an array containing objects from parse that match that category
                    _.forEach($scope.categories, function(cat) {
                        $scope.coursesAll.push({category: cat, coursesFiltered: _.filter(data.results, function(course) {return course.category == cat;})});
                    });
                    console.log($scope.coursesAll);
                })
                .error(function(err) {
                    $scope.errorMessage = err;
                })
                .finally(function() {
                    $scope.loading = false;
                });
        }; // getCourses()

        $scope.getCourses();

        console.log($scope.coursesAll);
    });
jQuery(document).ready(function() {
    jQuery('p a[href!="#top"]').attr('target', '_blank');
    jQuery('section').hide().fadeIn(1000);

    jQuery('nav a, p a[href="#top"]').click(function (eventObject) {
        //console.log(this.hash);
        var targetElement = jQuery(this.hash);
        jQuery('html,body').animate({scrollTop: targetElement.offset().top - navHeight}, 700);

        eventObject.preventDefault();
    });

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

});