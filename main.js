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
        	start: [ 1, 10 ],
        	step: 0.1,
            margin: 1,
            tooltips: [wNumb({ decimals: 1 }), wNumb({ decimals: 1 })],
        	behaviour: 'snap',
        	connect: true,
        	range: {
        		'min':  1,
        		'max':  10
        	},
        });

        noUiSlider.create(metacriticSlider, {
        	start: [ 0, 100 ],
        	step: 1,
            margin: 10,
        	behaviour: 'snap',
            tooltips: [wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
        	connect: true,
        	range: {
        		'min':  0,
        		'max':  100
        	}
        });

        noUiSlider.create(yearSlider, {
        	start: [ 1900, 2017 ],
        	step: 0.1,
            margin: 1,
        	behaviour: 'snap',
            tooltips: [wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
        	connect: true,
        	range: {
        		'min':  1900,
        		'max':  2017
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

    var addCard = function(item, id) {

            $('.flex-grid').append(
                `<div class="card" id="${id}" style="background-image: url(${item.Poster})">
                    <div class="card-menu" id="${id}">
                        <div class="info-button" id="${id}">more information</div>
                        <div class="card-trailer" id="${id}" style="background-image: url(${playButton})"></div>
                        <div class="ratings">
                            <img class="imdb-logo" src="${imdbLogo}"/><span class="imdb-rating">${item.imdbRating}</span>
                            <img class="metacritic-logo" src="${metacriticLogo}"/><span class="metacritic-rating">${item.Metascore}</span>
                        </div>
                    </div>
                </div>`);
            $('.card').find('.card-menu#' + id).css('display', 'none');
    };

    var handleCardMenuHover = function() {
        $('.flex-grid').on('mouseenter', '.card', function() {
            $(this).find('.card-menu').fadeIn(150);

        });

        $('.flex-grid').on('mouseleave', '.card', function() {
            $(this).find('.card-menu').fadeOut(150);
        });
    };

    var handleMoreInformationButton = function() {
        $('.flex-grid').on('click', '.info-button', function() {
            var itemId = $(this).attr('id');
            var item = info[itemId];
            $('.modal-container').find('.modal').append(
                `<div class="modal-image" style="background-image: url(${item.Poster})">
                    <div class="modal-trailer" id="${itemId}" style="background-image: url(${playButton})"></div>
                </div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <span class="modal-close-btn">&times;</span>
                            <h1>${item.Title}<span class="modal-year"> (${item.Year})</span></h2>
                            <h2>${item.Genre}</h3>
                        </div>

                        <div class="modal-plot">
                        <p>${item.Plot}</p>
                        </div>
                        <div class="modal-facts">

                        <p>Runtime: <span>${item.Runtime}</span></p>
                        <p>Director: <span>${item.Director}</span></p>
                        <p>Writer: <span>${item.Writer}</span></p>
                        <p>Actors: <span>${item.Actors}</span></p>
                        </div>

                        <div class="modal-footer">
                            <div class="modal-ratings">
                                <img src="${imdbLogo}"/><span class="modal-imdb-rating">${item.imdbRating}</span>
                                <img src="${metacriticLogo}"/><span class="modal-metacritic-rating">${item.Metascore}</span>
                            </div>
                        </div>
                    </div>
                    `);

            $('.modal-container').fadeIn(200, function() {
                $('card.menu #' + itemId).fadeOut(10);
                $(this).css('display', 'block');
            });
            modalOpen = true;
        });
    };

    var handleModalClosing = function() {
        $('.modal-container').on('click', '.modal-close-btn', function() {
            // $(this).parent().parent().parent().fadeOut();
            $(this).parent().parent().parent().parent().fadeOut(150, function() {
                $(this).css('display', 'none');
                $(this).children(':first').empty();
            });
        });
        $('.modal-container').on('click', function(e) {
                if (this === e.target) {
                    $(this).fadeOut(150, function() {
                        $(this).css('display', 'none');
                        $(this).children(':first').empty();
                    });
                }
        });
        modalOpen = false;
    };

    var displayTrailer = function() {
        $('.flex-grid').on('click', '.card-trailer', function() {
            $('.trailer').fadeIn();
            var id = $(this).attr('id');
            var youtubeId = info[id].Trailer.slice(-11);
            $('.trailer iframe').attr('src', 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1');
        });

        $('.modal-container').on('click', '.modal-trailer', function() {
            $('.trailer').fadeIn();
            var id = $(this).attr('id');
            var youtubeId = info[id].Trailer.slice(-11);
            $('.trailer iframe').attr('src', 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1');
        });
    };

    var handleTrailerCloseButton = function() {
        $('.trailer').on('click', '.trailer-close-btn', function() {
            $(this).parent().fadeOut();
            $(this).parent().find('iframe').attr('src', '');
        });
    };

    var loadMoreCardsOnScroll = function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            for (var i = numItems; i < numItems+amount; i++) {
                var item = info[i];
                addCard(item, i);

            }
            numItems += amount;
        }
    };
});
