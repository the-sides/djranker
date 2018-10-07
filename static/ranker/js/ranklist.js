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


function refreshRanklist(sid){
    // var rv = ""
    $.ajax({
        method: "GET",
        url: 'ajax_refresh_ranklist/'+sid,
        success : function(json){
            console.log(json)
            // rv = json['token']
        },
        error : function(xhr, errmsg, err,json){
            console.log(xhr.status + ': ' + xhr.responseText)
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

function getToken(sid){
    // GET Latest token from db
    // use token in spotify call and catch the new one
    // POST new!!!! latest token into db for next call
    //    THIS TRANSACTION MUST HAPPEN
    $.ajax({
        method: "GET",
        url: 'ajax_get_token/' + sid,
        success : function(json){
            console.log("Ajax get successooooo")
            console.log(json)
            return json.token;
        },
        error : function(xhr, errmsg, err,json){
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
        error : function(xhr, errmsg, err,json){
            console.log(xhr.status + ': ' + xhr.responseText)
        }
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

$(document).ready(function(session){ 
    // Upon launch,
    //   optain sid while recieving token, playlist ID ('puri'), and party name
    var sid = window.location.href.substr(-6)
    var token = refreshRanklist(sid)
    getToken(sid);
    var results = {};
    
    // Results are accessable globally
    // Search process functions


    function saveResults(data){
        $(".result").remove();
        results = data;
    }

    function clearResults(){
        $("#drop-results").css("display","none")
    }

    function displayResults(){
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
            $('#result-table').append("<tr></tr>")
            cell = $('tr:last')
            cell.append("<td>"+song.name+"</td>")
            cell.append("<td>"+song.artists[0].name+"</td>")
            cell.append("<td><button class='requested'>REQUEST</button></td>")
            // The button will request details corresponding to the <tr> parent
            cell.addClass("result").attr("id","track"+i)
            console.log(song.name, " - ", song.artists[0].name)
        }
    }

    //Used once a request is submitted
    $('#drop-results').on('click','.requested',function(){
        clearResults();
        console.log("Requests hidden")
    })
    // Used to hide results from a search       WHAT? NOT DONE? I THOUGHT IT WORKED
    // $('#hide-results').click()
    //Research JS scopes on global variables. By-reference or by-value? Passing parameters or otherwise?



    $('#authorize').click(function(session){
        window.location.href = "https://accounts.spotify.com/authorize?client_id=757af020a2284508af07dea8b2c61301&redirect_uri=http://localhost:8000/list&scope=user-read-private%20user-read-email&response_type=token&state=123"
        // $.ajax({
        //     // I'm not sure if this should be done with a curl call
        // })
        var codeInd = window.location.href.indexOf("=")
        var codeEndInd = window.location.href.indexOf("&",codeInd)
        var token = window.location.href.substring(codeInd+1,codeEndInd)
        saveToken(token,session)
        console.log(session.token)
    })

    $('#start-session').click(function(session){
        // if(token == ""){
        //     window.alert("COME BACK WHEN YOU AUTHORIZE YOUR ACCOUNT");
        // }
        // else{
            // Ask base playlist or blank
            // BLANK
            // sessionID = Math.random().toString(36).replace('0.','').substring(0,6)
            window.alert(session.token)
        // }

    })
    $('#req-btn').click(function(){
        searchStr = $('#search-str').val().replace(/ /g, "%20")//split(' ').join('%20')
        URL = "https://api.spotify.com/v1/search?q=" + searchStr + "&type=track&market=US&limit=10"
        console.log(URL)
        token = 'BQB-y-YCBBpXxTr9iaCBSN4Br34a3zpS_U3cFhtWXEGrKDypRRFsKVsFAP_2enQJdrnMl9rQMjhTbtFCEZjDlsEnOzPj3_6SWDOOhAfEnI7LkfTzyWcl5HaE09rnoPgZwF1xSlwvaV2ndUoT5qcJAQ3EQy3NO1uNZtcx0LmD1tD1dP-B0d04nB0hbGi8sr1rN-QVr-Fie1-tagUBQBlIhM7LojGiuPQWBJLz6-xG0-YPP-YGPkETKQMvYoMYZxyLVwFBLR0kD-RxT3rusCjQH4LqbPY4RBPwGmt9Hamuarozi3B5IfRaBmTawZCrI6NgxxrgxmD_epU18PQQVbTcst-d23CI4FyxDQ4tGRCiN1Iga9Czzpgb4Wjp_QA12XsjaFfSoJL0s1CjVwGPNkgCYQZId7h73QBQBlIhM7LojGiuPQWBJLz6-xG0-YPP-YGPkETKQMvYoMYZxyLVwFBLR0kD-RxT3rusCjQH4LqbPY4RBPwGmt9Hamuarozi3B5IfRaBmTawZCrI6NgxxrgxmD_epU18PQQVbTcst-d23CI4FyxDQ4tGRCiN1Iga9Czzpgb4Wjp_QA12XsjaFfSoJL0s1CjVwGPNkgCYQZId7h73Q'
        $.ajax({
            method: "GET",
            url: URL ,
            headers: {
                'Accept': 'application/json' ,
                'Content-Type': 'application/json',
                // Token will depend on the user hosting
                'Authorization': 'Bearer '+ token
            },
            success : function(json){
                console.log("Search returned")
                saveResults(json)
                displayResults(results)
            },
            error : function(xhr, errmsg, err) { console.log(xhr.status + ': ' + xhr.responseText); }

            
        })
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
})
