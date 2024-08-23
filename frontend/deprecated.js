// Amici e chat ---------------------------
async function friendList(){
    emptyContent();
    document.getElementById("location").innerText = "Amici";
    const friendList = await loadFriends(sessionStorage.getItem("username"));
    await loadUsers(friendList);
}

function loadChat(user) {
    emptyContent();
    const innerContent = document.createElement("div");
    innerContent.className = "d-flex flex-column-reverse h-100 w-100 align-items-center";
    innerContent.id = "innerContent";
    document.getElementById("content").appendChild(innerContent);
    showNewMessageForm(user);
    const chatBox = document.createElement("div");
    chatBox.id = "chatBox";
    document.getElementById("innerContent").appendChild(chatBox);
    loadMessages(user);
    document.getElementById("location").innerHTML = `
    <img src="assets/messages.svg" alt="Chat con:" h="2rem" class="d-inline-block ">
    ${user}`;
}

// Messaggi -------------------------------
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

// Amici e utenti -------------------------
async function loadFriends(user){
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/friendsOf/${user}`)
        if (response.ok) {
            const data = await response.json()

            const friends = document.createElement("div");
            friends.className = "d-flex flex-column friend-list";

            const title = document.createElement("h5");
            title.innerText = "Amici:";
            title.className = "friend-list-item my-0 friend-list-title"
            friends.appendChild(title);

            data.userList.forEach(curr => {
                const friend = document.createElement("div");
                friend.className = "justify-content-center align-items-center friend-list-item"

                const name = document.createElement("h6");
                const message = document.createElement("button");
                const remove = document.createElement("button");

                name.innerText = curr;
                name.className = "flex-fill";

                message.className = "btn main-color-bg btn-wave-icon mx-1";
                remove.className = "btn btn-danger btn-wave-icon mx-1";

                // message.onclick = ()=>{loadChat(curr)};
                message.onclick = ()=>{
                    window.location.href = `messages.html?${curr}`;
                };
                remove.onclick = ()=>{removeFriend(curr)};

                message.innerHTML = '<img src="assets/messages.svg" alt="chat" class="addfriend">';
                remove.innerHTML = '<img src="assets/removefriend.svg" alt="remove" class="addfriend">';

                friend.appendChild(name);
                friend.appendChild(message);
                friend.appendChild(remove);

                friends.appendChild(friend);
            })

            document.getElementById("content").appendChild(friends);

            return data.userList;
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nel carimento degli amici: ", err);
    }
}

async function loadUsers(friendList) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/allusers`)
        if (response.ok) {
            const data = await response.json()

            const users = document.createElement("div");
            users.className = "d-flex flex-column friend-list mt-4";

            const titleDiv = document.createElement("div");
            const title = document.createElement("h5");
            const searchBar = document.createElement("input");

            searchBar.type = "text";
            searchBar.id = "searchUsers";
            searchBar.className = "form-control w-25";
            searchBar.placeholder = "Cerca un utente";
            searchBar.addEventListener("input", ()=>{
                const toSearch = users.children;

                for (let i = 1; i < toSearch.length; i++) {
                    const curr = toSearch.item(i);
                    curr.style.display = curr.querySelector("h6").innerText.toLowerCase().includes(searchBar.value.toLowerCase()) ? "flex":"none";
                }
            })

            titleDiv.className = "d-flex justify-content-between align-items-center friend-list-item";

            title.innerText = "Altri utenti:";
            title.className = "my-0 friend-list-title";

            titleDiv.appendChild(title);
            titleDiv.appendChild(searchBar);
            users.appendChild(titleDiv);

            data.users.forEach(curr => {
                if (friendList.includes(curr)) {
                    return
                }
                const user = document.createElement("div");
                user.className = "justify-content-center align-items-center friend-list-item"

                const name = document.createElement("h6");
                const add = document.createElement("button");

                name.innerText = curr;
                name.className = "flex-fill";

                add.className = "btn main-color-bg btn-wave-icon mx-1";

                add.onclick = ()=>{addFriend(curr)};

                add.innerHTML = '<img src="assets/addfriend.svg" alt="add" class="addfriend">';

                user.appendChild(name);
                user.appendChild(add);

                users.appendChild(user);
            })

            document.getElementById("content").appendChild(users);

        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nel carimento degli utenti: ", err);
    }
}

async function addFriend(friend) {
    try {
        const friendRequest = {
            "username1": sessionStorage.getItem("username"),
            "username2": friend
        }
        const response = await fetch(`http://127.0.0.1:8000/api/v1/addFriend`, {"method":"POST", "headers":{"Content-Type":"application/json"}, "body":JSON.stringify(friendRequest)})
        
        if (response.ok) {
            const data = await response.json()
            console.log(data.msg);

            friendList()
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nell'aggiunta dell'amic*: ", err);
    }
}

async function removeFriend(friend) {
    try {
        const unfriendRequest = {
            "username1": sessionStorage.getItem("username"),
            "username2": friend
        }
        const response = await fetch(`http://127.0.0.1:8000/api/v1/removeFriend`, {"method":"POST", "headers":{"Content-Type":"application/json"}, "body":JSON.stringify(unfriendRequest)})
        
        if (response.ok) {
            const data = await response.json()
            console.log(data.msg);

            friendList()
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nell'aggiunta dell'amic*: ", err);
    }
}

// Generazione caselle --------------------
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

// Generazione forms ----------------------
function showNewMessageForm(user) {
    const form = document.createElement("form");
    form.className = "card post";
    form.id = "newPost"
    form.innerHTML =`
        <textarea class="card-body postText " id="newMessageContent" placeholder="Scrivi un messaggio"></textarea>
        <input type="submit" value="Invia" class="card-footer btn main-color-bg text-light ">
    `;
    form.addEventListener("submit", (event)=>{
        event.preventDefault()
        if (document.getElementById("newMessageContent").value!="") {
            newMessage(user);
            generateMessage({"auth":sessionStorage.getItem("username"), "text":document.getElementById("newMessageContent").value});
            form.reset();
        }
    });

    const sep = document.createElement("hr");
    sep.className = "text-secondary separator ";

    document.getElementById("innerContent").appendChild(form);
    document.getElementById("innerContent").appendChild(sep);
}

// Utili --------------------------------
function firstOccurrence(string, searchStrings/* iterable */, startPos) {
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