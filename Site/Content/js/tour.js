define({
    load: function(name, req, load, config) {
        req(['underscore', 'backbone', 'util'], 
            function (_, Backbone, Util) {
                req(['signalR', 'bootstrap-components'], function () {

                    var connection = $.connection('/tourgames');                

                    var tour = function (tourId, model, collection) {
                        this.tourId = tourId;
                        this.model = model;
                        this.collection = collection;

                        this.model.on('change:status', this.statusChangedHandler, this);
                        this.model.on('change:home change:visitor', this.scoreChangedHandler, this);
                    };
                    tour.prototype = {
                        start: function() {
                            this.getConnection().start();

                            this.showSetup();
                        },
                        getConnection: function () {
                            var cookie = Util.cookies.getItem('connectionId');

                            if (cookie) {
                                connection.id = this.connectionId = cookie;
                            }

                            return connection;
                        },
                        statusChangedHandler: function () {
                                
                            var that = this,
                                status = that.model.get('status');

                            if(status === 'inProgress') {
                                
                                $(document).on('click', '.popover button', function (e) {
                                    $.post('/tours/log', { tourId: that.tourId, step: 3 });

                                    $(document).off('click', '.popover button');

                                    $('.popover').hide();

                                    that.showGameOver();
                                });
                            // if the game's over, show the next step
                            } else if(status === 'done') {

                                $(document).off('click', '.popover button');

                                $('.popover').hide();

                                that.showFinal();
                            }     
                        },
                        scoreChangedHandler: function() {

                            var home = this.model.get('home'),
                                visitor = this.model.get('visitor');

                            if(home.score || visitor.score) {

                                this.model.off('change:home change:visitor', this.scoreChangedHandler);

                                $.post('/tours/log', { tourId: this.tourId, step: 3 });

                                $(document).off('click', '.popover button');
                            
                                $('.popover').hide();

                                this.showGameOver();
                            }
                        },
                        showSetup: function() {
                            var that = this,
                                $elmt = $('#game-container'),
                                $content = $('.setup-tooltip');
                            $elmt.popover({
                                title: 'Setup',
                                content: $content.html(),
                                placement: 'top',
                                trigger: 'manual'
                            });
            
                            $(document).on('click', '.popover button', function(e) {
                                $.post('/tours/log', { tourId: that.tourId, step: 1 });
                                $(document).off('click', '.popover button');

                                $elmt.popover('hide');
                                that.showLogin();
                            });
                        
                            $elmt.popover('show');
                        },
                        showLogin: function() {
                            var that = this,
                                $elmt = $('.login'),
                                $content = $('.login-tooltip');
                            $elmt
                                .click(function(e) {
                                    e.preventDefault();
                                })
                                .popover({
                                    title: 'Login',
                                    content: $content.html(),
                                    placement: 'left',
                                    trigger: 'manual'
                                });

                            $(document).on('click', '.popover button', function (e) {
                                $.post('/tours/log', { tourId: that.tourId, step: 2 });
                                $elmt.text('you@example.com').unbind();

                                $(document).off('click', '.popover button');

                                $elmt.popover('hide');
                                that.showScoring();                                

                                var connectionId = 'chodgkinson@gmail.com';
                                Util.cookies.setItem('connectionId', connectionId);
                                that.model.set({ connectionId: connectionId });
                                that.model.trigger('startScoring', that.model.id);
                            });

                            $elmt.popover('show');
                        },
                        showScoring: function() {
                            var that = this,
                                $elmt = $('.active-game'),
                                $content = $('.scoring-tooltip');
                            $elmt.popover({
                                title: 'Scoring',
                                content: $content.html(),
                                placement: 'right',
                                trigger: 'manual'
                            });                            

                            $elmt.popover('show');
                            setTimeout(function() {
                                $('.nophone').css('visibility', 'visible');
                                $(document).on('click', '.nophone button', function(e) {
                                    e.preventDefault();
                                    window.open('http://tourney.resounding.ca/tours/mobile/?tourId=' + that.tourId, 'phoneAlternative',
                                        'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,width=480;height=600');
                                });
                            }, 3000);
                        },
                        showGameOver: function() {
                            var that = this,
                                $elmt = $('.active-game table'),
                                $content = $('.game-on-tooltip');
                            $elmt.popover({
                                title: 'Game On!',
                                content: $content.html(),
                                placement: 'right',
                                trigger: 'manual'
                            });

                            $(document).on('click', '.popover button', function (e) {
                                $.post('/tours/log', { tourId: that.tourId, step: 4 });

                                $elmt.popover('hide');
                                that.showFinal();
                            });

                            $elmt.popover('show');
                        },
                        showFinal: function() {
                            var that = this,
                                $elmt = $('.game-over-tooltip');

                            $(document).on('submit', 'form', function(e) {
                                e.preventDefault();

                                var email = $('#email').val(),
                                    comments = $('#comments').val();

                                $.post('/tours/email', { email: email, comments: comments });
                                $elmt.modal('hide');
                            });

                            $elmt.modal({ keyboard: false, backdrop: 'static' });
                        }
                    };

                load(tour);
            });
        });
    }
});