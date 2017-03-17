'use strict';

$(document).ready(function () {

    var imdbLogo = 'https://d2r1vs3d9006ap.cloudfront.net/public/uploaded_images/9999862/imdbsquarelogo_large.png',
        metacriticLogo = 'http://i.imgur.com/ThgZkgC.png',
        playButton = 'http://i.imgur.com/Mlij2TP.png',
        fullList = [],
        filteredList = [],
        filters = {},
        amount = 30,
        numItems = 0;

    $.getJSON("items.json", function (json) {
        fullList = json.items;
        filteredList = json.items;

        cleanUpItemsList();
        filterItems(filters);
        sortItems('Title');

        loadItems();

        $('.spinner').css('display', 'flex');

        handleSliders();
        handleCardMenuHover();
        handleMoreInformationButton();
        handleModalClosing();
        displayTrailer();
        handleTrailerCloseButton();

        $(window).scroll(function () {
            loadMoreCardsOnScroll();
        });
    });

    var updateResults = function updateResults() {
        filterItems(filters);
        $('.flex-grid').empty();
        $('.flex-grid').animate({ scrollTop: 0 });
        $('.search-result-info h1').empty().append(filteredList.length + ' search results');
        numItems = 0;
        console.log(filteredList.length);
        if (filteredList.length !== 0) {
            loadItems();
        }
    };

    var cleanUpItemsList = function cleanUpItemsList() {
        for (var i = 0; i < fullList.length; i++) {
            var item = fullList[i];
            item.Genre = item.Genre.split(',');
            item.Language = item.Language.split(',');
            item.Director = item.Director.split(',');
            item.Writer = item.Writer.split(',');
            for (var j = 0; j < item.Writer.length; j++) {
                if (item.Writer[j].indexOf('(') >= 0) {
                    item.Writer[j] = item.Writer[j].substring(0, item.Writer[j].indexOf('('));
                    item.Writer[j] = item.Writer[j].substring(0, item.Writer[j].length - 1);
                }
            }
            item.Actors = item.Actors.split(',');
            item.imdbRating = parseInt(parseFloat(item.imdbRating).toFixed(1) * 10);
            item.Metascore = parseInt(item.Metascore);
            item.Year = parseInt(item.Year);
            item.Runtime = item.Runtime.substring(0, item.Runtime.indexOf('m'));
            item.Runtime = item.Runtime.substring(0, item.Runtime.length - 1);
            item.Runtime = parseInt(item.Runtime);
        }
    };

    var sortItems = function sortItems(sortParameter) {
        if (sortParameter === 'Title') {
            filteredList.sort(function (a, b) {
                var titleA = a.Title.toUpperCase();
                var titleB = b.Title.toUpperCase();
                if (titleA < titleB) return -1;
                if (titleA > titleB) return 1;
                return 0;
            });
            return;
        }

        filteredList.sort(function (a, b) {
            if (isNaN(a[sortParameter])) return 1;
            if (isNaN(b[sortParameter])) return -1;
            return b[sortParameter] - a[sortParameter];
        });
    };

    var hasGenre = function hasGenre(genre, item) {
        if (item.Genre.indexOf(genre) > -1) return true;
        return false;
    };

    var filterItems = function filterItems(filters) {
        if ($.isEmptyObject(filters)) {
            return;
        }
        var newList = [];
        for (var i = 0; i < fullList.length; i++) {
            var item = fullList[i];
            var filtered = false;
            if (hasGenre('Documentary', item)) filtered = true;
            if (hasGenre('Short', item)) filtered = true;
            if (item.imdbRating < filters.imdb[0] || item.imdbRating > filters.imdb[1]) filtered = true;
            if (item.Metascore < filters.metacritic[0] || item.Metascore > filters.metacritic[1]) filtered = true;
            if (isNaN(item.Metascore) && (filters.metacritic[0] > 0 || filters.metacritic[1] < 2017)) filtered = true;
            if (item.Year < filters.year[0] || item.Year > filters.year[1]) filtered = true;
            if (filtered === false) newList.push(fullList[i]);
        }
        filteredList = newList;
    };

    var handleSliders = function handleSliders() {
        var imdbSlider = document.getElementById('imdb-slider');
        var metacriticSlider = document.getElementById('metacritic-slider');
        var yearSlider = document.getElementById('year-slider');

        noUiSlider.create(imdbSlider, {
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
            step: 1,
            margin: 1,
            behaviour: 'snap',
            tooltips: [wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
            connect: true,
            range: {
                'min': 1900,
                'max': 2017
            }
        });

        var updateFilters = function updateFilters() {
            filters = {
                imdb: imdbSlider.noUiSlider.get(),
                metacritic: metacriticSlider.noUiSlider.get(),
                year: yearSlider.noUiSlider.get()
            };
        };

        imdbSlider.noUiSlider.on('end', function () {
            updateFilters();
            updateResults();
        });

        metacriticSlider.noUiSlider.on('end', function () {
            updateFilters();
            updateResults();
        });

        yearSlider.noUiSlider.on('end', function () {
            updateFilters();
            updateResults();
        });
    };

    var addCard = function addCard(item, id) {
        var maxLength = 4;
        if (item.Writer.length > maxLength) item.Writer.splice(-(item.Writer.length - maxLength));
        if (item.Director.length > maxLength) item.Director.splice(-(item.Director.length - maxLength));

        $('.flex-grid').append('<div class="card" id="' + id + '" style="background-image: url(' + item.Poster + ')">\n                    <div class="card-menu" id="' + id + '">\n                        <div class="info-button" id="' + id + '">more information</div>\n                        <div class="card-trailer" id="' + id + '" style="background-image: url(' + playButton + ')"></div>\n                        <div class="ratings">\n                            <img class="imdb-logo" src="' + imdbLogo + '"/><span class="imdb-rating">' + item.imdbRating + '</span>\n                        </div>\n                    </div>\n                </div>');
        if (!isNaN(item.Metascore)) {
            $('.card').find('.card-menu#' + id + ' .ratings').append('<img class="metacritic-logo" src="' + metacriticLogo + '"/><span class="metacritic-rating">' + item.Metascore + '</span>');
            $('.card').find('.card-menu#' + id + ' .imdb-rating').css('margin-right', '2rem');
        }
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
            var item = filteredList[itemId];
            $('.modal-container').find('.modal').append('<div class="modal-image" style="background-image: url(' + item.Poster + ')">\n                    <div class="modal-trailer" id="' + itemId + '" style="background-image: url(' + playButton + ')"></div>\n                </div>\n                    <div class="modal-content" id="' + itemId + '">\n                        <div class="modal-header">\n                            <span class="modal-close-btn">&times;</span>\n                            <h1>' + item.Title + '<span class="modal-year"> (' + item.Year + ')</span></h2>\n                            <h2>' + item.Genre + '</h3>\n                        </div>\n\n                        <div class="modal-plot">\n                        <p>' + item.Plot + '</p>\n                        </div>\n                        <div class="modal-facts">\n\n                        <p>Runtime: <span>' + item.Runtime + ' min</span></p>\n                        <p>Director: <span>' + item.Director + '</span></p>\n                        <p>Writer: <span>' + item.Writer + '</span></p>\n                        <p>Actors: <span>' + item.Actors + '</span></p>\n                        </div>\n\n                        <div class="modal-footer">\n                            <div class="modal-ratings">\n                                <img src="' + imdbLogo + '"/><span class="modal-imdb-rating">' + item.imdbRating + '</span>\n                            </div>\n                        </div>\n                    </div>\n            ');

            if (!isNaN(item.Metascore)) {
                $('.modal-container').find('.modal-content#' + itemId + ' .modal-ratings').append('<img src="' + metacriticLogo + '"/><span class="modal-metacritic-rating">' + item.Metascore + '</span>');
            }

            $('.modal-container').fadeIn(200, function () {
                $('card.menu #' + itemId).fadeOut(10);
                $(this).css('display', 'block');
            });
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
    };

    var displayTrailer = function displayTrailer() {
        $('.flex-grid').on('click', '.card-trailer', function () {
            $('.trailer').fadeIn();
            var id = $(this).attr('id');

            // $('.trailer iframe').attr('src', info[id].Trailer);
            $('.trailer iframe').attr('src', 'https://www.youtube.com/embed/3eRBFkxgG7g?autoplay=1');
        });

        $('.modal-container').on('click', '.modal-trailer', function () {
            $('.trailer').fadeIn();
            var id = $(this).attr('id');
            // $('.trailer iframe').attr('src', info[id].Trailer);
            $('.trailer iframe').attr('src', 'https://www.youtube.com/embed/3eRBFkxgG7g?autoplay=1');
        });
    };

    var handleTrailerCloseButton = function handleTrailerCloseButton() {
        $('.trailer').on('click', '.trailer-close-btn', function () {
            $(this).parent().fadeOut();
            $(this).parent().find('iframe').attr('src', '');
        });
    };

    var loadItems = function loadItems() {
        var amnt = amount;
        if (amount >= filteredList.length) amnt = filteredList.length;
        if (numItems >= filteredList.length) return;
        for (var i = numItems; i < numItems + amnt; i++) {
            var item = filteredList[i];
            addCard(item, i);
        }
        numItems += amnt;
    };

    var loadMoreCardsOnScroll = function loadMoreCardsOnScroll() {
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            loadItems();
        }
    };
});