define({
    load: function(name, req, load, config) {
        req(['underscore', 'backbone', 'util', 'text!../html/tourTemplates.html', 'tour', 'domReady!'], 
            function (_, Backbone, Util, templates, tour) {
            req(['signalR', 'bootstrap-components'], function () {
                var $templates = $(templates);

                var view = Backbone.View.extend({
                    el: document.body,
                    events: {
                        'click .home button': 'homeScore',
                        'click .visitor button': 'visitorScore',
                        'click a.gameOver': 'gameOver'
                    },
                    initialize: function(attr) {
                        this.model = new Backbone.Model(attr);
                        this.setupConnection();

                        var $elmt = $('table.mobile'),
                                $content = $('.tooltip-scoring');

                        $elmt.popover({
                            title: 'Scoring',
                            content: $content.html(),
                            placement: 'bottom',
                            trigger: 'manual'
                        });

                        $elmt.popover('show');
                    },
                    setupConnection: function() {
                        var gameId = this.model.get('gameId'),
                            connection = $.connection('/tourgames'),
                            getConnection = this.getConnection = function () {
                                connection.connectionId = 'chodgkinson@gmail.com';
                                return connection;
                            };

                        getConnection().start();

                        var interval = setInterval(function() {
                            var states = $.signalR.connectionState;
                            if(connection.state === states.connected) {
                                action = { gameId: gameId, action: 'gameOn' };
                                getConnection().send(JSON.stringify(action));
                                clearInterval(interval);
                            }
                        }, 100);

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
                    gameOver: function() {
                        var id = this.model.get('gameId'),
                            action = { gameId: id, action: 'gameOver' };
                        this.getConnection().send(JSON.stringify(action));
                    },
                    dataReceived: function(game) {
                        this.$('.home p.lead').html(game.home.score);
                        this.$('.visitor p.lead').html(game.visitor.score);

                        if(game.home.score + game.visitor.score === 1) {

                            $('.popover').hide();

                            var $elmt = $('a.gameOver'),
                                $content = $('.tooltip-game-over');

                            $elmt.popover({
                                title: 'Finishing the Game',
                                content: $content.html(),
                                placement: 'top',
                                trigger: 'manual'
                            });

                            $elmt.popover('show');
                        }
                    }
                });

                load(view);
            });
        });
    }
});