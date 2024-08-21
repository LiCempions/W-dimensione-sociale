document.getElementById("username").innerText = sessionStorage.getItem("username");

/* 
===========================================
- Listener di eventi nella barra laterale -
===========================================
*/
//#region - Listener di eventi nella barra laterale

document.getElementById("sidebar-pinboard").addEventListener("click", ()=>{
    window.location.href = "/frontend/homepage.html";
})

document.getElementById("sidebar-friends").addEventListener("click", ()=>{
    window.location.href = "/frontend/friendsList.html";
})

document.getElementById("sidebar-profile").addEventListener("click", ()=>{
    const sParams = new URLSearchParams(window.location.search);
    sParams.set("user", sessionStorage.getItem("username"));
    window.location.href = "/frontend/homepage.html?" + sParams.toString();
})

document.getElementById("sidebar-logout").addEventListener("click", ()=>{
    sessionStorage.removeItem("username")
    window.location.href = "/frontend/index.html";
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

function firstOccurrence(string, searchStrings/* array */, startPos) {
    // Thank you JS for not letting regexes in indexOf
    let indices = [];
    let found;
    let smallest;

    // Find the first occurrence of each searchString starting from startPos
    for (const curr of searchStrings) {
        found = string.indexOf(curr, startPos);
        if (found == -1) {found = string.length};
        indices.push(found);
    }
    
    // Select the firstest occurence and return it
    smallest = indices[0];
    for (const curr of indices) {
        if (curr < smallest) {smallest = curr};
    }

    return smallest;
}

function highlightTags(text/*String*/) {
    let segments = [];
    const stopChars = ' \n.,;:!?';
    let stop = 0;
    let start = firstOccurrence(text, ['#','@'], stop);
    const sParams = new URLSearchParams(window.location.search);
    const tagTypes = { '@':"user", '#':"hashtag" }

    if (start == text.length) { return text };
    
    while (stop < text.length){
        segments.push( text.slice(stop, start) );
        
        stop = firstOccurrence(text, stopChars, start);
        if (start >= text.length) break;
        segments.push( text.slice(start, stop) );
        
        start = firstOccurrence(text, ['#','@'], stop);
    }
    
    
    for (let i = 1; i < segments.length; i=i+2) {
        const tagType = tagTypes[ segments[i][0] ]

        sParams.set( tagType, segments[i].slice(1) );
        
        segments[i] = `<a class='tag' href='frontend/homepage.html?${sParams.toString()}'>${segments[i]}</a>`;

        sParams.delete(tagType);
    }
    
    return segments.join("");
}