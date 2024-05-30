/* 
============================================
----------- Generazione elementi -----------
============================================
*/
//#region - Generazione elementi della pagina

// Preparazione pagina
function emptyContent() {
    document.getElementById("content").innerHTML="";
}

function adaptiveTA() {
    const ta = document.getElementsByClassName("newAnswerArea");
    for (let i = 0; i < ta.length; i++) {
        const curr = ta.item(i);
        curr.addEventListener("input", ()=>{
            curr.style.height = "auto";
            curr.style.height = curr.scrollHeight.toString()+"px";
        })
    } 
}

// Generazione forms
function showNewPostForm() {
    const form = document.createElement("form");
    form.className = "card post";
    form.id = "newPost"
    form.innerHTML =`
        <div class="card-header ">
            <label class="card-title h5 " for="newPostContent">Cosa vuoi far sapere al mondo?</label>
        </div>
        <textarea class="card-body postText " id="newPostContent" placeholder="Scrivi qualcosa"></textarea>
        <input type="submit" value="Pubblica" class="card-footer btn main-bg-darken text-light ">
    `;
    form.addEventListener("submit", async (event)=>{
        event.preventDefault();
        form.reset();
        await newPost();
        loadPinboard();
    });

    const sep = document.createElement("hr");
    sep.className = "text-secondary separator ";

    document.getElementById("content").appendChild(form);
    document.getElementById("content").appendChild(sep);
}

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

// Generazione caselle
function generatePost(postData) {
    const post = document.createElement("div");
    post.className = "card post mt-2 ";
    post.innerHTML = `
    <div class="card-header " onclick="loadUserPinboard('${postData.auth}')">
        <h5 class="card-title ">${postData.auth}</h5>
    </div>
    <div class="card-body ">
        <p class="card-text ">${postData.postText}</p>
        <button class="btn main-color-bg text-light like-btn" onclick="addLike('${postData.postID}')" id="${postData.postID}-likeBtn">
            <span class="text-light text-shadow" id="${postData.postID}-likesNum"></span>
            <img src="assets/like.svg" alt="like" class="like text-light pb-1">
        </button>
    </div>
    <div class="card-footer ">
        <p id="${postData.postID}-likesList" class="flex-grow-1 ">Piace a: ...</p>
    </div>
    <div class="card-footer">
        <form class="d-flex align-items-center mb-2">
            <textarea name="New answer" id="newAnswerArea" placeholder="Scrivi una risposta" class="newAnswerArea" rows="1"></textarea>
            <input type="submit" value="Invia" class="btn main-color-bg text-light" >
        </form>
        <div  id="${postData.postID}-answerList">
        </div>
        
    </div>
    `;
    loadAnswers(postData.postID, false, true);

    // On answer submit
    post.querySelector("form").addEventListener("submit", async (event)=>{
        event.preventDefault();

        await newAnswer(postData.postID.toString(), post.querySelector("textarea").value);

        const areAllAnsLoaded = document.getElementById(postData.postID+"-answerList").childElementCount > 0;

        document.getElementById(postData.postID+"-answerList").innerHTML = "";
        loadAnswers(postData.postID, areAllAnsLoaded, true);

        post.querySelector("form").reset();
    })
    document.getElementById("content").appendChild(post);
}

function generateAnswer(postID, answerData, isFirst=false){
    const answer = document.createElement("div");
    const answerAuth = document.createElement("h6");
    const answerText = document.createElement("p");
    const answerLike = document.createElement("button");

    answer.classList.add("answer")

    answerAuth.innerText = answerData.auth;
    answerAuth.addEventListener("click", ()=>{loadUserPinboard(answerData.auth)});

    answerText.innerText = answerData.answerText;

    answerLike.className = "btn text-light like-btn-ans text-shadow";
    answerLike.id = answerData.answerID+"-answerLikeBtn";
    answerLike.innerHTML =`
        <span class="text-light text-shadow" id="${answerData.answerID}-answerLikesNum"></span>
        <img src="assets/like.svg" alt="like" class="like text-light pb-1">
        `;
    answerLike.addEventListener("click", ()=>{addAnswerLike(answerData.answerID.toString())});

    answer.appendChild(answerAuth);
    answer.appendChild(answerText);
    answer.appendChild(answerLike);

    if (isFirst) {
        const oldFirst = document.getElementById(postID+"-firstAnswer")
        if (oldFirst) { oldFirst.remove() }
        answer.id = postID+"-firstAnswer";
        document.getElementById(`${postID}-answerList`).before(answer);
    }else{
        document.getElementById(`${postID}-answerList`).appendChild(answer);
    }
}

function generateLoadMoreBar(postID) {
    const loadMore = document.createElement("div");
    
    loadMore.className="d-flex";
    loadMore.id=`${postID}-loadMoreAnswers`;
    // <div class="d-flex" id="${postID}-loadMoreAnswers">
    // </div>
    loadMore.innerHTML = `
        <hr class="flex-fill mx-2">
        <button class="btn main-color-bg rounded-pill text-light text-shadow" onclick="loadMoreAnswers(${postID}, true)">Carica altre</button>
        <hr class="flex-fill mx-2">
    `;
    document.getElementById(postID+"-answerList").after(loadMore);
}

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
//#endregion

/* 
===========================================
---------- Richieste al database ----------
===========================================
*/
//#region - Richieste al database

