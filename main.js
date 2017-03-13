$(document).ready(function() {

    imdbLogo = 'https://d2r1vs3d9006ap.cloudfront.net/public/uploaded_images/9999862/imdbsquarelogo_large.png';
    metacriticLogo = 'http://i.imgur.com/ThgZkgC.png';
    info = [];
    var amount = 100;

    /**
     *      GET LIST OF FILMS AND REQUEST DATA FROM OMDBAPI
     */
    $.getJSON("movies.json", function(json) {
        info = json.data;
        // for (var i = 0; i < json.data.length; i++) {
            // $.ajax({
            //     url: 'https://www.omdbapi.com/?t=' + json.data[i] + '&type=movie',
            //     type: 'GET',
            //     dataType: 'json',
            //     success: (function(data) {
            //         if (data.Response === 'True')
            //             if (data.Poster !== 'N/A') {
            //
            //                 info.push(data);
            //             }
            //
            //     }),
            //     error: (function() {
            //         console.log('ERROR! ERROR! ERROR!');
            //     })
            // });
        // }
    });

    /**
     *      POPULATE PAGE AFTER AJAX CALLS
     */
    $(document).ajaxStop(function() {
        console.log(info);
        var numItems = 0;
        for (var i = 0; i < amount; i++) {
            item = info[i];
            $('.flex-grid').append(
                `<div class="card" id="${i}" style="background-image: url(${item.Poster})">
                    <div class="card-menu" id="${i}">
                    <div class="info-button" id="${i}">more information</div>
                    <div class="ratings">
                    <img src="${imdbLogo}"/><span class="imdb-rating">${item.imdbRating}</span>
                    <img src="${metacriticLogo}"/><span class="metacritic-rating">${item.Metascore}</span>
                    </div>
                    </div>
                    </div>`);

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
                `<div class="modal-image" style="background-image: url(${item.Poster})"></div>
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
                            <img src="${imdbLogo}"/><span class="modal-imdb-rating">${item.imdbRating}</span>
                            <img src="${metacriticLogo}"/><span class="modal-metacritic-rating">${item.Metascore}</span>
                        </div>
                    </div>
                    `);

            $('.modal-container').css('display', 'block');
        });

        /**
         *      HANDLE MODAL CLOSE BUTTON
         */
        $('.modal-container').on('click', '.modal-close-btn', function() {
            $(this).parent().parent().parent().parent().css('display', 'none');
            $(this).parent().parent().parent().empty();
        });

        /**
         *      LOAD MORE CARDS WHEN USER REACHES BOTTOM OF PAGE
         */
        $(window).scroll(function() {
           if($(window).scrollTop() + $(window).height() == $(document).height()) {
               for (var i = numItems; i < numItems+amount; i++) {
                   item = info[i];
                   if (!item.imdbRating) {
                       item.imdbRating = '?';
                   }
                   if (item.Poster === 'N/A') {
                       item.Poster = 'http://i.imgur.com/eHaEk1a.png';
                   }
                   $('.flex-grid').append(
                       `<div class="card" id="${i}" style="background-image: url(${item.Poster})">
                           <div class="card-menu" id="${i}">
                           <div class="info-button" id="${i}">more information</div>
                           <div class="ratings">
                           <img src="${imdbLogo}"/><span class="imdb-rating">${item.imdbRating}</span>
                           <img src="${metacriticLogo}"/><span class="metacritic-rating">${item.Metascore}</span>
                           </div>
                           </div>
                           </div>`);

               }
               numItems += amount;
           }
        });

    });
});
