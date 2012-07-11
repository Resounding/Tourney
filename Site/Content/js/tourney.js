require(['underscore', 'backbone', 'text!../html/gameTemplates.html', 'domReady!'], function(_, Backbone, templates) {
    require(['signalR'], function() {
        var $templates = $(templates);

        var Guid = function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        };

        var docCookies = {
            getItem: function (sKey) {
                if (!sKey || !this.hasItem(sKey)) { return null; }
                return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
            },
            /** 
            * docCookies.setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure) 
            * 
            * @argument sKey (String): the name of the cookie; 
            * @argument sValue (String): the value of the cookie; 
            * @optional argument vEnd (Number, String, Date Object or null): the max-age in seconds (e.g., 31536e3 for a year) or the 
            *  expires date in GMTString format or in Date Object format; if not specified it will expire at the end of session;  
            * @optional argument sPath (String or null): e.g., "/", "/mydir"; if not specified, defaults to the current path of the current document location; 
            * @optional argument sDomain (String or null): e.g., "example.com", ".example.com" (includes all subdomains) or "subdomain.example.com"; if not 
            * specified, defaults to the host portion of the current document location; 
            * @optional argument bSecure (Boolean or null): cookie will be transmitted only over secure protocol as https; 
            * @return undefined; 
            **/
            setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
                if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/.test(sKey)) { return; }
                var sExpires = "";
                if (vEnd) {
                    switch (typeof vEnd) {
                        case "number": sExpires = "; max-age=" + vEnd; break;
                        case "string": sExpires = "; expires=" + vEnd; break;
                        case "object": if (vEnd.hasOwnProperty("toGMTString")) { sExpires = "; expires=" + vEnd.toGMTString(); } break;
                    }
                }
                document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            },
            removeItem: function (sKey) {
                if (!sKey || !this.hasItem(sKey)) { return; }
                var oExpDate = new Date();
                oExpDate.setDate(oExpDate.getDate() - 1);
                document.cookie = escape(sKey) + "=; expires=" + oExpDate.toGMTString() + "; path=/";
            },
            hasItem: function (sKey) { return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie); }
        };  

        _.templateSettings = {
            interpolate: /\{\{=(.+?)\}\}/g,
            evaluate: /\{\{(.+?)\}\}/g
        };

        var Game = Backbone.Model.extend({
            canScore: function() {
                return !(this.get('scorer')) && this.get('connectionId');
            },
            leader: function() {
                var home = this.get('home'),
                    visitor = this.get('visitor');

                return visitor.score > home.score ? visitor : home;
            },
            trailer: function() {
                var home = this.get('home'),
                    visitor = this.get('visitor');

                return home.score < visitor.score ? home : visitor;
            },
            title: function() {
                var text = 'Game #' + this.id,
                    status = this.get('status');
                if(status === 'inProgress') text += ' (in progress)';
                if(status === 'done') text += ' (complete)';

                return text;
            },
            info: function() {
                var status = this.get('status'),
                    home = this.get('home'),
                    visitor = this.get('visitor'),
                    leader = this.leader(),
                    trailer = this.trailer(),
                    text;

                switch(status) {
                    case 'inProgress':
                        text = _.template('{{= leader.team }}: {{= leader.score }}, ' +
                            '{{= trailer.team }}: {{= trailer.score }}',
                            { leader: leader, trailer: trailer });
                        break;
                    case 'done':
                        text = _.template('{{= leader.team }} defeated {{= trailer.team }} ' +
                            '{{= leader.score }}-{{= trailer.score }}',
                            { leader: leader, trailer: trailer });
                        break;
                    default:
                        text = '{{= home.team }} vs. {{= visitor.team }}';
                }

                return _.template(text, this.attributes);
            }
        });

        var GameCollection = Backbone.Collection.extend({
            model: Game,
            initialize: function() {
                var that = this,
                    connection = $.connection('/games'),
                    getConnection = function() {
                        var cookie = docCookies.getItem('connectionId');

                        if (cookie) {
                            connection.id = that.connectionId = cookie;
                        }

                        return connection;
                    };

                getConnection().start();  
                
                that.on('reset:tournament', function() {
                    $.post('api/games/reset', function() {
                        that.fetch();
                    });
                });                  

                that.on('gameOn', function(id) {
                    var game = that.get(id);
                    if(game) {
                        var action = { gameId: id, action: 'gameOn' };
                        getConnection().send(JSON.stringify(action));
                    }
                });

                that.on('startScoring', function(id) {
                    var game = that.get(id);
                    if (game) {
                        var action = { gameId: id, action: 'startScoring' };
                        getConnection().send(JSON.stringify(action));
                    }
                });

                that.on('homeScore', function(id) {
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
            fetch: function() {
                var that = this;
                $.ajax('/api/games', {
                    success: function(games) {
                        that.remove(that.models);

                        _.forEach(games, function(game) {
                            that.add(game.Value);
                        })
                    }
                });
            }
        });

        var GameView = Backbone.View.extend({
            initialize: function() {
                this.createTemplates();
                this.model.on('change:scorer change:status change:home change:visitor change:connectionId', this.render, this); 
                this.model.on('remove', this.remove, this);           
            },
            createTemplates: function() {
                this.templates = {
                    notStarted: $templates.find('#not-started-game-template').html(),
                    inProgress: $templates.find('#in-progress-game-template').html(),
                    done: $templates.find('#done-game-template').html()
                }
            },
            render: function() {
                var status = this.model.get('status'),
                    template = this.templates[status],
                    html = _.template(template, this.model),
                    prevElement;

                if(this.$el.closest('html').length) {
                    prevElement = this.$el;
                }

                this.setElement(html);

                var that = this;
                this.$('button.home').click(function(e) {
                    that.model.trigger('homeScore', that.model.id);
                });
                this.$('button.visitor').click(function(e) {
                    that.model.trigger('visitorScore', that.model.id);
                });
                this.$('button.gameOn').click(function(e) {
                    that.model.trigger('gameOn', that.model.id);
                });

                this.$('button.startScoring').click(function(e) {
                    that.model.trigger('startScoring', that.model.id);
                });

                if(prevElement) {
                    prevElement.replaceWith(this.$el);
                }

                return this;
            },
            remove: function() {
                this.$el.remove();
            }
        });

        var TourneyView = Backbone.View.extend({
            el: '#game-container',
            initialize: function() {
                var collection = this.collection = new GameCollection();
                collection.on('add', this.addOne, this);
                collection.fetch();

                $('.login').click(function (e) {
                    e.preventDefault();
                    var connectionId = 'chodgkinson@gmail.com';
                    docCookies.setItem('connectionId', connectionId);
                    collection.invoke('set', { connectionId: connectionId });
                });

                $('.reset').click(function(e) {
                    if(!confirm('Are you sure you want to reset the Tournament?')) return;

                    collection.trigger('reset:tournament');
                });
            },
            addOne: function(game) {
                var view = new GameView({ model: game });
                var el = view.render().el;
                this.$el.append(el);
            }
        });

        new TourneyView();
    });
});