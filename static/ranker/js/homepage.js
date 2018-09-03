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

var ajax_post = new Object;
    ajax_post['puri'] = ""
var playlist_json = new Object;
var offset = 0;

function getToken(){
    var codeInd = window.location.href.indexOf("=")
    var codeEndInd = window.location.href.indexOf("&",codeInd)
    var token = window.location.href.substring(codeInd+1,codeEndInd)
    return token;
}

function dropdown(str){
    var dropmenu = $('#'+str);
    if ( dropmenu.css("display") == "none" ) dropmenu.slideDown(400);
    else dropmenu.slideUp(400);
}

function callPlaylist(offset){
    // Show only 20 results, remove old
    
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
            playlist_json = json
            displayPlaylists(playlist_json)
        },
        error : function(xhr, errmsg, err) { console.log(xhr.status + ': ' + xhr.responseText); }
    })
}

function displayPlaylists(json){
    // Clear any existing playlist results before showing more
    // if ( playlistShown() ) { clearPlaylist() }
    dropdown('user-playlists')
    
    // Find what's smaller, the search limit or the amount of playlists user holds.
    var n = json.limit
    if (n > json.total) { n = json.total }

    for (var i = 0; i < n ; i++){
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

function newPlaylist(baselistURI="NA"){
    if(baselistURI == "NA"){
        // New blank playlist
        var ptitle = "DJRanker: " + ajax_post['pname']
    }
    else{
        // Duplicate baselist
        var ptitle = "DJRanker: " // The rest appened after playlist parsed
    }
}

$(document).ready(function(){
    
    $('#host-btn').click(function(){
     
        
        // Open or close dropdown-session-options
        dropdown("dropdown-session-options")
                
    })


    $('#autho-btn').click(function(){
        ///////////////////////////////
        //          SCOPES
        ///////////////////////////////
        scopes = [
            'user-modify-playback-state',
            'playlist-read-private',
            'playlist-modify-public',
            'playlist-read-collaborative',
            'user-read-currently-playing',
            'user-read-playback-state'
        ]
        //   SETUP
        //user-modify-playback          to ensure shuffle is off, user-read will validate throughout, 
        //playlist-read-private         to make new duplicate from old baselist content
        
        //   RUN-TIME
        //playlist-modify-public        new playlist will be public while manipulating
        //user-read-currently-playing   for UI presentation
        //user-read-playback-state      for timing playlist shifts.

        window.location.href = "https://accounts.spotify.com/authorize?client_id=757af020a2284508af07dea8b2c61301&redirect_uri=http://localhost:8000/" + "&scope=" + scopes.join('%20') + "&response_type=token&state=123"

        // As the redirected url will contain the access code, href will return token with getToken(), so start listing playlists
        // To scale, if I'm about to run a global timer on how long an object exists, 
        //  I could create the model the moment of authorization. If the session isn't
        //   followed through, I can refresh the access codes amongst the active user-base
        // Any ways, with the access code saved, I can redirect the user right after activation
        //   to another page with a cleaner url.


    })
    
    $('.playlist-btn').click(function(){
        callPlaylist(offset)
        offset += 20
    })

    $('#blanklist-btn').click(function(){
        $('#user-playlists').slideUp(200)
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
        else if(ajax_post['puri'] == "new"){
            // Make new playlist, update ajax[puri] with the new playlist URI
        }
        else if(ajax_post['puri'].substring(0,7) == "spotify"){
            // Base playlist has been picked, make a new one with the same contents
            // Save new uri as ajax[puri]
        }
        
            // LAUNCH IF NO STOPS
        else{
            // launchSession(ajax_post);
            // Check models for session with existing sid
            // FIXME: Assume sids will be unique FOR NOW 

            // Create new playlist
            $.ajax({
                method: "POST",
                url: "https://api.spotify.com/v1/playlists",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                success: function(){

                },
                error : function(){
                    
                }
            })

            // Create session model
            $.ajax({
                method: "POST",
                url: 'ajax_new_session',
                data:{
                    data: JSON.stringify(ajax_post),
                },
                success : function(){
                    console.log("Session POST sent")

                },
                error : function(xhr, errmsg, err,json){
                    console.log(xhr.status + ': ' + xhr.responseText)

                },
            })
            console.log(ajax_post['pname'], ajax_post['sid'])
        }
        // Validate entries

    })
    $('#join-btn').click(function(){
        // Prompt for 6-digit unique key
        var sid = window.prompt("What is the party's unique 6 digit code?")
        // Redirect to ranklist
        if ( sid.length == 6){
            window.location.href = "127.0.0.1:8000/link/" + sid;
        }
        else console.log("need 6 digit key");
    })
})