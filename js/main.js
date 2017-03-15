'use strict';

$(document).ready(function () {

    var imdbLogo = 'https://d2r1vs3d9006ap.cloudfront.net/public/uploaded_images/9999862/imdbsquarelogo_large.png',
        metacriticLogo = 'http://i.imgur.com/ThgZkgC.png',
        playButton = 'http://i.imgur.com/Mlij2TP.png',
        info = [],
        amount = 100,
        numItems = 0,
        modalOpen = false;

    $.getJSON("moviestrailers.json", function (json) {
        info = json.data;
        for (var i = 0; i < amount; i++) {
            var item = info[i];
            item.Genre = item.Genre.split(', ');
            addCard(item, i);
        }
        $('.spinner').css('display', 'flex');
        // console.log(info);

        var imdbSlider = document.getElementById('imdb-slider');
        var metacriticSlider = document.getElementById('metacritic-slider');
        var yearSlider = document.getElementById('year-slider');

        noUiSlider.create(imdbSlider, {
            start: [1, 10],
            step: 0.1,
            margin: 1,
            tooltips: [wNumb({ decimals: 1 }), wNumb({ decimals: 1 })],
            behaviour: 'snap',
            connect: true,
            range: {
                'min': 1,
                'max': 10
            }
        });

        noUiSlider.create(metacriticSlider, {
            start: [0, 100],
            step: 1,
            margin: 10,
            behaviour: 'snap',
            tooltips: [wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
            connect: true,
            range: {
                'min': 0,
                'max': 100
            }
        });

        noUiSlider.create(yearSlider, {
            start: [1900, 2017],
            step: 0.1,
            margin: 1,
            behaviour: 'snap',
            tooltips: [wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
            connect: true,
            range: {
                'min': 1900,
                'max': 2017
            }
        });

        numItems += amount;

        handleCardMenuHover();
        handleMoreInformationButton();
        handleModalClosing();
        displayTrailer();
        handleTrailerCloseButton();

        $(window).scroll(function () {
            loadMoreCardsOnScroll();
        });
    });

    var addCard = function addCard(item, id) {

        $('.flex-grid').append('<div class="card" id="' + id + '" style="background-image: url(' + item.Poster + ')">\n                    <div class="card-menu" id="' + id + '">\n                        <div class="info-button" id="' + id + '">more information</div>\n                        <div class="card-trailer" id="' + id + '" style="background-image: url(' + playButton + ')"></div>\n                        <div class="ratings">\n                            <img class="imdb-logo" src="' + imdbLogo + '"/><span class="imdb-rating">' + item.imdbRating + '</span>\n                            <img class="metacritic-logo" src="' + metacriticLogo + '"/><span class="metacritic-rating">' + item.Metascore + '</span>\n                        </div>\n                    </div>\n                </div>');
        $('.card').find('.card-menu#' + id).css('display', 'none');
    };

    var handleCardMenuHover = function handleCardMenuHover() {
        $('.flex-grid').on('mouseenter', '.card', function () {
            $(this).find('.card-menu').fadeIn(150);
        });

        $('.flex-grid').on('mouseleave', '.card', function () {
            $(this).find('.card-menu').fadeOut(150);
        });
    };

    var handleMoreInformationButton = function handleMoreInformationButton() {
        $('.flex-grid').on('click', '.info-button', function () {
            var itemId = $(this).attr('id');
            var item = info[itemId];
            $('.modal-container').find('.modal').append('<div class="modal-image" style="background-image: url(' + item.Poster + ')">\n                    <div class="modal-trailer" id="' + itemId + '" style="background-image: url(' + playButton + ')"></div>\n                </div>\n                    <div class="modal-content">\n                        <div class="modal-header">\n                            <span class="modal-close-btn">&times;</span>\n                            <h1>' + item.Title + '<span class="modal-year"> (' + item.Year + ')</span></h2>\n                            <h2>' + item.Genre + '</h3>\n                        </div>\n\n                        <div class="modal-plot">\n                        <p>' + item.Plot + '</p>\n                        </div>\n                        <div class="modal-facts">\n\n                        <p>Runtime: <span>' + item.Runtime + '</span></p>\n                        <p>Director: <span>' + item.Director + '</span></p>\n                        <p>Writer: <span>' + item.Writer + '</span></p>\n                        <p>Actors: <span>' + item.Actors + '</span></p>\n                        </div>\n\n                        <div class="modal-footer">\n                            <div class="modal-ratings">\n                                <img src="' + imdbLogo + '"/><span class="modal-imdb-rating">' + item.imdbRating + '</span>\n                                <img src="' + metacriticLogo + '"/><span class="modal-metacritic-rating">' + item.Metascore + '</span>\n                            </div>\n                        </div>\n                    </div>\n                    ');

            $('.modal-container').fadeIn(200, function () {
                $('card.menu #' + itemId).fadeOut(10);
                $(this).css('display', 'block');
            });
            modalOpen = true;
        });
    };

    var handleModalClosing = function handleModalClosing() {
        $('.modal-container').on('click', '.modal-close-btn', function () {
            // $(this).parent().parent().parent().fadeOut();
            $(this).parent().parent().parent().parent().fadeOut(150, function () {
                $(this).css('display', 'none');
                $(this).children(':first').empty();
            });
        });
        $('.modal-container').on('click', function (e) {
            if (this === e.target) {
                $(this).fadeOut(150, function () {
                    $(this).css('display', 'none');
                    $(this).children(':first').empty();
                });
            }
        });
        modalOpen = false;
    };

    var displayTrailer = function displayTrailer() {
        $('.flex-grid').on('click', '.card-trailer', function () {
            $('.trailer').fadeIn();
            var id = $(this).attr('id');
            var youtubeId = info[id].Trailer.slice(-11);
            $('.trailer iframe').attr('src', 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1');
        });

        $('.modal-container').on('click', '.modal-trailer', function () {
            $('.trailer').fadeIn();
            var id = $(this).attr('id');
            var youtubeId = info[id].Trailer.slice(-11);
            $('.trailer iframe').attr('src', 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1');
        });
    };

    var handleTrailerCloseButton = function handleTrailerCloseButton() {
        $('.trailer').on('click', '.trailer-close-btn', function () {
            $(this).parent().fadeOut();
            $(this).parent().find('iframe').attr('src', '');
        });
    };

    var loadMoreCardsOnScroll = function loadMoreCardsOnScroll() {
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            for (var i = numItems; i < numItems + amount; i++) {
                var item = info[i];
                addCard(item, i);
            }
            numItems += amount;
        }
    };
});