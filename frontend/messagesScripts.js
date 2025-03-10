function generateMessage(messageData) {
    const msg = document.createElement("p");
    const isSelf = messageData.auth == sessionStorage.getItem("username");
    msg.style.position = "relative";
    msg.style.alignSelf = isSelf ? "flex-end":"flex-start";
    msg.style.borderRadius = isSelf ? "1rem 1rem 0 1rem":"1rem 1rem 1rem 0";
    msg.style.borderColor = isSelf ? "var(--main-color-2)":"lightgrey";
    msg.className = "message ";
    msg.innerText = messageData.text;

    document.getElementById("chatBox").insertBefore(msg, document.getElementById("chatBox").firstChild);
}

async function loadMessages(user) {
    try {
        const chatData = {"username1": sessionStorage.getItem("username"), "username2": user}
        const response = await fetch(`http://127.0.0.1:8000/api/v1/messages`, {"method":"POST", "headers":{"Content-Type":"application/json"}, "body":JSON.stringify(chatData)})
        if (response.ok) {
            const data = await response.json();

            data.messages.forEach(current => {
                generateMessage(current)
            })
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nella lettura dei messaggi: ", err);
    }
}

async function newMessage(user) {
    try {
        const chatData = {"userAuth": sessionStorage.getItem("username"), "userDest": user, "DMText":document.getElementById("newMessageContent").value}
        const response = await fetch(`http://127.0.0.1:8000/api/v1/message`, {"method":"POST", "headers":{"Content-Type":"application/json"}, "body":JSON.stringify(chatData)})
        if (response.ok) {
            const data = await response.json();
            console.log(data.msg);
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nella lettura dei messaggi: ", err);
    }
}

const sParams = new URLSearchParams(window.location.search);

window.onload = ()=>{
    const user = sParams.get("user");

    // Location indicator with image
    document.getElementById("location").innerHTML = `
    <img src="assets/messages.svg" alt="Chat con:" h="2rem" class="d-inline-block ">
    ${user}`;

    // Send message
    document.getElementById("newPost").addEventListener("submit", (event)=>{
        event.preventDefault()
        if (document.getElementById("newMessageContent").value!="") {
            newMessage(user);
            generateMessage({"auth":sessionStorage.getItem("username"), "text":document.getElementById("newMessageContent").value});
            document.getElementById("newPost").reset();
        }
    });

    // Load messages
    loadMessages(user);
}