$(document).ready(function() {
    gapi.hangout.render('hangout-button', {
        'render': 'createhangout',
        'initial_apps': [{'app_id' : '547143173876', 'app_type' : 'ROOM_APP' }]
    });

    $('.nav-link').click(function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#'+$(e.target).data('target')).offset().top
        }, 500);
    });
});
