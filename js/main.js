'use strict';

$('.modal-container').css('display', 'none');

$(document).ready(function () {

    var imdbLogo = 'https://d2r1vs3d9006ap.cloudfront.net/public/uploaded_images/9999862/imdbsquarelogo_large.png',
        metacriticLogo = 'http://i.imgur.com/ThgZkgC.png',
        rottenTomatoesLogo = 'http://i.imgur.com/PbOAh0i.png',
        playButton = 'http://i.imgur.com/Mlij2TP.png',
        fullList = [],
        filteredList = [],
        result = [],
        contentType = 'Everything',
        sortOption = 'imdbRating',
        mustContainGenres = [],
        cantContainGenres = ['Documentary', 'Short', 'Animation'],
        filters = {
        imdb: [0, 100],
        metacritic: [0, 100],
        tomatometer: [0, 100],
        year: [1900, 2017]
    },
        amount = 25,
        numItems = 0;

    $.getJSON("test.json", function (json) {

        fullList = json.items;
        filteredList = json.items;

        cleanUpItemsList();
        filterItems(filters);
        loadItems();
        $('.spinner').css('display', 'flex');

        handleFilterClosing();
        handleSliders();
        handleCardMenuHover();
        handleMoreInformationButton();
        handleModalClosing();
        displayTrailer();
        handleTrailerCloseButton();
        handleSearchBar();
        loadMoreCardsOnScroll();
        handleGenreButtons();
        handleContentTypeFiltering();
        handleSortOptions();
    });

    var handleContentTypeFiltering = function handleContentTypeFiltering() {
        $('.content-type .radiobutton').on('click', function (e) {
            if (!$(this).hasClass('radiobutton-selected')) {
                $(this).parent().find('.radiobutton-selected').removeClass('radiobutton-selected');
                $(this).addClass('radiobutton-selected');
                contentType = $(this).text();
            }
            e.stopPropagation();
            updateResults();
        });
    };

    var handleSortOptions = function handleSortOptions() {
        $('.sort-options .radiobutton').on('click', function (e) {
            if (!$(this).hasClass('radiobutton-selected')) {
                $(this).parent().find('.radiobutton-selected').removeClass('radiobutton-selected');
                $(this).addClass('radiobutton-selected');
                sortOption = $(this).attr('id');
            }
            e.stopPropagation();
            updateResults();
        });
    };

    var handleGenreButtons = function handleGenreButtons() {
        $('.checkbox').on('click', function (e) {
            if ($(this).hasClass('checkbox-deselected')) {
                $(this).removeClass('checkbox-deselected');
            } else if ($(this).hasClass('checkbox-selected')) {
                $(this).removeClass('checkbox-selected');
                $(this).addClass('checkbox-deselected');
            } else {
                $(this).addClass('checkbox-selected');
            }
            e.stopPropagation();
            updateResults();
        });
    };

    var handleSearchBar = function handleSearchBar() {
        $('.search-bar').on('input', function () {
            filteredList = fullList;
            var options = {
                shouldSort: true,
                threshold: 0.3,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: ['Title', 'Actors']
            };
            var fuse = new Fuse(filteredList, options);
            result = fuse.search($(this).val());
            if ($.trim($(this).val()).length > 0) {
                updateResults();
            }
        });

        $('.search-bar').keyup(function () {
            if (!$(this).val()) {
                updateResults();
            }
        });
    };

    var hasGenre = function hasGenre(genre, item) {
        if (item.Genre.indexOf(genre) > -1) return true;
        return false;
    };

    var updateGenreFilterLists = function updateGenreFilterLists() {
        mustContainGenres = [];
        cantContainGenres = [];
        $('.checkbox-selected').each(function () {
            mustContainGenres.push($(this).text());
        });
        $('.checkbox-deselected').each(function () {
            cantContainGenres.push($(this).text());
        });
    };

    var passesMustContainGenresList = function passesMustContainGenresList(item) {
        if (mustContainGenres.length > 0) {
            for (var i = 0; i < mustContainGenres.length; i++) {
                if (!hasGenre(mustContainGenres[i], item)) {
                    return false;
                }
            }
        }
        return true;
    };

    var passesCantContainGenresList = function passesCantContainGenresList(item) {
        if (cantContainGenres.length > 0) {
            for (var i = 0; i < cantContainGenres.length; i++) {
                if (hasGenre(cantContainGenres[i], item)) {
                    return false;
                }
            }
        }
        return true;
    };

    var passesGenreFilters = function passesGenreFilters(item) {
        if (passesCantContainGenresList(item)) {
            if (passesMustContainGenresList(item)) {
                return true;
            }
        }
        return false;
    };

    var passesContentTypeCheck = function passesContentTypeCheck(item) {
        if (contentType === 'Movies' && item.Type === 'movie') return true;
        if (contentType === 'TV shows' && item.Type === 'series') return true;
        if (contentType === 'Everything') return true;
        return false;
    };

    var filterItems = function filterItems(filters) {
        var newList = [];
        updateGenreFilterLists();
        if (result.length > 0 || $('.search-bar').val() && result.length === 0) {
            filteredList = result;
        } else {
            filteredList = fullList;
            sortItems(sortOption);
        }
        for (var i = 0; i < filteredList.length; i++) {
            var item = filteredList[i];
            var filtered = false;
            if (!passesContentTypeCheck(item)) filtered = true;
            if (!passesGenreFilters(item)) filtered = true;
            if (item.imdbRating < filters.imdb[0] || item.imdbRating > filters.imdb[1]) filtered = true;
            if (item.Metascore < filters.metacritic[0] || item.Metascore > filters.metacritic[1]) filtered = true;
            if (item.Tomatometer < filters.tomatometer[0] || item.Tomatometer > filters.tomatometer[1]) filtered = true;
            if (isNaN(item.Metascore) && (filters.metacritic[0] > 0 || filters.metacritic[1] < 100)) filtered = true;
            if (isNaN(item.Tomatometer) && (filters.tomatometer[0] > 0 || filters.tomatometer[1] < 100)) filtered = true;
            if (item.Year < filters.year[0] || item.Year > filters.year[1]) filtered = true;
            if (filtered === false) newList.push(filteredList[i]);
        }
        filteredList = newList;
    };

    var updateResults = function updateResults() {
        filterItems(filters);
        $('.flex-grid').empty();
        $('.flex-grid').animate({ scrollTop: 0 });
        $('.search-result-info h1').empty().append(filteredList.length + ' search results');
        numItems = 0;
        if (filteredList.length !== 0) {
            loadItems();
        }
    };

    var cleanUpItemsList = function cleanUpItemsList() {
        for (var i = 0; i < fullList.length; i++) {
            var item = fullList[i];
            item.Genre = item.Genre.split(', ');
            item.Language = item.Language.split(', ');
            item.Director = item.Director.split(', ');
            item.Writer = item.Writer.split(', ');
            for (var j = 0; j < item.Writer.length; j++) {
                if (item.Writer[j].indexOf('(') >= 0) {
                    item.Writer[j] = item.Writer[j].substring(0, item.Writer[j].indexOf('('));
                    item.Writer[j] = item.Writer[j].substring(0, item.Writer[j].length - 1);
                }
            }
            item.Actors = item.Actors.split(',');
            item.imdbRating = parseInt(parseFloat(item.imdbRating).toFixed(1) * 10);
            item.Metascore = parseInt(item.Metascore);
            item.Tomatometer = parseInt(item.Tomatometer);
            item.Year = parseInt(item.Year);
            item.Runtime = item.Runtime.substring(0, item.Runtime.indexOf('m'));
            item.Runtime = item.Runtime.substring(0, item.Runtime.length - 1);
            item.Runtime = parseInt(item.Runtime);
            if (item.Poster === 'N/A') item.Poster = 'http://i.imgur.com/g2XkPrD.png';
            // var img = new Image();
            // img.addEventListener("load", function(){
            //     if (this.naturalWidth < 250) {
            //         console.log(item.Title + ': ' + this.naturalWidth +'x'+ this.naturalHeight );
            //     }
            // });
            // img.src = item.Poster;
            if (item.Plot === 'N/A') item.Plot = 'N/A';
            for (var _j = fullList.length - 1; _j >= 0; _j--) {
                if (item.Title === fullList[_j].Title && i !== _j) {
                    fullList.splice(_j, 1);
                }
            }
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

    var handleSliders = function handleSliders() {
        var imdbSlider = document.getElementById('imdb-slider');
        var metacriticSlider = document.getElementById('metacritic-slider');
        var tomatoMeterSlider = document.getElementById('tomatometer-slider');
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
        noUiSlider.create(tomatoMeterSlider, {
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
                tomatometer: tomatoMeterSlider.noUiSlider.get(),
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

        tomatoMeterSlider.noUiSlider.on('end', function () {
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
            $('.card').find('.card-menu#' + id + ' .imdb-rating').css('margin-right', '1rem');
        }
        if (!isNaN(item.Tomatometer)) {
            $('.card').find('.card-menu#' + id + ' .ratings').append('<img class="rotten-tomatoes-logo" src="' + rottenTomatoesLogo + '"/><span class="rottentomatoes-rating">' + item.Tomatometer + '</span>');
            $('.card').find('.card-menu#' + id + ' .imdb-rating').css('margin-right', '1rem');
            $('.card').find('.card-menu#' + id + ' .metacritic-rating').css('margin-right', '1rem');
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
            $('.modal-container').find('.modal').append('<div class="modal-image-wrapper"><div class="modal-image" style="background-image: url(' + item.Poster + ')">\n                    <div class="modal-trailer" id="' + itemId + '" style="background-image: url(' + playButton + ')"></div>\n                </div></div>\n                    <div class="modal-content" id="' + itemId + '">\n                        <div class="modal-header">\n                            <span class="modal-close-btn">&times;</span>\n                            <h1>' + item.Title + '<span class="modal-year"> (' + item.Year + ')</span></h2>\n                            <h2>' + item.Genre + '</h3>\n                        </div>\n\n                        <div class="modal-plot">\n                        <p>' + item.Plot + '</p>\n                        </div>\n                        <div class="modal-facts">\n\n                        <p>Runtime: <span>' + item.Runtime + ' min</span></p>\n                        <p>Director: <span>' + item.Director + '</span></p>\n                        <p>Writer: <span>' + item.Writer + '</span></p>\n                        <p>Actors: <span>' + item.Actors + '</span></p>\n                        </div>\n\n                        <div class="modal-footer">\n                            <div class="modal-ratings">\n                                <img src="' + imdbLogo + '"/><span class="modal-imdb-rating">' + item.imdbRating + '</span>\n                            </div>\n                        </div>\n                    </div>\n            ');

            if (!isNaN(item.Metascore)) {
                $('.modal-container').find('.modal-content#' + itemId + ' .modal-ratings').append('<img src="' + metacriticLogo + '"/><span class="modal-metacritic-rating">' + item.Metascore + '</span>');
            }

            if (!isNaN(item.Tomatometer)) {
                $('.modal-container').find('.modal-content#' + itemId + ' .modal-ratings').append('<img src="' + rottenTomatoesLogo + '"/><span class="modal-rottentomatoes-rating">' + item.Tomatometer + '</span>');
            }

            $('.modal-container').fadeIn(200, function () {
                $('card.menu #' + itemId).fadeOut(10);
                $(this).css('display', 'flex');
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

    var handleFilterClosing = function handleFilterClosing() {
        $('.filters-container').on('click', '.filters-close-btn', function () {
            /**
             *      This is mess
             */
            var duration = 500;
            var ease = 'easeOutCubic';
            if ($('.filters').css('left') === '-392px') {
                $('.filters').animate({
                    left: '0'
                }, duration, ease);

                $('.filters-container').animate({
                    padding: '0'
                }, duration + 200, ease);

                $('.flex-grid').animate({
                    margin: '0 0 0 26.5rem'
                }, duration, ease);
            } else {
                $('.filters').animate({
                    left: '-392px'
                }, duration, ease);

                $('.filters-container').delay(100).animate({
                    padding: '0 13rem 0 0'
                }, duration + 200, ease);

                $('.flex-grid').delay(100).animate({
                    margin: '0 0 0 3rem'
                }, duration, ease);
            }
        });
    };

    var displayTrailer = function displayTrailer() {
        $('.flex-grid').on('click', '.card-trailer', function () {
            $('.trailer').fadeIn();
            var id = $(this).attr('id');
            $('.trailer iframe').attr('src', filteredList[id].Trailer);
        });

        $('.modal-container').on('click', '.modal-trailer', function () {
            $('.trailer').fadeIn();var id = $(this).attr('id');
            $('.trailer iframe').attr('src', filteredList[id].Trailer);
        });
    };

    var handleTrailerCloseButton = function handleTrailerCloseButton() {
        $('.trailer').on('click', '.trailer-close-btn', function () {
            $(this).parent().fadeOut();
            $(this).parent().find('iframe').attr('src', '');
        });
        $('.trailer').on('click', function (e) {
            $(this).fadeOut();
            $(this).find('iframe').attr('src', '');
        });
    };

    var loadItems = function loadItems() {
        $('.loading').show();
        var amnt = amount;
        if (numItems + amount >= filteredList.length) amnt = filteredList.length - numItems;
        for (var i = numItems; i < numItems + amnt; i++) {
            var item = filteredList[i];
            addCard(item, i);
        }
        $('.loading').hide();
        numItems += amnt;
    };

    var loadMoreCardsOnScroll = function loadMoreCardsOnScroll() {
        $(window).scroll(function () {
            if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                loadItems();
            }
        });
    };
});