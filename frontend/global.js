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