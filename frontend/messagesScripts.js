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

window.onload = ()=>{
    document.getElementById("username").innerText = sessionStorage.getItem("username");

    const user = window.location.href.slice(
        window.location.href.lastIndexOf("?")+1
    );

    loadMessages(user);
    document.getElementById("location").innerHTML = `
    <img src="assets/messages.svg" alt="Chat con:" h="2rem" class="d-inline-block ">
    ${user}`;
}