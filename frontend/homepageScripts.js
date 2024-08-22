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
        await newPost();
        form.reset();
        loadPinboard();
    });

    const sep = document.createElement("hr");
    sep.className = "text-secondary separator ";

    document.getElementById("content").appendChild(form);
    document.getElementById("content").appendChild(sep);
}

// Generazione caselle
function generatePost(postData) {
    const post = document.createElement("div");
    post.className = "card post mt-2 ";
    let testo;

    postData.postText = highlightTags(postData.postText);
    
    post.innerHTML = `
    <div class="card-header " onclick="setSParam('user', '${postData.auth}')">
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
        <p id="${postData.postID}-likesList" class="likes-list">Piace a: ...</p>
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
    answerAuth.addEventListener("click", ()=>{setSParam("user", answerData.auth)});

    answerText.innerHTML = highlightTags(answerData.answerText);

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
        const likesData = {
            "postId": postID.toString(),
            "username": sessionStorage.getItem("username")
        }
        const response = await fetch(`http://127.0.0.1:8000/api/v1/getLikes`,
            {"method":"POST", "headers":{"Content-Type":"application/json"}, "body":JSON.stringify(likesData)}
        )

        if (response.ok) {
            const data = await response.json()
            document.getElementById(`${postID}-likesNum`).innerText = data.likesNumber;
            document.getElementById(`${postID}-likesList`).innerText = "Piace a: "+data.userList.join(", ");
            document.getElementById(`${postID}-likeBtn`).disabled = data.userLiked;
        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nel carimento dei likes: ", err);
    }
}

async function loadAnswerLikes(answerID) {
    try {
        const likesData = {
            "postId": answerID.toString(),
            "username": sessionStorage.getItem("username")
        }
        const response = await fetch(`http://127.0.0.1:8000/api/v1/getAnswerLikes`,
            {"method":"POST", "headers":{"Content-Type":"application/json"}, "body":JSON.stringify(likesData)}
        )

        if (response.ok) {
            const data = await response.json()
            document.getElementById(`${answerID}-answerLikesNum`).innerText = data.likesNumber;
            document.getElementById(`${answerID}-answerLikeBtn`).disabled = data.userLiked;
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
    console.log("Started");
    console.log(document.getElementById("newPostContent"));

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

// Inizializzazione -----------------------
window.onload = ()=>{
    const params = new URLSearchParams(window.location.search);
    params.get("user") == null ? loadPinboard() : loadUserPinboard(params.get("user"));
}

//#endregion