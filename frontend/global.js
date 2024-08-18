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
    emptyContent()
    loadSpecificPosts(sessionStorage.getItem("username"))
    document.getElementById("location").innerText = "Profilo"
})

document.getElementById("sidebar-logout").addEventListener("click", ()=>{
    sessionStorage.removeItem("username")
    window.location = "index.html";
})
//#endregion