function getToken(){
    var codeInd = window.location.href.indexOf("=")
    var codeEndInd = window.location.href.indexOf("&",codeInd)
    var token = window.location.href.substring(codeInd+1,codeEndInd)
    // if (token.length !== 210)
    //     return -1;
    return token;
}

window.opener.postMessage(getToken(),"*")