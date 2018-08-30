var ajax_post = new Object;
function getToken(){
    var codeInd = window.location.href.indexOf("=")
    var codeEndInd = window.location.href.indexOf("&",codeInd)
    var token = window.location.href.substring(codeInd+1,codeEndInd)
    return token;
}
function displayResults(){
    $('#user-playlists').show() // MIGHT NOT WORK

}
$(document).ready(function(){
    
    $('#host-btn').click(function(){
        // Prep to make new session model.
        // Authorize user to obtain access code at the end, redirecting to ranklist with sid
        // sid = six-digit identifier or session id
        
        
        // Open or close dropdown-session-options
        var dropmenu = $('#dropdown-session-options');
        if ( dropmenu.css("display") == "none" ) dropmenu.slideDown(400);
        else dropmenu.slideUp(400);
                
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
        //playlist-modify-public        new playlist will be public while munipulating
        //user-read-currently-playing   for UI presentation
        //user-read-playback-state      for evaluating urgency

        window.location.href = "https://accounts.spotify.com/authorize?client_id=757af020a2284508af07dea8b2c61301&redirect_uri=http://localhost:8000/" + "&scope=" + scopes.join('%20') + "&response_type=token&state=123"

        // As the redirected url will contain the access code, href will return token with getToken(), so start listing playlists


    })
    $('#start-btn').on('click',function(){
        console.log(getToken());  
        // Authorize account
        // Ask baselist or blank
        //    if bl, print list of users playlists with corresponding buttons. 
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
            // Assume sids will be unique FOR NOW                 FIXME
            $.ajax({
                method: "POST",
                url: 'ajax_new_session',
                data:{
                    'data': JSON.stringify(ajax_post),
                },
                success : function(json){
                    console.log("Session POST sent")

                },
                error : function(xhr, errmsg, err){
                    console.log("ERROR: Session POST fail")

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