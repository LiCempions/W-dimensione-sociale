document.getElementById("username").innerText = sessionStorage.getItem("username");

/* 
===========================================
- Listener di eventi nella barra laterale -
===========================================
*/
//#region - Listener di eventi nella barra laterale

document.getElementById("sidebar-pinboard").addEventListener("click", ()=>{
    window.location.href = "homepage.html";
})

document.getElementById("sidebar-friends").addEventListener("click", ()=>{
    window.location.href = "friendsList.html";
})

document.getElementById("sidebar-profile").addEventListener("click", ()=>{
    const sParams = new URLSearchParams(window.location.search);
    sParams.set("user", sessionStorage.getItem("username"));
    window.location.href = "homepage.html?" + sParams.toString();
})

document.getElementById("sidebar-logout").addEventListener("click", ()=>{
    sessionStorage.removeItem("username")
    window.location.href = "index.html";
})
//#endregion


/* 
===========================================
------------------ Utili ------------------
===========================================
*/

function setSParam(param /*String*/, user) {
    const params = new URLSearchParams(window.location.search);
    params.set(param, user);
    window.location.search = params.toString();
}

function firstOccurrence(string, search /* Iterable */, startPos) {
    // For each char in the string
    for (let i = startPos; i < string.length; i++) {

        // Check if any search item appears in the string, starting from the current char
        for (const currSearch of search) {
            if (    string.substr(i, currSearch.length) == currSearch   )
                return i;
        }
    }

    return string.length;
}

function highlightTags(text/*String*/) {
    let segments = [];
    const stopChars = ' \n.,;:!?@#';
    let stop = 0;
    let start = firstOccurrence(text, ['#','@'], stop);
    const sParams = new URLSearchParams(window.location.search);
    const tagTypes = { '@':"user", '#':"hashtag" }

    // let safetyI = 0

    if (start == text.length) { return text };
    
    while (stop < text.length){
        segments.push( text.slice(stop, start) );
        
        stop = firstOccurrence(text, stopChars, start+1);
        if (start >= text.length) break;
        segments.push( text.slice(start, stop) );
        
        start = firstOccurrence(text, ['#','@'], stop);

        // safety break
        // safetyI++; if (safetyI > 50) {console.warn("while broken!", text.slice(0, 20), segments); break}
    }
    
    // safetyI = 0;
    for (let i = 1; i < segments.length; i=i+2) {
        if (segments[i].length == 1) continue;  // skip single # or @ chars

        const tagType = tagTypes[ segments[i][0] ]
        
        sParams.set( tagType, segments[i].slice(1) );
        
        segments[i] = `<a class='tag' href='homepage.html?${sParams.toString()}'>${segments[i]}</a>`;
        
        sParams.delete(tagType);
        
        // safety break
        // safetyI++; if (safetyI > 50) {console.warn("for broken!", segments[i].length); break}
    }
    
    return segments.join("");
}