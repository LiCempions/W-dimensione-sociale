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

async function loadFriends(user){
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/friendsOf/${user}`)
        if (response.ok) {
            const data = await response.json()

            data.userList.forEach(curr => {
                const friend = document.createElement("div");
                
                const name = document.createElement("h6");
                const message = document.createElement("button");
                const remove = document.createElement("button");

                const params = new URLSearchParams("");
                params.set("user", curr);

                friend.className = "justify-content-center align-items-center friend-list-item"

                name.innerText = curr;
                name.className = "flex-fill";

                message.className = "btn main-color-bg btn-wave-icon mx-1";
                remove.className = "btn btn-danger btn-wave-icon mx-1";

                message.onclick = ()=>{
                    window.location.href = '/frontend/messages.html?' + params.toString();
                };
                remove.onclick = ()=>{removeFriend(curr)};

                message.innerHTML = '<img src="assets/messages.svg" alt="chat" class="addfriend">';
                remove.innerHTML = '<img src="assets/removefriend.svg" alt="remove" class="addfriend">';

                friend.appendChild(name);
                friend.appendChild(message);
                friend.appendChild(remove);

                document.getElementById("friendsList").appendChild(friend);
            })

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

            document.getElementById("searchUsers").addEventListener("input", ()=>{
                const toSearch = document.getElementById("usersList").children;
                const searchBar = document.getElementById("searchUsers");

                for (let i = 1; i < toSearch.length; i++) {
                    const curr = toSearch.item(i);
                    curr.style.display = curr.querySelector("h6").innerText.toLowerCase().includes(searchBar.value.toLowerCase()) ? "flex":"none";
                }
            })

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

                document.getElementById("usersList").appendChild(user);
            })

        } else {
            console.error("Errore nel database: ", response.statusText);
        }
    } catch (err) {
        console.error("Errore nel carimento degli utenti: ", err);
    }
}


window.onload = async () => {
    const friendList = await loadFriends(sessionStorage.getItem("username"));
    loadUsers(friendList);
}