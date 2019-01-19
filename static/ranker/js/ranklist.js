// CSRF Token
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
}); 
function ajaxHeaderToken(token){
    $.ajaxSetup({
        headers: {
            'Accept': 'application/json' ,
            'Content-Type': 'application/json',
            // Token will depend on the user hosting
            'Authorization': 'Bearer '+ token
        }
    })
}
function ajaxErrorCallback(xhr){
    console.log(xhr.status + ': ' + xhr.responseText);   
}

function compare(a, b){
    const scoreA = a.fields.score
    const scoreB = b.fields.score

    let comparison = 0;
    if(scoreA > scoreB) comparison = -1;
    if(scoreA < scoreB) comparison = 1;
    return comparison
}


// The function above BUT IT'S A FUCKING PROMISE NOW to stop XML warning.
function refreshRanklistPromise(sid){
    return new Promise(function(resolve, reject){
        $.ajax({
            method: "GET",
            url: 'ajax_refresh_ranklist/'+sid,
            success : function(json){
                resolve(JSON.parse(json.song_requests))
                // rv = json['token']
            },
            error : function(xhr, errmsg, err,json){
                console.log(xhr.status + ': ' + xhr.responseText)
                reject(null)
            }
        })

    })
}

function updateRanklist(sid){
    refreshRanklistPromise(sid).then(function(data){
        // Ranklist refreshed
        currentRanklist = data
        displayRanklist(data)
    }).catch(function(){
        console.log("Error updating ranklist")
    })
}

// Should not be a resort, but necessary for old sessions. 
//   perhaps write a cookie with the host including a time on 
//   when the host's code expires and visitors will need to 
//   authorize their accounts to make requests
//                             that or find permanent authorization
function authorizeVisitor(){
    var token;
    const scopes = [
            'user-modify-playback-state',
            'playlist-read-private',
            'playlist-modify-public',
            'playlist-read-collaborative',
            'user-read-currently-playing',
            'user-modify-playback-state',
            'user-read-playback-state'
        ];
    popup = window.open("https://accounts.spotify.com/authorize?"
    +"client_id=757af020a2284508af07dea8b2c61301&"
    +"redirect_uri=http://localhost:8000/authenticate" 
    + "&scope=" + scopes.join('%20') + "&response_type=token&state=123"
    , "popup",'toolbar = no, status = no beforeShow, width=200, height=200')
    // popup = window.open("http://localhost:8000/authenticate")
    function receiveMessage(event){
        console.log(event.data);
        window.token = event.data;
        ajaxHeaderToken(event.data)
        popup.close()
        // searchRequest();
        // Boom, we have a token, post to DB? Or use for local session
    }
    window.addEventListener("message", receiveMessage, false)
    
}

function getToken(sid){
    // GET Latest token from db
    // use token in spotify call and catch the new one
    // POST new!!!! latest token into db for next call
    //    THIS TRANSACTION MUST HAPPEN
    if(sid === undefined) return window.token
    $.ajax({
        method: "GET",
        url: 'ajax_get_token/' + sid,
        success : function(json){
            console.log("Ajax get token successooooo", json.token)
            window.token = json.token
            ajaxHeaderToken(json.token)
            return json.token;
        },
        error : function(xhr, errmsg, err,json){
            console.log("Django didn't have a code?")
            console.log(xhr.status + ': ' + xhr.responseText)
            return -1;
        }
    })

}

function postToken(sid, token){
    $.ajax({
        method:"POST",
        url: 'ajax_post_token/' + sid,
        data: {
            "token": token
        },
        success : function(json){
            console.log("Ajax post sucessoooo")
        },
        error : ajaxErrorCallback
    })
}

function spotifyCall(type,value){
    $.ajax({
        method: "POST",
        headers: {
            // "Authorization" : 
        }
    })
}

function spotifyCallToken(type,value){
    // Universal function for making spotify calls while refreshing the session's token 
    //   for the next user's call

    // Get latest token and error check
    var token = getToken(sid);
    if(token != -1){
        // Make spotify call, POSTing new token
        // after token is guarenteed
        if(spotifyCall(type,value) == -1){
            
        }
    }
}


