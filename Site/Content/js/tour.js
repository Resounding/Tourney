define(['util'], function(Util) {
    var tour = new Tour();
    tour.addStep({
        element: '#game-container',
        content: $('.setup-tooltip').html(),
        title: 'Setup',
        placement: 'top',
        onHide: function() {
            $.post('/tours/log', { tourId: tour.tourId, step: 1 });
        }
    });
    tour.addStep({
        element: '.login',
        content: $('.login-tooltip').html(),
        title: 'Login',
        placement: 'bottom',
        onHide: function() {
            $.post('/tours/log', { tourId: tour.tourId, step: 2 });

            $('.login').replaceWith($('<span>you@example.com</span>'));
            
            var connectionId = 'chodgkinson@gmail.com';
            Util.cookies.setItem('connectionId', connectionId);
            tour.model.set({ connectionId: connectionId });
            tour.model.trigger('startScoring', tour.model.id);
        }
    });
    tour.addStep({
        element: '#game-container div.not-started-game:first',
        content: $('.scoring-tooltip').html(),
        title: 'Scoring',
        onHide: function() {
            $.post('/tours/log', { tourId: tour.tourId, step: 3 });

            tour.model.trigger('gameOn', tour.model.id);
        }
    });
    tour.addStep({
        element: '#game-container div:first',
        content: $('.game-on-tooltip').html(),
        title: 'Game On!',
        onHide: function() {
            $.post('/tours/log', { tourId: tour.tourId, step: 4 });
        }
    });

    return tour;
});