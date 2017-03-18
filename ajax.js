for (var i = 0; i < json.items.length; i++) {
    fullList[i] = json.items[i];
    let q = json.items[i].Title.replace(' ', '+');
    if (json.items[i].Type === 'series' || json.items[i].Type === 'episode') {
        q = q + '+season+1+trailer';
    } else {
        q = q + '+trailer';
    }
    $.ajax({
        // url: 'https://www.omdbapi.com/?t=' + json.items[i],
        url: 'https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q='+ q + '&key=AIzaSyC6akvC-Cwt0No3IO7uLDPkS8DCgCFIpIQ',
        type: 'GET',
        dataType: 'json',
        item: json.items[i],
        async: false,
        success: (function(data) {
            if (i % 50 === 0) console.log(i);
            // if (data.Response === 'True') {
            //     if (data.Poster !== 'N/A') {
            //         if (data.imdbRating !== 'N/A') {
            //             fullList.push(data);
            //         }
            //     }
            // }
            // youtube needs to be async
            if (data.items[0]) {
                let youtubeTrailerLink = 'https://www.youtube.com/embed/' + data.items[0].id.videoId + '?autoplay=1';
                fullList[i].Trailer = youtubeTrailerLink;
            } else {
                fullList[i].Trailer = 'N/A';
                console.log(i, fullList[i].Title);
            }
        }),
        error: (function () {
            console.log('ERROR! ERROR! ERROR!');
        })
    });
}
console.log(fullList);