// Search AJAX call
function searchRequest(){
    let searchStr = $('#search-str').val().replace(/ /g, "%20")//split(' ').join('%20')
    
    // Empty Error Check
    if(searchStr == ""){
        return
    }

    console.log("New search for ", searchStr);
    URL = "https://api.spotify.com/v1/search?q=" + searchStr + "&type=track&market=US&limit=10"
    console.log(URL)
    $.ajax({
        method: "GET",
        url: URL ,
        // headers: {
        //     'Accept': 'application/json' ,
        //     'Content-Type': 'application/json',
        //     // Token will depend on the user hosting
        //     'Authorization': 'Bearer '+ window.token
        // },
        success : function(json){
            console.log("Search returned")
            searchResults = json
            displayResults(json)
        },
        error : function(xhr, errmsg, err) { 
            console.log(xhr.status + ': ' + xhr.responseText);   
                // AUTHORIZE WITH VISITOR FOR NEW SEARCH TOKEN 

            // REFER TO ISSUE #6   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            authorizeVisitor();
            // getToken(sid)
            
        }
        
    })
}

function hideResults(){
    $("#drop-results").css("display","none")
}

function displayResults(results){
    // Remove existing search items
    $(".result").remove();  // Existing search items

    // At this point, the result variable is filled with 10 tracks as an object
    // Prompt the user to pick one of the tracks to be requested
    $("#drop-results").css("display","block")

    console.log(results);
    console.log("# of tracks returned: ",results.tracks.items.length )
        // A search may be too specific and return less than 10 tracks
    
    for (var i = 0; i < results.tracks.items.length;i++){
        song = results.tracks.items[i];

        //   FIXME:
        // Check if should be #result-body
        $('#result-body').append("<tr></tr>")
        cell = $('tr:last')
        cell.append("<td>"+song.name+"</td>")
        cell.append("<td>"+song.artists[0].name+"</td>")
        cell.append($("<td>").text(song.duration_ms))
        cell.addClass("result").attr("id","searchedTrack"+i)
        console.log(song.name, " - ", song.artists[0].name)
    }
}

function addTrackToPlaylist(trackUri){
    $.ajax({
        method:"POST",
        url: "https://api.spotify.com/v1/playlists/"
            +$("#pid-render").text()
            +"/tracks?uris="
            +trackUri,
        // headers: {
        //     'Accept': 'application/json' ,
        //     'Content-Type': 'application/json',
        //     // Token will depend on the user hosting
        //     'Authorization': 'Bearer '+ window.token
        // },
        success : function(responce){
            console.log(responce)
        },
        error : ajaxErrorCallback
    })
    return true
}

function refreshPlaylistPlayback(){
    // Find the position of the users playback to the song
    //   and that song's duration. Once the song is over, seconds before,
    //   set them to a new point close to where they are and HOPEFULLY
    //   the playlist will be updated with added tracks and songs will flow
    // ===  STUDY  === //
    let ajax_data = {
        "context_uri": "spotify:playlist:"+$('#pid-render').text()
    }

    // ===  and HACK  === //
    $.ajax({
        method: "PUT",
        url: "https://api.spotify.com/v1/me/player/play",
        // headers: {
        //     'Accept': 'application/json' ,
        //     'Content-Type': 'application/json',
        //     'Authorization': 'Bearer '+ window.token
        // },
        data: JSON.stringify(ajax_data),
        success: function(res){
            console.log("We think it worked", res)
        },
        error : ajaxErrorCallback
    })
}

function addTrackToDB(trackInd){
    let song = {}
    song.sid = sid // Global value. If fail, try window.sid; Research window vars
    song.name = searchResults.tracks.items[trackInd].name;
    song.uri = searchResults.tracks.items[trackInd].uri
    song.artist = searchResults.tracks.items[trackInd].artists[0].name
    song.album_img = searchResults.tracks.items[trackInd].album.images[2].url
    song.score = 0
    console.log(song)
    
    $.ajax({
        method: "POST",
        url: "ajax_post_track/",
        data: song,
        success : function(res){
            console.log("Track DB success", res)
        },
        error : ajaxErrorCallback
    })
    return song

}

