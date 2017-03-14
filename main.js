$(document).ready(function() {

    imdbLogo = 'https://d2r1vs3d9006ap.cloudfront.net/public/uploaded_images/9999862/imdbsquarelogo_large.png';
    metacriticLogo = 'http://i.imgur.com/ThgZkgC.png';
    playButton = 'http://i.imgur.com/Mlij2TP.png';
    info = [];
    var amount = 100;

    /**
     *      GET LIST OF FILMS AND REQUEST DATA FROM OMDBAPI
     */
    $.getJSON("moviestrailers.json", function(json) {
        info = json.data;
        // for (var i = 0; i < json.data.length; i++) {
        //     q = info[i].Title.replace(' ', '+');
        //     $.ajax({
        //         // url: 'https://www.omdbapi.com/?t=' + json.data[i] + '&type=movie',
        //         url: 'https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q='+ q + 'trailer&key=AIzaSyC6akvC-Cwt0No3IO7uLDPkS8DCgCFIpIQ',
        //         type: 'GET',
        //         dataType: 'json',
        //         async: false,
        //         success: (function(data) {
        //             // if (data.Response === 'True')
        //             //     if (data.Poster !== 'N/A') {
        //             //
        //             //         info.push(data);
        //             //     }
        //             // console.log(data)
        //             if (data.items[0]) {
        //                 youtubeTrailerLink = 'https://www.youtube.com/watch?v=' + data.items[0].id.videoId;
        //                 info[i].Trailer = youtubeTrailerLink;
        //             } else {
        //                 info[i].Trailer = 'N/A';
        //                 console.log(i, info[i].Title)
        //             }
        //             // console.log(youtubeTrailerLink)
        //         }),
        //         error: (function() {
        //             console.log('ERROR! ERROR! ERROR!');
        //         })
        //     });
        // }
    });

    addCard = function(item, id) {
        $('.flex-grid').append(
            `<div class="card" id="${id}" style="background-image: url(${item.Poster})">
                <div class="card-menu" id="${id}">
                    <div class="info-button" id="${id}">more information</div>
                    <div class="card-trailer" id="${id}" style="background-image: url(${playButton})"></div>
                    <div class="ratings">
                    <img src="${imdbLogo}"/><span class="imdb-rating">${item.imdbRating}</span>
                    <img src="${metacriticLogo}"/><span class="metacritic-rating">${item.Metascore}</span>
                    </div>
                </div>
            </div>`);
    }

    /**
     *      POPULATE PAGE AFTER AJAX CALLS
     */
    $(document).ajaxStop(function() {
        var numItems = 0;
        for (var i = 0; i < amount; i++) {
            item = info[i];
            addCard(item, i);

        }
        numItems += amount;

        /**
         *      CARD MENU HOVER HANDLING
         */
        $('.flex-grid').on('mouseenter', '.card', function() {
            $(this).find('.card-menu').css('display', 'flex');
        });

        $('.flex-grid').on('mouseleave', '.card', function() {
            $(this).find('.card-menu').css('display', 'none');
        });

        /**
         *      MORE INFORMATION MODAL HANDLING
         */
        $('.flex-grid').on('click', '.info-button', function() {
            itemId = $(this).attr('id');
            item = info[itemId];
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

            $('.modal-container').fadeIn(150, function() {
                $(this).css('display', 'block');
            });
        });

        /**
         *      HANDLE MODAL CLOSE BUTTON
         */
        $('.modal-container').on('click', '.modal-close-btn', function() {
            // $(this).parent().parent().parent().fadeOut();
            $(this).parent().parent().parent().parent().fadeOut(150, function() {
                $(this).css('display', 'none');
                $(this).children(':first').empty();
            });
        });

        /**
         *      HANDLE TRAILER
         */

         $('.flex-grid').on('click', '.card-trailer', function() {
            $('.trailer').fadeIn();
            id = $(this).attr('id');
            youtubeId = info[id].Trailer.slice(-11);
            $('.trailer iframe').attr('src', 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1');
        });

        $('.modal-container').on('click', '.modal-trailer', function() {
            $('.trailer').fadeIn();
            id = $(this).attr('id');
            youtubeId = info[id].Trailer.slice(-11);
            $('.trailer iframe').attr('src', 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1');
        });

        /**
         *      HANDLE TRAILER CLOSE BUTTON
         */
        $('.trailer').on('click', '.trailer-close-btn', function() {
            $(this).parent().fadeOut();
            $(this).parent().find('iframe').attr('src', '');
        });

        /**
         *      LOAD MORE CARDS WHEN USER REACHES BOTTOM OF PAGE
         */
        $(window).scroll(function() {
           if($(window).scrollTop() + $(window).height() == $(document).height()) {
               for (var i = numItems; i < numItems+amount; i++) {
                   item = info[i];
                   addCard(item, i);

               }
               numItems += amount;
           }
        });

    });
});
