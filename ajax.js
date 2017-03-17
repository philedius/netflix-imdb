for (var i = 0; i < 10; i++) {
    info[i] = json.items[i];
    let q = json.items[i].Title.replace(' ', '+');
    if (json.items[i].Type === 'series') {
        q = q + '+season+1+trailer';
    } else {
        q = q + '+trailer';
    }
    $.ajax({
        // url: 'https://www.omdbapi.com/?t=' + json.items[i],
        url: 'https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q='+ q + '&key=AIzaSyC6akvC-Cwt0No3IO7uLDPkS8DCgCFIpIQ',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: (function(data) {
            // if (i % 50 === 0) console.log(i);
            // if (data.Response === 'True') {
            //     if (data.Poster !== 'N/A') {
            //         if (data.imdbRating !== 'N/A') {
            //             info.push(data);
            //         }
            //     }
            //
            // }


            if (data.items[0]) {
                let youtubeTrailerLink = 'https://www.youtube.com/embed/' + data.items[0].id.videoId + '?autoplay=1';
                info[i].Trailer = youtubeTrailerLink;
            } else {
                info[i].Trailer = 'N/A';
                console.log(i, info[i].Title);
            }
        }),
        error: (function () {
            console.log('ERROR! ERROR! ERROR!');
        })
    });
}