// Likes ----------------------------------
async function loadLikes(postID) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/getLikes/${postID}`)
        if (response.ok) {
            const data = await response.json()
            document.getElementById(`${postID}-likesNum`).innerText = data.likesNumber;
            document.getElementById(`${postID}-likesList`).innerText = "Piace a: "+data.userList.join(", ");
            document.getElementById(`${postID}-likeBtn`).disabled = data.userList.includes(sessionStorage.getItem("username"));
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nel carimento dei likes: ", err);
    }
}

async function loadAnswerLikes(answerID) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/getAnswerLikes/${answerID}`)
        if (response.ok) {
            const data = await response.json()
            document.getElementById(`${answerID}-answerLikesNum`).innerText = data.likesNumber;
            // document.getElementById(`${answerID}-likesList`).innerText = "Piace a: "+data.userList.join(", ");
            document.getElementById(`${answerID}-answerLikeBtn`).disabled = data.userList.includes(sessionStorage.getItem("username"));
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nel carimento dei likes: ", err);
    }
}

async function addLike(postID) {
    try {
        const likeData = {
            "username":sessionStorage.getItem("username"),
            "postId": postID
        }
        const response = await fetch(`http://127.0.0.1:8000/api/v1/like`, {"method":"POST", "headers":{"Content-Type":"application/json"}, "body":JSON.stringify(likeData)})
        if (response.ok) {
            const data = await response.json()
            console.log(data.msg);
            document.getElementById(`${postID}-likeBtn`).disabled = true;
            loadLikes(postID);
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nell'aggiunta del like: ", err);
    }
}

async function addAnswerLike(answerID) {
    try {
        const likeData = {
            "username":sessionStorage.getItem("username"),
            "postId": answerID // non "answerId" per poter riutilizzare una classe nel backend
        }
        const response = await fetch(`http://127.0.0.1:8000/api/v1/likeAnswer`, {"method":"POST", "headers":{"Content-Type":"application/json"}, "body":JSON.stringify(likeData)})
        if (response.ok) {
            const data = await response.json()
            console.log(data.msg);
            document.getElementById(`${answerID}-answerLikeBtn`).disabled = true;
            loadAnswerLikes(answerID);
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nell'aggiunta del like: ", err);
    }
}


// Posts ----------------------------------
async function loadPosts() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/bacheca`)
        if (response.ok) {
            const data = await response.json()
            data.posts.forEach(current => {
                generatePost(current);
                loadLikes(current.postID);
            });
            adaptiveTA();
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nel carimento della bacheca: ", err);
    }
}

async function loadSpecificPosts(user){
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/posts/${user}`)
        if (response.ok) {
            const data = await response.json()
            data.posts.reverse()
            data.posts.forEach(current => {
                generatePost(current);
                loadLikes(current.postID);
            });
            adaptiveTA();
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nel carimento della bacheca: ", err);
    }
}


// Risposte -------------------------------
async function loadAnswers(postID, loadAll=false, loadFirst=true){
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/getAnswers/${postID}`)
        if (response.ok) {
            const data = await response.json()

            if (data.answers.length>0) {
                const barExists = document.getElementById(postID+"-loadMoreAnswers") != null;
                if (!barExists && data.answers.length>1) {
                    generateLoadMoreBar(postID)
                }
                if (loadFirst){
                    generateAnswer(postID, data.answers[0], true)
                    loadAnswerLikes(data.answers[0].answerID)
                }
                if (loadAll) {
                    data.answers.slice(1).forEach(current => {
                        generateAnswer(postID, current);
                        loadAnswerLikes(current.answerID);
                    });
                }
            }

        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nel carimento della bacheca: ", err);
    }
}


// Nuovi ----------------------------------
async function newPost() {
    const data = {
        "username": sessionStorage.getItem("username"),
        "postText": document.getElementById("newPostContent").value
    }

    if (data.postText != "") {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/v1/post", {
                "method": "POST",
                "headers": {"Content-Type": "application/json"},
                "body": JSON.stringify(data)
            })
            if (response.ok) {
                console.log(await response.json());
            } else {
                console.error("Errore nel server: ", response.statusText);
            }
        } catch (err) {
            console.error("Errore nella pubblicazione: ", err);
        }
    }
}

async function newAnswer(/* String */postID, /* String */text) {
    const data = {
        "username": sessionStorage.getItem("username"),
        "postId": postID,
        "answerText": text
    }

    if (data.answerText != "") {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/v1/answer", {"method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(data) })
            if (response.ok) {
                console.log(await response.json());
            } else {
                console.error("Errore nel server: ", response.statusText);
            }
        } catch (err) {
            console.error("Errore nella pubblicazione: ", err);
        }
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

                message.onclick = ()=>{loadChat(curr)};
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
//#endregion

/* 
============================================
----------------- Composte -----------------
============================================
*/
//#region - Funzioni composte da altre

// Bacheca --------------------------------
function loadPinboard() {
    emptyContent();
    showNewPostForm();
    loadPosts(); 

    document.getElementById("location").innerText = "Bacheca";
}

function loadUserPinboard(user){
    emptyContent();
    document.getElementById("location").innerText = user;
    loadSpecificPosts(user);
}


// Risposte -------------------------------
function loadMoreAnswers(postID, loadAll) {
    const button = document.getElementById(postID+"-loadMoreAnswers").querySelector("button")
    document.getElementById(postID+"-answerList").innerHTML = "";

    if (loadAll) {
        loadAnswers(postID, loadAll);
    }
    button.onclick = ()=>{loadMoreAnswers(postID, !loadAll)};
    button.innerText = loadAll ? "Mostra una":"Carica altre";
}


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


// Inizializzazione -----------------------
window.onload = loadPinboard

document.getElementById("username").innerText = sessionStorage.getItem("username");
//#endregion

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