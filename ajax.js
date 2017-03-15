for (var i = 0; i < json.data.length; i++) {
    q = info[i].Title.replace(' ', '+');
    $.ajax({
        // url: 'https://www.omdbapi.com/?t=' + json.data[i] + '&type=movie',
        url: 'https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q='+ q + 'trailer&key=AIzaSyC6akvC-Cwt0No3IO7uLDPkS8DCgCFIpIQ',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: (function(data) {
            // if (data.Response === 'True')
            //     if (data.Poster !== 'N/A') {
            //
            //         info.push(data);
            //     }
            // console.log(data)
            if (data.items[0]) {
                youtubeTrailerLink = 'https://www.youtube.com/watch?v=' + data.items[0].id.videoId;
                info[i].Trailer = youtubeTrailerLink;
            } else {
                info[i].Trailer = 'N/A';
                console.log(i, info[i].Title)
            }
            // console.log(youtubeTrailerLink)
        }),
        error: (function() {
            console.log('ERROR! ERROR! ERROR!');
        })
    });
}
