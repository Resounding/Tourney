define({
    load: function(name, req, load, config) {
        req(['underscore', 'backbone', 'util', 'text!../html/tourTemplates.html', 'tour', 'domReady!'], 
            function (_, Backbone, Util, templates, tour) {
            req(['signalR', 'bootstrap-modal', 'jqr'], function () {
                var $templates = $(templates);                

                var view = Backbone.View.extend({
                    el: document.body,
                    events: {
                        'click .home button': 'homeScore',
                        'click .visitor button': 'visitorScore'
                    },
                    initialize: function(attr) {
                        this.model = new Backbone.Model(attr);
                        this.setupConnection();
                    },
                    setupConnection: function() {
                        var gameId = this.model.get('gameId'),
                            connection = $.connection('/tourgames'),
                            getConnection = this.getConnection = function () {
                                connection.connectionId = 'chodgkinson@gmail.com';
                                return connection;
                            };

                        getConnection().start();

                        getConnection().stateChanged(function (cn, d) {
                            var states = $.signalR.connectionState;
                            if (cn.oldState === states.connected &&
                                connection.state == states.connected) {
                                getConnection().send('startScoring', gameId);
                            }
                        });

                        getConnection().received(_.bind(this.dataReceived, this));                        
                    },
                    homeScore: function() {
                        var id = this.model.get('gameId'),
                            action = { gameId: id, action: 'homeScore' };
                        this.getConnection().send(JSON.stringify(action));
                    },
                    visitorScore: function() {
                        var id = this.model.get('gameId'),
                            action = { gameId: id, action: 'visitorScore' };
                        this.getConnection().send(JSON.stringify(action));
                    },
                    dataReceived: function(game) {
                        this.$('.home p.lead').html(game.home.score);
                        this.$('.visitor p.lead').html(game.visitor.score);
                    }
                });

                load(view);
            });
        });
    }
});