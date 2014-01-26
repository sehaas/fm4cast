/*!
 * FM4cast - FM4 chromecast receiver/sender
 * http://sehaas.github.io/fm4cast
 *
 * Copyright 2013,2014 Sebastian Haas (sehaas@deebas.com)
 * Released under the MIT license
 *
 */

;( function( $ ) {

	$.CastMediaItem = function(opts) {
		this.autoplay = undefined;
		this.src = undefined;
		this.title = undefined;
		this.imageUrl = undefined,
		this.contentInfo = {
			uid : undefined,
			description : undefined,
			date : undefined,
		};
		$.extend(this, opts);
	};

	$.CastMediaItem.prototype= {
		getUID : function() {
			return this.contentInfo.uid;
		},

		data : function(){
			return {
				autoplay : this.autoplay,
				src : this.src,
				title : this.title,
				imageUrl : this.imageUrl,
				contentInfo : this.contentInfo,
			};
		}
	};

	$.CastPlayer = function(app_key, opt_conf) {
		this.app_key = app_key;
		this.receiverMap = {};
		this.receiverList = [];
		this.state = 0;

		this.config = {
			debug : true,
		};

		$.extend(this.config, opt_conf);

		if (this.config.debug) {
			this._logger = console.log.bind(console);
		} else {
			this._logger = $.noop;
		}

	};

	$.CastPlayer.prototype = {

		init : function(reconnect) {
			if (window.cast && window.cast.isAvailable) {
				// Already initialized
				this.initializeCastApi();
				if (reconnect) {
					this.reconnect();
				}
			} else {
				// Wait for API to post a message to us
				var that = this;
				window.addEventListener("message", function(event) {
					if (event.source == window && event.data &&
						event.data.source == "CastApi" && event.data.event == "Hello") {
						that.initializeCastApi();
						if (reconnect) {
							that.reconnect();
						}
					}
				});
			}
		},

		initializeCastApi : function() {
			this.castApi = new cast.Api();
			this.castApi.addReceiverListener(this.app_key, $.proxy(this.onReceiverList, this));
			this._logger("Cast Api initialized");
		},

		onReceiverList : function(list) {
			this.receiverMap = {};
			this.receiverList = list;

			var that = this;
			$.each(list, function(idx, val) {
				that.receiverMap[val.id] = val;
			});
			this._logger("update receiver list: " + list.length);
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
					that._registerMediaStatus();
					that._logger('Activity successfull launched: ' + status.activityId);
				} else {
					that._logger('Launch failed: ' + status.errorString);
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
					that._registerMediaStatus();
					that._logger('Successfull reconnected to activity: ' + curid);
				} else {
					that._logger('Could not reconnect to activity: ' + curid);
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
					that._logger('Activity successfull stopped');
				} else {
					that._logger('A problem occurred while stopping activity. ' + status.errorString);
				}
			});
		},

		_registerMediaStatus : function() {
			var that = this;
			this.castApi.getMediaStatus(this.currentActivity, this._handleMediaResult.bind(this));
			this.castApi.addMediaStatusListener(this.currentActivity, this._handleMediaPlayerStatus.bind(this));
			this.mediaStatusInterval = window.setInterval(function() {
				that.castApi.getMediaStatus(that.currentActivity, function(status) {
					$(that).trigger("cast-media-status-interval", status);
				});
			}, 5000);
		},

		play : function(seekOrUrl, opts) {
			if (!this.currentActivity) {
				return false;
			}
			var that = this;
			if (typeof(seekOrUrl) === "string") {
				var mediaurl = seekOrUrl;
				var loadRequest = new cast.MediaLoadRequest(mediaurl);
				loadRequest.autoplay = true;
				if (opts instanceof $.CastMediaItem) {
					$.extend(loadRequest, opts.data());
				} else {
					$.extend(loadRequest, opts);
				}
				this.castApi.loadMedia(this.currentActivity, loadRequest, this._handleMediaResult.bind(this));
			} else {
				var playRequest = new cast.MediaPlayRequest(seekOrUrl);
				this.castApi.playMedia(this.currentActivity, playRequest, this._handleMediaResult.bind(this));
			}
		},

		pause : function() {
			if (!this.currentActivity) {
				return false;
			}
			var that = this;
			this.castApi.pauseMedia(this.currentActivity, this._handleMediaResult.bind(this));
		},

		_handleMediaResult : function(status){
			this.state = status.status;
			$(this).trigger("cast-media-status", status);
		},

		_handleMediaPlayerStatus : function(status){
			this.state = status.state;
			$(this).trigger("cast-media-player-status", status);
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

	};

}(jQuery));