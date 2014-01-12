/*!
 * FM4cast - FM4 chromecast receiver/sender
 * http://sehaas.github.io/fm4cast
 *
 * Copyright 2013,2014 Sebastian Haas (sehaas@deebas.com)
 * Released under the MIT license
 *
 */

( function( $ ) {

	$.FM4Player = function(app_key, opt_conf) {
		this.app_key = app_key;
		this.receiverMap = {};
		this.receiverList = [];

		this.config = {
			debug : true,
		};

		$.extend(this.config, opt_conf);

		if (this.config.debug) {
			this.logger = console.log.bind(console);
		} else {
			this.logger = function() {};
		}

	};

	$.FM4Player.prototype = {

		init : function() {
			if (window.cast && window.cast.isAvailable) {
			// Already initialized
			this.initializeCastApi();
			} else {
				// Wait for API to post a message to us
				window.addEventListener("message", $.proxy(function(event) {
					if (event.source == window && event.data &&
						event.data.source == "CastApi" && event.data.event == "Hello") {
						this.initializeCastApi();
					}
				}, this));
			}
		},

		initializeCastApi : function() {
			this.castApi = new cast.Api();
			this.castApi.addReceiverListener(this.app_key, $.proxy(this.onReceiverList, this));
			this.logger("Cast Api initialized");
		},

		onReceiverList : function(list) {
			this.receiverMap = {};
			this.receiverList = list;

			var that = this;
			$.each(list, function(idx, val) {
				that.receiverMap[val.id] = val;
			});
			this.logger("update receiver list: " + list.length);
			$(this).trigger("cast-receiver-list", [list] );
		},

		connect : function(receiver) {
			var $this = $(this);
			var launchRequest = new cast.LaunchRequest(this.app_key, receiver);
			launchRequest.parameters = '';

			var that = this;
			this.castApi.launch(launchRequest, function(status) {
				if (status.status == 'running') {
					that.storeCurrentActivity(status.activityId);
					that.registerMediaStatus();
					that.logger('Activity successfull launched: ' + status.activityId);
				} else {
					that.logger('Launch failed: ' + status.errorString);
				}
			});
		},


		reconnect : function() {
			var curid = this.loadCurrentActivity();
			if (!curid) {
				return false;
			}

			var that = this;
			this.castApi.getActivityStatus(curid, function(status) {
				if (status.status === 'running') {
					that.registerMediaStatus();
					that.logger('Successfull reconnected to activity: ' + curid);
				} else {
					that.logger('Could not reconnect to activity: ' + curid);
				}
			});
		},


		disconnect : function() {
			var curid = this.loadCurrentActivity();
			if (!curid) {
				return false;
			}
			var that = this;
			this.castApi.stopActivity(curid, function(status) {
				if (status.status === 'stopped') {
					that.clearCurrentActivity();
					that.logger('Activity successfull stopped');
				} else {
					that.logger('A problem occurred while stopping activity. ' + status.errorString);
				}
			});
		},

		registerMediaStatus : function() {
			var that = this;
			this.castApi.addMediaStatusListener(this.currentActivity, function(status) {
				$(that).trigger("cast-media-player-status", status);
			});
			this.mediaStatusInterval = window.setInterval(function() {
				that.castApi.getMediaStatus(that.currentActivity, function(status) {
					$(that).trigger("cast-media-status-interval", status);
				});
			}, 5000);
		},

		play : function(seekOrUrl, opts) {
			var that = this;
			if (typeof(seekOrUrl) === "string") {
				var mediaurl = seekOrUrl;
				var loadRequest = new cast.MediaLoadRequest(mediaurl);
				loadRequest.autoplay = true;
				$.extend(loadRequest, opts);
				this.castApi.loadMedia(this.currentActivity, loadRequest, function(status) {
					$(that).trigger("cast-media-status", status);
				});
			} else {
				var playRequest = new cast.MediaPlayRequest(seekOrUrl);
				this.castApi.playMedia(this.currentActivity, playRequest, function(status){
					$(that).trigger("cast-media-status", status);
				});
			}
		},

		pause : function() {
			var that = this;
			this.castApi.pauseMedia(this.currentActivity, function(status){
				$(that).trigger("cast-media-status", status);
			});
		},

		storeCurrentActivity : function(id) {
			this.currentActivity = id;
			localStorage.setItem('player.currentActivity', id);
		},

		loadCurrentActivity : function() {
			this.currentActivity = localStorage.getItem('player.currentActivity');
			return this.currentActivity;
		},

		clearCurrentActivity : function() {
			this.currentActivity = null;
			return localStorage.removeItem('player.currentActivity');
		},

		getOnDemandShows : {
			'4HOPWed': 'House Of Pain',
			'4ULMon': 'Unlimited',
			'4ULTue': 'Unlimited',
			'4ULWed': 'Unlimited',
			'4ULThu': 'Unlimited',
			'4ULFri': 'Unlimited',
			'4SSUSun': 'Sunny Side Up',
			'4CHSat': 'Charts',
			'4ZSSun': 'Zimmerservice',
			'4JZFri': 'Jugend-Zimmer',
			'4DDSat': 'Davi Decks',
			'4ISSun': 'Im Sumpf',
			'4HEMon': 'Heartbeat',
			'4HSTue': 'High Spirits',
			'4TVThe': 'Tribe Vibes',
			'4SHFri': 'Salon Helga',
			'4GLSun': 'Graue Lagune',
			'4PHTue': 'Fivas Ponyhof',
			'4CZWed': 'Chez Hermez',
			'4BTThu': 'Bonustrack',
			'4PXFri': 'Project X',
			'4LBFri': 'La Boum de Luxe',
			'4SSSat': 'Swound Sound System',
			'4LRMon': 'Liquid Radio',
			'4DKMSun': 'Digital Konfusion',
			'4SOPMon': 'Soundpark',
			// '4UTAMon' : "Unter Tannen",
			// '4UTATue' : "Unter Tannen",
			// '4UTAWed' : "Unter Tannen",
			// '4UTAThu' : "Unter Tannen",
			// '4UTAFris' : "Unter Tannen",
			// '4DZWed' : Doppelzimmer,
		},

		getOnDemandInfo : function( key ) {
			var showurl = 'http://audioapi.orf.at/fm4/json/2.0/playlist/' + key;
			$.ajax({
				url : showurl,
				dataType : 'jsonp',
				cache : false,
				success : $.proxy(this._onDemandInfo, this)
			});
		},

		_onDemandInfo : function( response ) {
			console.log('http://loopstream01.apa.at/?channel=fm4&ua=flash&id=' + response.data.streams[0].loopStreamId);
		},

	};

}(jQuery));