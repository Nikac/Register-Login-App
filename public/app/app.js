angular.module('appUser', ['appRoutes', 'userController', 'ngAnimate','userService', 'mainController','authenticateService', 'emailController'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptor');
});