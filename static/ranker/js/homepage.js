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

var rootURL = "http://localhost:8000/list/"
var ajax_post = new Object;
    ajax_post['puri'] = ""
    // If something goes wrong, it's bc I uncommented the above
var playlist_json = new Object;
var offset = 0;


function getToken(){
    return ajax_post.token;
    // var codeInd = window.location.href.indexOf("=")
    // var codeEndInd = window.location.href.indexOf("&",codeInd)
    // var token = window.location.href.substring(codeInd+1,codeEndInd)
    // console.log(token);
    // if (token.length !== 210) { 
    //     return -1;
    //  }
    // return token;
}


function savePURI(id){
    window.ajax_post['puri'] = id;
    return ajax_post;
}


function getPlaylist(offset){
    console.log("Playlist list offset: ",offset)
    
    var URL = "https://api.spotify.com/v1/me/playlists"
    if (offset !== 0){
        URL = URL + "?offset=" + offset
    }

    $.ajax({
        method: "GET",
        url: URL,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken(),
        },
        success : function(json){
            console.log(json)
            // Later implementation
            showPlaylistsList(json)
            playlist_json = json
        },
        error : function(xhr, errmsg, err) { console.log(xhr.status + ': ' + xhr.responseText); }
    })
}

function showPlaylistsList(json){
    // Clear any existing playlist results before showing more
    $( '.result' ).remove();

    for (var i = 0; i < Object.keys(json.items).length ; i++){
        playlist = json.items[i]
        $('#playlist-body').append("<tr></tr>")
        cell = $('tr:last')
        cell.append("<td>"+playlist.name+"</td>")
        cell.append("<td>"+playlist.tracks.total+"</td>")
        cell.append("<td><button id='queue"+i+"'>QUEUE</button></td>")
        // The button will request details corresponding to the <tr> parent
        cell.addClass("result").attr("id","playlist"+i)
        console.log(playlist.name, " - ", playlist.tracks.total)
    }
}

function newPlaylist(){
    $.ajax({
        method: "POST",
        url: "https://api.spotify.com/v1/users/the_sides/playlists",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
        },
        data:JSON.stringify({
            "name":"DJRanker: "+ ajax_post['pname'],
            "description" :"DJRanker made this playlists, containing all the songs played for this session.",
            "public" : true
        }),
        success: function(json){
            console.log(json.id)
            window.ajax_post['puri'] = json.id
            console.log("New playlist made: ", ajax_post['puri'], ajax_post['puri'].length)
            launchSession()
        },
        error : function(xhr, errmsg, err,json){
            console.log(xhr.status + ': ' + xhr.responseText)
        }
    })
}

function launchSession(){
    
    console.log("Playlist saved in database:", ajax_post['puri'])
    ajax_post['token'] = getToken()
    // Create session model
    $.ajax({
        method: "POST",
        url: 'ajax_new_session',
        data:{
            data: JSON.stringify(ajax_post),
        },
        success : function(){
            console.log("Session POST sent", ajax_post)
            window.location.href = rootURL + ajax_post['sid']
        },
        error : function(xhr, errmsg, err,json){
            console.log(xhr.status + ': ' + xhr.responseText)
            
        }
    })
}

function authorizeHost(){
    var token;
            scopes = [
            'user-modify-playback-state',
            'playlist-read-private',
            'playlist-modify-public',
            'playlist-read-collaborative',
            'user-read-currently-playing',
            'user-read-playback-state'
        ]
    popup = window.open("https://accounts.spotify.com/authorize?client_id=757af020a2284508af07dea8b2c61301&redirect_uri=http://localhost:8000/authenticate" + "&scope=" + scopes.join('%20') + "&response_type=token&state=123", "popup",'toolbar = no, status = no beforeShow, width=200, height=200')
    // popup = window.open("http://localhost:8000/authenticate")
    function receiveMessage(event){
        console.log(event.data);
        window.ajax_post['token'] = event.data;
        popup.close()
        // Boom, we have a token, post to DB? Or use for local session
    }
    window.addEventListener("message", receiveMessage, false)
    return token;

}

$(document).ready(function(){
    
    $('#host-btn').click(function(){
        // Open or close dropdown-session-options
        $("#dropdown-session-options").slideToggle(400)
    })

    $('#autho-btn').click(authorizeHost)
    
    $('#playlist-btn').click(function(){
        if (getToken() == -1){
            window.alert("Authorize your Spotify account first, silly goose");
            return -1;
        }

        $('#user-playlists').slideDown(200)
        
        // If the results have been pressed on a previous click, don't bother again.
        if(!$('.result').length){
            getPlaylist(offset)
        }
        // State maintanance
        if(ajax_post['puri'].length !== 22){
        // Don't state that you are about to choose if you already picked playlist
        // Prevents user from picking, clicking fresh, then going back to picked. 
            ajax_post['puri'] = "choose"
        }
        $('#pstatus').text("YOUR PLAYLIST")
    })
    

    // Playlist Selection buttons
    //     because buttons do not exist when the doc is loaded, must attach 
    //     a listener to pre-existing where anything new might have been created
    
    $('#user-playlists').on('click', '.result',function(){
        // which playlist was clicked?
        var i = parseInt($(this).attr('id').substring(8))
        console.log("i:", i)
        console.log(playlist_json)
        // oh it was i? huh, well use that index and give is to the playlist_json
        console.log(playlist_json.items[i].id)
        ajax_post['puri'] = playlist_json.items[i].id
        $('#pstatus').text(playlist_json.items[i].name)

    })

    // Navigation buttons
    $('#prev-playlists').click(function(){
        if(offset == 0) return;
        offset -= 20 
        getPlaylist(offset)
    })
    $('#next-playlists').click(function(){
        if(offset+20 > playlist_json.total) return;
        offset += 20
        getPlaylist(offset)
    })

    $('#blanklist-btn').click(function(){
        $('#user-playlists').slideUp(200)

        // State maintanance 
        ajax_post['puri'] = "new"
        $('#pstatus').text("EMPTY PLAYLIST")
    })



    $('#start-btn').on('click',function(){
        console.log(getToken());  
        // Authorize account
        // Ask baselist or blank
        //    if bl, print list of users playlists with corresponding buttons. 

        ajax_post['pname'] = $('#party-name').val();
        ajax_post['sid'] = $('#sid-name').val();

            // FIELD VALIDATION 
        if(ajax_post['pname'] == "" ) {
            window.alert("Enter a party name")
        }
        else if(ajax_post['sid'].length != 6) {
            window.alert("Pro Tip: Most 6 digit codes are 6 digits in length.");
        }
        else if(ajax_post['puri'] == ""){
            // A playlist state hasn't been picked
            window.alert("Choose a playlist mode")
        }
        else if(ajax_post['puri'] == "choose"){
            // Using a base playlist which hasn't been choosen yet

        }        




            // CHECK FOR PRE-EXISTING SID




            // LAUNCH IF NO STOPS
        else{
            newPlaylist()
            // Within newPlaylist(), launchSession() will be called with ajax success
            //  newPlaylist ->  
            // make playlist

            // Check models for session with existing sid
            // FIXME: Assume sids will be unique FOR NOW 


            console.log(ajax_post['pname'], ajax_post['sid'])
        }

    })
    $('#join-btn').click(function(){
        // Prompt for 6-digit unique key
        var sid = window.prompt("What is the party's unique 6 digit code?")
        // Redirect to ranklist
        if ( sid.length == 6){
            window.location.href = rootURL + sid;
        }
        else console.log("need 6 digit key");
    })
})