define({
    load: function(name, req, load, config) {
        req(['underscore', 'backbone', 'util', 'text!../html/tourTemplates.html', 'tour', 'domReady!'], 
            function (_, Backbone, Util, templates, tour) {
            req(['signalR', 'bootstrap-modal', 'jqr'], function () {
                var $templates = $(templates);

                var Game = Backbone.Model.extend({
                    initialize: function() {
                        
                    },
                    canScore: function () {
                        return !(this.get('scorer')) && this.get('connectionId');
                    },
                    title: function () {
                        var text = 'Game #1',
                            status = this.get('status');
                        if (status === 'inProgress') text += ' (in progress)';
                        if (status === 'done') text += ' (complete)';

                        return text;
                    }
                });

                var GameCollection = Backbone.Collection.extend({
                    model: Game,
                    initialize: function () {
                        var that = this,
                            connection = $.connection('/tourgames'),
                            getConnection = function () {
                                var cookie = Util.cookies.getItem('connectionId');

                                if (cookie) {
                                    connection.id = that.connectionId = cookie;
                                }

                                return connection;
                            };

                        getConnection().start();

                        that.on('gameOn', function (id) {
                            var game = that.get(id);
                            if (game) {
                                var action = { gameId: id, action: 'gameOn' };
                                getConnection().send(JSON.stringify(action));
                            }
                        });

                        that.on('startScoring', function (id) {
                            var game = that.get(id);
                            if (game) {
                                var action = { gameId: id, action: 'startScoring' };
                                getConnection().send(JSON.stringify(action));
                            }
                        });

                        that.on('homeScore', function (id) {
                            var action = { gameId: id, action: 'homeScore' };
                            getConnection().send(JSON.stringify(action));
                        });

                        that.on('visitorScore', function (id) {
                            var action = { gameId: id, action: 'visitorScore' };
                            getConnection().send(JSON.stringify(action));
                        });

                        connection.received(function (game) {
                            var model = that.get(game.id);
                            if (model) {
                                model.set(game);
                            }
                        });
                    },
                    fetch: function () {
                        var that = this;
                        $.ajax('/api/tourgames/?tourId=' + that.tourId, {
                            success: function (game) {
                                that.add(game);
                            }
                        });
                    }
                });

                var GameView = Backbone.View.extend({
                    initialize: function () {
                        this.createTemplates();
                        this.model.on('change', this.render, this);
                        this.model.on('remove', this.remove, this);
                    },
                    createTemplates: function () {
                        this.templates = {
                            notStarted: $templates.find('#not-started-game-template').html(),
                            inProgress: $templates.find('#in-progress-game-template').html(),
                            done: $templates.find('#done-game-template').html()
                        }
                    },
                    render: function () {
                        var status = this.model.get('status'),
                            template = this.templates[status],
                            html = _.template(template, this.model),
                            prevElement;

                        if (this.$el.closest('html').length) {
                            prevElement = this.$el;
                        }

                        this.setElement(html);

                        if (prevElement) {
                            prevElement.replaceWith(this.$el);
                        }

                        return this;
                    },
                    remove: function () {
                        this.$el.remove();
                    }
                });

                var TourneyView = Backbone.View.extend({
                    el: '#game-container',
                    initialize: function (options) {
                        this.tourId = options.tourId;
                        var collection = this.collection = new GameCollection();
                        collection.tourId = options.tourId;
                        collection.on('add', this.addOne, this);
                        collection.fetch();

                        $('.welcome a.btn').click(function(e) {
                            $.post('/tours/log', { tourId: options.tourId, step: 0 });

                            tour.model = collection.at(0);
                            tour.tourId = options.tourId;
                            tour.restart(true);
                        });

                        $('.welcome').modal({ keyboard: false, backdrop: 'static' });
                    },
                    addOne: function (game) {
                        var view = new GameView({ model: game });
                        var el = view.render().$el;
                        $('.game1').replaceWith(el);
                    }
                });

                load(TourneyView);
            });
        });
    }
});