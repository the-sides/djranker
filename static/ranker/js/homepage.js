$(document).ready(function(){
    $('#host-btn').click(function(){
        // Prep to make new session model.
        // Authorize user to obtain access code at the end, redirecting to ranklist with sid
        // sid = six-digit identifier or session id
        
        
        // Open or close dropdown-session-input
        var dropmenu = $('#dropdown-session-input');
        if ( dropmenu.css("display") == "none" ) dropmenu.slideDown(400);
        else dropmenu.slideUp(400);
        
        
        // Prompt for a party name and sid
        var ajax_post = {}
        ajax_post['pname'] = $('#party-name').val();
        // Validate entries
        // Ask playlist preference, blank or baselist
        //   If using blank playlist
        //     make a new playlist named after the party name
        //   If using baselist playlist
        //     save all the basesong URIs, 
        //     make new playlist with URIs
        // [future options] 
        // Build session model with above conditions
        // Provide unique 6-digit link
        // Redirect to ranklist
        
        ///////////////////////////////
        //          SCOPES
        ///////////////////////////////
        scopes = [
            'user-modify-playback-state',
            'playlist-read-private',
            'playlist-modify-public',
            'user-read-currently-playing',
            'user-read-playback-state'
        ]
        //   SETUP
        //user-modify-playback          to ensure shuffle is off, user-read will validate throughout, 
        //playlist-read-private         to make new duplicate from old baselist content
        
        //   RUN-TIME
        //playlist-modify-public        new playlist will be public while munipulating
        //user-read-currently-playing   for UI presentation
        //user-read-playback-state      for evaluating urgency

        // window.location.href = "https://accounts.spotify.com/authorize?client_id=757af020a2284508af07dea8b2c61301&redirect_uri=http://localhost:8000/list/"+ ajax_post['sid'] + "&scope=" + scopes.join('%20') + "&response_type=token&state=123"


        // var codeInd = window.location.href.indexOf("=")
        // var codeEndInd = window.location.href.indexOf("&",codeInd)
        // var ajax_post['token'] = window.location.href.substring(codeInd+1,codeEndInd)




    })
    $('#start-btn').click(function(){
        var ajax_post = {};
        ajax_post['pname'] = $('#party-name').val();
        ajax_post['sid'] = $('#sid-name').val();
        if(ajax_post['pname'] == "" ) {
            window.alert("Enter a party name")
        }
        else if(ajax_post['sid'].length != 6) {
            window.alert("Pro Tip: Most 6 digit codes are 6 digits in length.");
        }
        else{
            //Check models for session with existing sid
            console.log(ajax_post['pname'], ajax_post['sid'])
        }
        // Validate entries

    })
    $('#join-btn').click(function(){
        // Prompt for 6-digit unique key
        var sid = window.prompt("What is the party's unique 6 digit code?")
        // Redirect to ranklist
        window.location.href = "127.0.0.1:8000/link/" + sid;
    })
})