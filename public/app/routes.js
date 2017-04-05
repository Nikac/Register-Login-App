var app = angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

	$routeProvider
	.when('/', {
		templateUrl : 'app/views/pages/home.html'
	})
	.when('/about', {
		templateUrl: 'app/views/pages/about.html'
	})
	.when('/register', {
		templateUrl: 'app/views/pages/user/register.html',
		controller: 'userCtrl',
		controllerAs: 'register',
		authenticated: false
	})
	.when('/login', {
		templateUrl: 'app/views/pages/user/login.html',
		authenticated: false
	})
	.when('/logout', {
		templateUrl: 'app/views/pages/user/logout.html',
		authenticated: true
	})
	.when('/profile', {
		templateUrl: 'app/views/pages/user/profile.html',
		authenticated: true
	})
	.when('/activate/:token', {
		templateUrl: 'app/views/pages/user/activation/activate.html',
		controller: 'emailCtrl',
		controllerAs: 'email'
	})
	.when('/resend', {
		templateUrl: 'app/views/pages/user/activation/resend.html',
		controller: 'resendCtrl',
		controllerAs: 'resend'
	})
	.when('/resetUsername', {
		templateUrl: 'app/views/pages/user/reset/username.html',
		controller: 'usernameCtrl',
		controllerAs: 'username',
		authenticated: false
	})
	.when('/resetPassword', {
		templateUrl: 'app/views/pages/user/reset/password.html',
		controller: 'passwordCtrl',
		controllerAs: 'password',
		authenticated: false
	})
	.when('/reset/:token', {
		templateUrl: 'app/views/pages/user/reset/newpassword.html',
		controller: 'resetCtrl',
		controllerAs: 'reset',
		authenticated: false
	})


	.otherwise({ redirectTo: '/' });

	$locationProvider.html5Mode({ enabled: true, requireBase: false });
});

app.run(['$rootScope', 'Auth' ,'$location', function($rootScope, Auth, $location){
		$rootScope.$on('$routeChangeStart', function(event, next, current) {
			if (next.$$route.authenticated == true) {
				if (!Auth.isloggedIn()) {
					event.preventDefault();
					$location.path('/');
				}
			} else if (next.$$route.authenticated == false) {
				if (Auth.isloggedIn()) {
					event.preventDefault();
					$location.path('/profile');
				}
			}
		});
		
}]);