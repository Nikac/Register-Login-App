angular.module('mainController', ['authenticateService'])

.controller('mainCtrl', function($http,Auth, $timeout, $location, $rootScope) {
	var app = this;

	$rootScope.$on('$routeChangeStart', function() {
		app.isloggedIn = true;
		if (Auth.isloggedIn()) {
			Auth.getUser().then(function(data) {
				console.log(data.data.username);
				app.username = data.data.username;
				app.email = data.data.email;
			});
		} else {
			app.username = '';
			app.isloggedIn = false;
		}
	});

	this.doLogin = function(loginData) {
			app.errorMsg  = false;
			app.loading = false;
			app.expired = false;
			app.disabled = true;
			
		Auth.login(app.loginData).then(function(data) {
			if (data.data.success) {
				app.loading = true;
				app.successMsg = data.data.message + ".... Redirecting";

				$timeout(function() {
					$location.path('/about');
					app.loading = false;
					app.successMsg = false;
				}, 2000);
			} else {
				if (data.data.expired) {
					app.expired = true;
					app.loading  = false;
					app.errorMsg = data.data.message;
				} else {
					app.loading  = false;
					app.disabled = true;
					app.errorMsg = data.data.message;
				}
			}
		});	
	};

	this.logout = function() {
		Auth.logout();
		$location.path('/logout');
		$timeout(function() {
			$location.path('/');
		},2000);
	};

});