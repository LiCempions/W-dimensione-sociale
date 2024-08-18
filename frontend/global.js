document.getElementById("username").innerText = sessionStorage.getItem("username");

/* 
===========================================
- Listener di eventi nella barra laterale -
===========================================
*/
//#region - Listener di eventi nella barra laterale

document.getElementById("sidebar-pinboard").addEventListener("click", loadPinboard)

document.getElementById("sidebar-friends").addEventListener("click", friendList)

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