function displayRanklist(trackLoad){
    
    trackLoad.sort(compare);

    // What exists? What should be moved?

    // reorder is dependant on .score being the 3rd children. Plz refactor if changing. 
    for(let i = 0; i < trackLoad.length; i++){
        let node = $("<div>", {"class" : "track-node"});
        // node.append($("<p>", {"class":"score"}).text("0"))
        node.append($("<img>", {"class":"album-img node-item","src":trackLoad[i].fields.album_img}))
        let desc = $("<div>", {"class":"song_description"})
        // desc.append($("<span>").text(trackLoad[i].fields.name + "<br>" + trackLoad[i].fields.artist ))
        desc.append($("<span>", {"class": "desc"}).text(trackLoad[i].fields.name))
        desc.append($("<br>"))
        desc.append($("<span>"/*, {"class": "desc"}*/).text(trackLoad[i].fields.artist))
        node.append(desc)
        node.append($("<div>", {"class":"score", "id":trackLoad[i].fields.uri}).text(trackLoad[i].fields.score).val(trackLoad[i].fields.uri))
        let vote_panel = $("<div>", {"class":"vote-panel"})
        vote_panel.append($("<button>", {"class":"vote-btn node-item"}).text("+").val(false))
        vote_panel.append($("<button>", {"class":"vote-btn node-item"}).text("-").val(false))
        node.append(vote_panel)
        $("#ranklist-body").append(node)
    }

    // Log
    console.log("sorted",trackLoad)
    console.log("Songs on ranklist", trackLoad.length)

    //=======================================================
    //            SERVER SIDE PROCESS
    // ---    ---    ---   --   ---    ---    ---   ---   ---
    // manipulateSpotify(trackLoad)
}

function ajaxCurrentlyPlaying(){
    // Pull spotify playback info
    $.ajax({
        method: "GET",
        url: "https://api.spotify.com/v1/me/player/currently-playing",
        success : renderCurrentlyPlaying,
        error : ajaxErrorCallback
    })
    // Render DOM elements
    return true
}
function renderCurrentlyPlaying(json){
    console.log(json)
}

function manipulateSpotify(tracks){
    // Pull current list
    // Check for any adds 
    // Reposition tracks
}
function reorderRanklist(){
    // Whewy, okay this is a big one. Will go through the #ranklist-body and sort based on new results (votes and new requests)
    // As far as sorting, I'll go for insertion sort for now since it will likely be one results out of place.
    // A good implementation in the future would be quick sort.

    // Traverse Ranklist body, consider dynamically added nodes from jquery
    let ranklistNodes = document.getElementsByClassName("track-node")
    let ranklistBody = document.getElementById('ranklist-body')

    // Make object with position indice and score to sort
    let posObj = []
    for(let i = 0; i < ranklistNodes.length; i++){
        posObj.push({'pos':i,"score":ranklistNodes[i].children[2].innerText})
    }

    // Sort object of indices and positions
    posObj.sort(function(a,b){
        return b.score - a.score
    })
    console.log(posObj)

    // Use sorted object to manipulate out of play nodes. 
    for(let i = 0; i < ranklistNodes.length; i++){
        if(posObj[i].pos !== i){
            ranklistBody.insertBefore(
                ranklistNodes[posObj[i].pos], // The track we want to move
                ranklistNodes[i+1])      // Behind the node where is should be
        } 
    }

    return true
}

// Depreciated, used for debugging
function swapTrackNodes(i, j){
    ranklistNodes = document.getElementsByClassName("track-node")
    return document.getElementById("ranklist-body").insertBefore(ranklistNodes[i],ranklistNodes[j])
}

function updateScore(track, vote){

    let base = Number(track.text())

    track.text(base+vote)

    rankSocket.send(JSON.stringify({
        'type': 'vote',
        'track':track.val(),
        'voteValue': vote
    }))

}

//===============  GLOBALS  ===============//
var sid = window.location.href.substr(-6)
window.token = getToken(sid);
var searchResults = {};
var currentRanklist = {};
///--------------------------------------
//               WEBSOCKET
//_______________________________________
var rankSocket = new WebSocket(
    'ws://' + window.location.host + 
    '/ws/list/' + sid + '/'
    );

rankSocket.onmessage = function(event){
    data = JSON.parse(event.data)
    console.log("The vote changed to")
    console.log("From DOM", document.getElementById(data.track).innerText)
    // Find track
    // Change Score
    document.getElementById(data.track).innerText = data.newScore
    // Move ranklist
    reorderRanklist()
    // Connection Check
    // If result hasn't been recieved after same client sent, then report bad transmit error
}

rankSocket.onclose = function(event){
    console.error("Websocket is down")
}

