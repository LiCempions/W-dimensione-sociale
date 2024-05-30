document.getElementById("register").addEventListener("submit", async (event)=>{
    event.preventDefault();

    const formData = {
        "username" : document.getElementById("userReg").value,
        "email" : document.getElementById("emailReg").value,
        "password" : document.getElementById("passReg").value
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })

        if (response.ok) {
            const data = await response.json()
            console.log("Richiesta Riuscita!\n", data);
            sessionStorage.setItem("username", formData.username);
            window.location.href = "homepage.html"

        } else {
            console.error("Errore nella registrazione!")
        }
    } catch (err) {
        console.error(`Errore nel fetch: ${err}`);
    }
})

document.getElementById("login").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const username = document.getElementById("emailLog").value;
    const formData = {
        "username" : username,
        "password" : document.getElementById("passLog").value
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/login", {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "body": JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json()
            console.log(data.msg);
            if (data.ok) {
                sessionStorage.setItem("username", username);
                window.location.href = "homepage.html"
            }
        } else {
            console.error("Errore durante il login!");
        }
    } catch (err) {
        console.error("Errore nella richiesta: ", err);
    }
})

const registerCard = document.getElementById("registerCard")
const loginCard = document.getElementById("loginCard")
const breakpoint = 576;

registerCard.addEventListener("click", ()=>{
    if (visualViewport.width <= breakpoint) {
        registerCard.style.transform="rotate(0)";
        loginCard.style.transform="rotate(90deg)";
    }
})

loginCard.addEventListener("click", ()=>{
    if (visualViewport.width <= breakpoint) {
        loginCard.style.transform="rotate(0)";
        registerCard.style.transform="rotate(-90deg)";
    }
})
