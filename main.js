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
        filterOpen = false,
        mustContainGenres = [],
        cantContainGenres = ['Documentary', 'Short', 'Animation'],
        filters = {
            imdb: [0, 100],
            metacritic: [0, 100],
            tomatometer: [0, 100],
            year: [1900, 2017]
        },
        amount = 30,
        numItems = 0;

    let w = $('.filters').width();
    $('.filters').velocity({
        translateX: -w + 80 + 'px'
    }, 1);

    $('.filters-container').velocity({
        translateX: '-200px'
    }, 1);
    var timer;
    $(window).resize(function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            calculateCardSize();
        }, 300);
    });

    $.getJSON("test_copy.json", function (json) {

        fullList = json.items;
        filteredList = json.items;

        cleanUpItemsList();
        filterItems(filters);
        // loadItems();
        initializeIsotope();
        updateResults();
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

    var initializeIsotope = function() {
        $('.flex-grid').isotope({
            layoutMode: 'fitRows',
            itemSelector: '.card-information',
            transitionDuration: '.3s'
        });
    };

    var handleContentTypeFiltering = function() {
        $('.content-type .radiobutton').on('click', function(e) {
            if (!$(this).hasClass('radiobutton-selected')) {
                $(this).parent().find('.radiobutton-selected').removeClass('radiobutton-selected');
                $(this).addClass('radiobutton-selected');
                contentType = $(this).text();
            }
            e.stopPropagation();
            updateResults();
        });
    };

    var handleSortOptions = function() {
        $('.sort-options .radiobutton').on('click', function(e) {
            if (!$(this).hasClass('radiobutton-selected')) {
                $(this).parent().find('.radiobutton-selected').removeClass('radiobutton-selected');
                $(this).addClass('radiobutton-selected');
                sortOption = $(this).attr('id');
            }
            e.stopPropagation();
            updateResults();
        });
    };

    var handleGenreButtons = function() {
        $('.checkbox').on('click', function(e) {
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

            /**
             *      Isotope filtering
             */
            // var requiredGenres = [];
            // $('.checkbox-selected').each(function() {
            //     requiredGenres.push($(this).text());
            // });
            // var hasRequiredGenres = false;
            // $('.flex-grid').isotope({ filter: function() {
            //   var id = $(this).attr('id');
            //   var itemGenres = filteredList[id].Genre;
            //   var requiredGenreCount = 0;
            //   for (let i = 0; i < itemGenres.length; i++) {
            //       if (requiredGenres.includes(itemGenres[i])) requiredGenreCount++;
            //   }
            //   hasRequiredGenres = requiredGenreCount === requiredGenres.length;
            //   return hasRequiredGenres;
            // }});
            // loadItems();
        });
    };

    var calculateCardSize = function() {
        let gridWidth = $('.flex-grid').width();
        let numCardsInRow = 6;
        let marginAllowance = 160; // todo: know what this is
        if (gridWidth < 1600) numCardsInRow = 5;
        if (gridWidth < 1300) numCardsInRow = 4;
        if (gridWidth < 1060) numCardsInRow = 3;
        if (gridWidth < 800) numCardsInRow = 2;
        if (gridWidth < 350) numCardsInRow = 1;
        let newWidth =  (gridWidth / numCardsInRow) - marginAllowance / numCardsInRow;
        let newHeight = newWidth / 0.6667;
        let duration = 10;
        let ease = 'easeOutCubic';
        console.log(newWidth, newHeight, gridWidth);
        $('.card').velocity({
            width: newWidth + 'px !important;',
            height: newHeight + 'px'
        }, { complete: function() {
            $('.flex-grid').isotope('reloadItems').isotope({ sortBy: 'original-order' });
        } }, duration, ease);
    };

    var handleSearchBar = function() {
        var timer;
        $('.search-bar').on('input', function() {
            filteredList = fullList;
            var options = {
                shouldSort: true,
                threshold: 0.3,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: [
                    'Title',
                    'Actors'
                ]
            };
            var fuse = new Fuse(filteredList, options);
            result = fuse.search($(this).val());
            var searchQueryLength = $.trim($(this).val()).length;
            clearTimeout(timer);
            timer = setTimeout(function() {
                console.log('bla');
                if (searchQueryLength > 0) {
                    updateResults();
                }
            }, 200);
        });

        $('.search-bar').keyup(function() {
            if (!$(this).val()) {
                updateResults();
            }
        });
    };

    var hasGenre = function(genre, item) {
            if (item.Genre.indexOf(genre) > -1) return true;
            return false;
    };

    var updateGenreFilterLists = function() {
        mustContainGenres = [];
        cantContainGenres = [];
        $('.checkbox-selected').each(function() {
            mustContainGenres.push($(this).text());
        });
        $('.checkbox-deselected').each(function() {
            cantContainGenres.push($(this).text());
        });
    };

    var passesMustContainGenresList = function(item) {
        if (mustContainGenres.length > 0) {
            for (let i = 0; i < mustContainGenres.length; i++) {
                if (!hasGenre(mustContainGenres[i], item)) {
                    return false;
                }
            }
        }
        return true;
    };

    var passesCantContainGenresList = function(item) {
        if (cantContainGenres.length > 0) {
            for (let i = 0; i < cantContainGenres.length; i++) {
                if (hasGenre(cantContainGenres[i], item)) {
                    return false;
                }
            }
        }
        return true;
    };

    var passesGenreFilters = function(item) {
        if (passesCantContainGenresList(item)) {
            if (passesMustContainGenresList(item)) {
                return true;
            }
        }
        return false;
    };

    var passesContentTypeCheck = function(item) {
        if (contentType === 'Movies' && item.Type === 'movie') return true;
        if (contentType === 'TV shows' && item.Type === 'series') return true;
        if (contentType === 'Everything') return true;
        return false;
    };

    var filterItems = function(filters) {
        var newList = [];
        updateGenreFilterLists();
        if (result.length > 0 || ($('.search-bar').val() && result.length === 0)) {
            filteredList = result;
        } else {
            filteredList = fullList;
            sortItems(sortOption);
        }
        for (let i = 0; i < filteredList.length; i++) {
            let item = filteredList[i];
            let filtered = false;
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

    var updateResults = function() {
        filterItems(filters);
        $('.flex-grid').empty();
        $('.flex-grid').append('<div class="search-result-info"><h1>' + filteredList.length + ' results</h1></div>');
        numItems = 0;
        if(filteredList.length !== 0) {
            loadItems();
        }
        $('.search-result-info').velocity('scroll', { container: $(window) });
    };

    var cleanUpItemsList = function() {
        for (let i = 0; i < fullList.length; i++) {
            let item = fullList[i];
            item.Genre = item.Genre.split(', ');
            item.Language = item.Language.split(', ');
            item.Director = item.Director.split(', ');
            item.Writer = item.Writer.split(', ');
            for (let j = 0; j < item.Writer.length; j++) {
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
            if (item.Plot === 'N/A') item.Plot = 'No plot description available.';
            for (let j = fullList.length - 1; j >= 0; j--) {
                if (item.Title === fullList[j].Title && i !== j) {
                    fullList.splice(j, 1);
                }
            }
        }
    };

    var sortItems = function(sortParameter) {
        if (sortParameter === 'Title') {
            filteredList.sort(function(a, b) {
                let titleA = a.Title.toUpperCase();
                let titleB = b.Title.toUpperCase();
                if (titleA < titleB) return -1;
                if (titleA > titleB) return 1;
                return 0;
            });
            return;
        }

        if (sortParameter === 'Average') {
            filteredList.sort(function(a, b) {
                let aScores = [];
                let bScores = [];
                aScores.push(a.imdbRating);
                bScores.push(b.imdbRating);
                if (!isNaN(a.Metascore)) aScores.push(a.Metascore);
                if (!isNaN(a.Tomatometer)) aScores.push(a.Tomatometer);
                if (!isNaN(b.Metascore)) bScores.push(b.Metascore);
                if (!isNaN(b.Tomatometer)) bScores.push(b.Tomatometer);
                let aAverage = aScores.reduce(function(a, b) { return a + b; }, 0) / aScores.length;
                let bAverage = bScores.reduce(function(a, b) { return a + b; }, 0) / bScores.length;
                return bAverage - aAverage;
            });
            return;
        }

        filteredList.sort(function(a, b) {
            if (isNaN(a[sortParameter])) return 1;
            if (isNaN(b[sortParameter])) return -1;
            return b[sortParameter] - a[sortParameter];
        });
    };

    var handleSliders = function() {
        var imdbSlider = document.getElementById('imdb-slider');
        var metacriticSlider = document.getElementById('metacritic-slider');
        var tomatoMeterSlider = document.getElementById('tomatometer-slider');
        var yearSlider = document.getElementById('year-slider');

        noUiSlider.create(imdbSlider, {
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
        noUiSlider.create(tomatoMeterSlider, {
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
        	step: 1,
            margin: 1,
        	behaviour: 'snap',
            tooltips: [wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
        	connect: true,
        	range: {
        		'min':  1900,
        		'max':  2017
        	}
        });

        var updateFilters = function() {
            filters = {
                imdb: imdbSlider.noUiSlider.get(),
                metacritic: metacriticSlider.noUiSlider.get(),
                tomatometer: tomatoMeterSlider.noUiSlider.get(),
                year: yearSlider.noUiSlider.get()
            };
        };


        imdbSlider.noUiSlider.on('end', function() {
            updateFilters();
            updateResults();
        });

        metacriticSlider.noUiSlider.on('end', function() {
            updateFilters();
            updateResults();
        });

        tomatoMeterSlider.noUiSlider.on('end', function() {
            updateFilters();
            updateResults();
        });

        yearSlider.noUiSlider.on('end', function() {
            updateFilters();
            updateResults();
        });

    };

    var addCard = function(item, id) {
            let maxLength = 4;
            if (item.Writer.length > maxLength) item.Writer.splice(-(item.Writer.length-maxLength));
            if (item.Director.length > maxLength) item.Director.splice(-(item.Director.length-maxLength));
            let $newCard = $(
                `<div class="card-information">
                <div class="card" data-original="${item.Poster}" data-genre="${item.Genre}" id="${id}" style="background-image: url(${item.Poster})">
                    <div class="card-menu" id="${id}">
                        <div class="info-button" id="${id}">information</div>
                        <div class="card-trailer" id="${id}" style="background-image: url(${playButton})"></div>
                        <div class="ratings">
                            <img class="imdb-logo" src="${imdbLogo}"/><span class="imdb-rating">${item.imdbRating}</span>
                        </div>
                    </div>
                </div>
                </div>`);
            $('.flex-grid').append($newCard).isotope('appended', $newCard);
            if (!isNaN(item.Metascore)) {
                $('.card').find('.card-menu#' + id + ' .ratings').append('<img class="metacritic-logo" src="' + metacriticLogo + '"/><span class="metacritic-rating">' + item.Metascore + '</span>');
                $('.card').find('.card-menu#' + id + ' .imdb-rating').css('margin-right', '1rem');
            }
            if (!isNaN(item.Tomatometer)) {
                $('.card').find('.card-menu#' + id + ' .ratings').append('<img class="rotten-tomatoes-logo" src="' + rottenTomatoesLogo + '"/><span class="rottentomatoes-rating">' + item.Tomatometer + '</span>');
                $('.card').find('.card-menu#' + id + ' .imdb-rating').css('margin-right', '1rem');
                $('.card').find('.card-menu#' + id + ' .metacritic-rating').css('margin-right', '1rem');
            }
            if ($('.card').height() > $('.card').width()) {
                $('.card').find('.card-menu#' + id).css('display', 'none');
            }
    };

    var handleCardMenuHover = function() {
        $('.flex-grid').on('mouseenter', '.card', function() {
            if ($('.card').height() > $('.card').width()) {
                $(this).find('.card-menu').fadeIn(50);
            }

        });

        $('.flex-grid').on('mouseleave', '.card', function() {
            if ($('.card').height() > $('.card').width()) {
                $(this).find('.card-menu').fadeOut(50);
            }
        });
    };

    var handleMoreInformationButton = function() {
        $('.flex-grid').on('click', '.info-button', function() {
            var itemId = $(this).attr('id');
            var item = filteredList[itemId];
            $('.modal-container').find('.modal').append(
                `<div class="modal-image-wrapper"><div class="modal-image" style="background-image: url(${item.Poster})">
                    <div class="modal-trailer" id="${itemId}" style="background-image: url(${playButton})"></div>
                </div></div>
                    <div class="modal-content" id="${itemId}">
                        <div class="modal-header">
                            <span class="modal-close-btn">&times;</span>
                            <h1>${item.Title}<span class="modal-year"> (${item.Year})</span></h2>
                            <h2>${item.Genre}</h3>
                        </div>

                        <div class="modal-plot">
                        <p>${item.Plot}</p>
                        </div>
                        <div class="modal-facts">

                        <p>Runtime: <span>${item.Runtime} min</span></p>
                        <p>Director: <span>${item.Director}</span></p>
                        <p>Writer: <span>${item.Writer}</span></p>
                        <p>Actors: <span>${item.Actors}</span></p>
                        </div>

                        <div class="modal-footer">
                            <div class="modal-ratings">
                                <img src="${imdbLogo}"/><span class="modal-imdb-rating">${item.imdbRating}</span>
                            </div>
                        </div>
                    </div>
            `);

            if (!isNaN(item.Metascore)) {
                $('.modal-container').find('.modal-content#'+itemId + ' .modal-ratings').append('<img src="' + metacriticLogo + '"/><span class="modal-metacritic-rating">' + item.Metascore + '</span>');
            }

            if (!isNaN(item.Tomatometer)) {
                $('.modal-container').find('.modal-content#'+itemId + ' .modal-ratings').append('<img src="' + rottenTomatoesLogo + '"/><span class="modal-rottentomatoes-rating">' + item.Tomatometer + '</span>');
            }

            $('.modal-container').fadeIn(200, function() {
                $('card.menu #' + itemId).fadeOut(10);
                $(this).css('display', 'flex');
            });
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
    };

    var handleFilterClosing = function() {
        $('.filters').on('click', '.filters-close-btn', function() {
            let duration = 500;
            let ease = 'easeOutCubic';
            let filtersTranslateLength = $('.filters').width() - 80;
            let gridMarginLeft = 100;
            if (filterOpen) {
                filterOpen = false;
                $(this).velocity({
                    rotateZ: '0deg'
                });
                $('.filters').velocity({
                    translateX: -filtersTranslateLength + 'px'
                }, duration, ease);

                $('.filters-container').velocity({
                    translateX: '-200px'
                }, duration, ease);

                $('.flex-grid').velocity({
                    marginLeft: gridMarginLeft + 'px',
                    width: '90%'
                }, { complete: function() {

                    calculateCardSize();
                } }, duration, ease);


            } else {
                filterOpen = true;
                $(this).velocity({
                    rotateZ: '180deg'
                });
                $('.filters').velocity({
                    translateX: '0px'
                }, duration, ease);

                $('.filters-container').velocity({
                    translateX: '0px'
                }, duration + 100, ease);
                //
                let widthPercentage = 100 - (filtersTranslateLength / $('.container').width() * 100);
                if (widthPercentage > 100) widthPercentage = 100;
                console.log(widthPercentage);
                $('.flex-grid').velocity({
                    marginLeft: filtersTranslateLength + gridMarginLeft + 'px',
                    width: widthPercentage - 10 + '%'
                },{ complete: function() {

                    calculateCardSize();
                } }, duration, ease);
            }
        });
    };


    var displayTrailer = function() {
        $('.flex-grid').on('click', '.card-trailer', function() {
            $('.trailer').fadeIn();
            var id = $(this).attr('id');
            $('.trailer iframe').attr('src', filteredList[id].Trailer);
        });

        $('.modal-container').on('click', '.modal-trailer', function() {
            $('.trailer').fadeIn();            var id = $(this).attr('id');
            $('.trailer iframe').attr('src', filteredList[id].Trailer);
        });
    };

    var handleTrailerCloseButton = function() {
        $('.trailer').on('click', '.trailer-close-btn', function() {
            $(this).parent().fadeOut();
            $(this).parent().find('iframe').attr('src', '');
        });
        $('.trailer').on('click', function(e) {
            $(this).fadeOut();
            $(this).find('iframe').attr('src', '');
        });
    };

    var loadItems = function() {
        let amnt = amount;
        if (numItems + amount >= filteredList.length) amnt = filteredList.length - numItems;
        for (let i = numItems; i < numItems + amnt; i++) {
            let item = filteredList[i];
            addCard(item, i);
        }
        $('.flex-grid').isotope('reloadItems').isotope({ sortBy: 'original-order' });
        $('.loading').fadeOut();
        numItems += amnt;
        console.log('i b loadin');
    };

    var loadMoreCardsOnScroll = function() {
        $(window).scroll(function () {
            if($(window).scrollTop() + $(window).height() - $(document).height() > -2) {
                $('.loading').fadeIn();
                loadItems();

            }
        });
    };
});
