/*!
 * FM4cast - FM4 chromecast receiver/sender
 * http://sehaas.github.io/fm4cast
 *
 * Copyright 2013,2014 Sebastian Haas (sehaas@deebas.com)
 * Released under the MIT license
 *
 */

;( function( $ ) {

	PlayList = function(opts) {
		this.map = {};
		this.children = {};
		this.parent = {};
		$.extend(this, opts);
	},

	PlayList.parse = function(json) {
		var data = JSON.parse(json);
		var parsed = {
			map : {},
			children : data.children,
			parent : data.parent,
		};
		$.each(data.map, function(idx, val){
			parsed.map[idx] = new $.CastMediaItem(val);
		});
		var pl = new PlayList(parsed);
		return pl;
	};

	PlayList.prototype = {
		add : function(elem, parent) {
			if (!elem || !elem.getUID()) return;
			this.map[elem.getUID()] = elem;
			if (parent) {
				this.parent[elem.getUID()] = parent.getUID();
				this.children[parent.getUID()].push(elem.getUID());
			} else {
				this.parent[elem.getUID()] = null;				
			}
			if (!this.children[elem.getUID()]) {
				this.children[elem.getUID()] = [];
			}
		},

		getElement : function(uid) {
			if (!uid) return null;
			return this.map[uid];
		},

		getParent : function(elem) {
			if (!elem) return null;
			var uid = "";
			if (typeof(elem) === "string") {
				uid = elem;
			} else if (!elem.getUID()) {
				return null;
			} else {
				uid = elem.getUID();
			}
			return this.parent[uid];
		},

		getChildren : function(elem) {
			if (!elem) return null;
			var uid = "";
			if (typeof(elem) === "string") {
				uid = elem;
			} else if (!elem.getUID()) {
				return null;
			} else {
				uid = elem.getUID();
			}
			return this.children[uid].map(this.getElement.bind(this));
		},

		stringify : function() {
			return JSON.stringify(this);
		},
	},

	$.FM4Sender = function() {
		this.playlist = new PlayList();
		this.liveStream = new $.CastMediaItem({
			title : "Radio FM4 Live Stream",
			src : "http://mp3stream1.apasf.apa.at:8000/;",
			imageUrl : "http://fm4.orf.at/v2static/images/fm4_logo.jpg",
			contentInfo: {
				uid : 'LiveStream',
				description : "fm4.ORF.at: Berichte und Kommentare zu Musik, Popkultur, Film, Literatur, Games und Politik.",
			},
		});
		this.ondemand = new $.CastMediaItem({
			title : "On Demand",
			imageUrl : "http://fm4.orf.at/v2static/images/fm4_logo.jpg",
			contentInfo: {
				uid : 'OnDemand',
				description : "Ausgew&auml;hlte Sendungen stehen f&uuml;r sieben Tage im Stream zur Verf&uuml;gung.",
			},
		});
		this.podcast = new $.CastMediaItem({
			title : "Podcast",
			imageUrl : "http://fm4.orf.at/v2static/images/fm4_logo.jpg",
			contentInfo: {
				uid : 'Podcast',
			},
		});

		this.playlist.add(this.liveStream);
		this.playlist.add(this.ondemand, this.liveStream);
		this.playlist.add(this.podcast, this.liveStream);
	};


	$.FM4Sender.prototype = {



		getOnDemandShows : [
			'4HOPWed',
			'4ULMon',
			'4ULTue',
			'4ULWed',
			'4ULThu',
			'4ULFri',
			'4SSUSun',
			'4CHSat',
			'4ZSSun',
			'4JZFri',
			'4DDSat',
			'4ISSun',
			'4HEMon',
			'4HSTue',
			'4TVThe',
			'4SHFri',
			'4GLSun',
			'4PHTue',
			'4CZWed',
			'4BTThu',
			'4PXFri',
			'4LBFri',
			'4SSSat',
			'4LRMon',
			'4DKMSun',
			'4SOPMon',
			'4EXTue',
			// '4UTAMon' ,
			// '4UTATue' ,
			// '4UTAWed' ,
			// '4UTAThu' ,
			// '4UTAFris' ,
			// '4DZWed' ,
		],

		getPodcasts : [
			"http://static.orf.at/podcast/fm4/fm4_interview_podcast.xml",
			"http://static.orf.at/podcast/fm4/FM4_Webtip.xml",
			"http://static.orf.at/podcast/fm4/fm4_reality_check_podcast.xml",
			"http://static.orf.at/podcast/fm4/fm4_musikerziehung.xml",
			"http://static.orf.at/podcast/fm4/fm4_ombudsmann.xml",
			"http://static.orf.at/podcast/fm4/fm4_science_busters.xml",
			"http://static.orf.at/podcast/fm4/FM4_Mit_Akzent.xml",
			"http://static.orf.at/podcast/fm4/FM4_Johanna_gefaellt_das_nicht.xml",
			"http://static.orf.at/podcast/fm4/fm4_projekt_x.xml",
			"http://static.orf.at/podcast/fm4/fm4_chez_hermes_extrawurscht.xml",
			//"http://static.orf.at/fm4/podcast/soundpark.xml",
			//"http://static.orf.at/fm4/podcast/fm4_comedy.xml",
		],

		getPodcastInfo : function(podcast) {
			var that = this;
			var pods = podcast;
			if (!(pods instanceof Array)) {
				pods = [pods];
			}
			this.pcToFetch = pods.length;
			$.each(pods, function(idx, val) {
				var url = "//ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=xml&q=" + val;
				$.ajax({
					url : url,
					dataType : 'jsonp',
					cache : false,
					success : $.proxy(that._onPodcastInfo, that),
					error : function() { that.pcToFetch--; },
				});
			});
		},

		_onPodcastInfo : function(response) {
			var that = this;
			var feed = $(response.responseData.xmlString);
			var title = $("channel>title", feed).text();
			if (!title) title = "";
			var pod = new $.CastMediaItem({
				title : title,
				contentInfo : {
					uid : title.replace(/\s+/g, ''),
					description : $("channel>description", feed).text(),
				},
			});
			this.playlist.add(pod, this.podcast);
			$.each($("channel>item", feed), function(idx, val) {
				var itm = new $.CastMediaItem({
					title : $("title", val).text(),
					src : $("enclosure", val).attr("url"),
					imageUrl : $("itunes\\:image", feed).attr("href"),
					contentInfo : {
						uid : $("guid", val).text(),
						description :  $("description", val).text(),
						date : moment($("pubdate", val).text()),
					}
				});
				that.playlist.add(itm, pod);
			});
			this.pcToFetch--;
			if (this.pcToFetch <= 0) {
				$(this).trigger("sender-new-content", this.playlist);
			}
		},

		getOnDemandInfo : function( key ) {
			var that = this;
			var showurl = '//audioapi.orf.at/fm4/json/2.0/playlist/' + key;
			$.ajax({
				url : showurl,
				dataType : 'jsonp',
				cache : false,
				success : $.proxy(that._onDemandInfo, that)
			});
		},

		_onDemandInfo : function( response ) {
			var that = this;
			var url = "http://loopstream01.apa.at/?channel=fm4&ua=flash&id=";
			var data = response.data;
			if (!(data instanceof Array)) {
				data = [data];
			}
			$.each(data, function(idx, val) {
				var description = "";
				if (val.subtitle) {
					description += val.subtitle + '\n';
				}

				if (val.description) {
					description += val.description;
				}
				var sendung = new $.CastMediaItem({
					title : val.title,
					contentInfo : {
						uid : val.alias,
						text : description,
						date : moment(val.dateISO),
					},
				});
				that.playlist.add(sendung, that.ondemand);
				$.each(val.streams, function(sidx, sval) {
					var time = moment(sval.startISO).format("HH:mm") + " - " +
						moment(sval.endISO).format("HH:mm");
					var stream = new $.CastMediaItem({
						title : time,
						src : url + sval.loopStreamId,
						contentInfo : {
							uid : sval.alias,
							description : description,
							date : moment(sval.startISO),
						}
					});
					that.playlist.add(stream, sendung);
				});
			});
			$(this).trigger("sender-new-content", this.playlist);
		},

	};

}(jQuery));


// helper function
if (!String.prototype.format) {
	String.prototype.format = String.prototype.f = function() {
		var s = this,
		i = arguments.length;

		while (i--) {
			s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
		}
		return s;
	};
}