//===========  RUNTIME EVENTS =============//
$(document).ready(function(session){ 
    // Upon launch,
    //   optain sid while recieving token, playlist ID ('puri'), and party name

    authorizeVisitor()
    // =================== UPDATE RANKLIST =========================//
    refreshRanklistPromise(sid).then(function(data){
        if(data.length == 0){ 
            $('#ranklist-body').text("Ranklist will start once request have been made")
            return
        }
        currentRanklist = data;
        console.log(currentRanklist)
        displayRanklist(currentRanklist)
    }).catch(function(){
        $('#ranklist-body').text("Ranklist was not found")
    })
    console.log("Ranklist:\n",currentRanklist)
   //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^// 
    // Results are accessable globally
    // Search process functions



    //Used once a request is submitted
    $('#drop-results').on('click','.result',function(){
        let resultIndex = $(this).attr("id").substr(-1)
        let trackLoad = []
        console.log("Request track index:",resultIndex)
        console.log(searchResults.tracks.items[resultIndex].name)

        for(let i = 0; i < currentRanklist.length; i++){
            if(currentRanklist[i].uri == searchResults.tracks.items[resultIndex].uri){
                window.alert("This song is already on ranklist or was played earlier")
            }
        }

        trackLoad.push({'fields':
            addTrackToDB(resultIndex)})
        addTrackToPlaylist(searchResults.tracks.items[resultIndex].uri)
        // Hacky work around. The user needs to be playing from the new 
        //   snapshot. Analyze and play user within the same context. 

        // refreshPlaylistPlayback()
        // updateRanklist(window.sid)
        displayRanklist(trackLoad)
        hideResults();
    })
    
    // Used to hide results from a search       WHAT? NOT DONE? I THOUGHT IT WORKED
    // $('#hide-results').click()

    $('#authorize').click(authorizeVisitor)

    // Search Functionality
    $('#search-btn').click(searchRequest)

    // ~~Enter~~ ANY button within search bar searches. Duh.
    $('#search-str').keypress(function(event){
        if((event.keyCode ? event.keyCode : event.which) == '13')
        if(event.keyCode) searchRequest();
    })

    ////////////////////////////////////////////////////////////////////////////////////////////////
    ////         UPDATING SONG QUEUE       /////////////////////////////////////////////////////////
    //// So my current solution is adding a song 20 seconds before the second to last song ends." //
    ////      https://github.com/spotify/web-api/issues/574S    ////////////////////////////////////
    ////                                                        ////////////////////////////////////
    ////    and I've come from the future to say fuck this, have server side processes do this    //
    ////////////////////////////////////////////////////////////////////////////////////////////////

    //   https://developer.spotify.com/documentation/web-api/reference/playlists/reorder-playlists-tracks/
    //   
    // A session will start with a base playlist of songs to play. 
    // Before going live, the playlist's songs are going to be rankable !!!
    //   so you'd have to have a limit on the amount of songs that can be kicked out. And beware of
        //  what's at stake. 
        //  Have the option to keep those songs hidden. 
        //  OR  if these are going to be the songs queued, allow the request to slip into the
        //    the playlist over time. Interject new songs into the playlist, base and requested with a base vote of 1.
        //  Host can enable point numbers  
        //    
    // The moment a song is request...

    // Load user votes based on device uniqueness. Vote default val = false

    // Vote Buttons
    $('#ranklist-body').on('click','.vote-btn',function(){
        // Check cookie for what's already been voted on.
        //   More needs to go into cookies to save long term
        let vote = 0

        // Vote Direction
        if($(this).text() == '+') vote += 1
        else                      vote -= 1
        
        // Vote magnitude and button update
        if($(this).val() !== $(this).siblings().val()){
            // If the button was already pressed, negate
            if($(this).val() == "true"){
                vote *= -1
                $(this).val("false").removeAttr("style");
            }

            // Verify that only one vote-btn is pressed
            else{
                vote *= 2 // The effect of the flick doubles in direction
                $(this).val("true").css("background-color","rgba(255, 98, 25, 0.748)");
                $(this).siblings().val(false).removeAttr("style");
            }
        }
        else if($(this).val() == "false"){
            $(this).val("true").css("background-color","rgba(255, 98, 25, 0.748)");
        }

        updateScore($(this).parent().prev(".score"),vote)

    })
})
