from fastapi import FastAPI
import mysql.connector.cursor
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from dataTypes import *
from baseDbRequest import queryDB
from callbackRequest import callbackRequest

SQLconn = mysql.connector.connection.MySQLConnection
SQLcurs = mysql.connector.cursor.MySQLCursor
DBerror = mysql.connector.Error

# =========================================
# ---------------- Sistema ----------------
# =========================================


app = FastAPI()

config = {
    "host": "localhost",
    "port": "3306",
    "user": "guest",
    "password": "pythonExpleo",
    "database": "socialNet"
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================
# ----------------- Rotte -----------------
# =========================================

# Accesso----------------------------------
#rotta di registrazione
@app.post("/api/v1/register")
def registrazione(user:userRegister):
    res = queryDB("INSERT INTO users(username, email, password) VALUES (%s, %s, %s)", (user.username, user.email, user.password), config, False)
    if isinstance(res, DBerror):
        return {"msg": f"Errore durante la registrazione: {res}"}
    else:
        return {"msg": f"Registrazione avvenuta con successo per {user.username}"}

# Rotta di login
@app.post("/api/v1/login")
def login(user:userCredentials):
    res = queryDB("SELECT username FROM users WHERE username LIKE %s AND password LIKE %s", (user.username, user.password), config)
    if isinstance(res, DBerror):
        return {"msg": f"Errore durante il login: {res}"}
    elif res is not None:
        return {"msg": "Accesso effettuato con successo!", "ok": True}
    else:
        return {"msg": "Credenziali non valide", "ok": False}

# Visualizzazione utenti ------------------
#rotta di stampa tutti utenti
@app.get("/api/v1/allusers")
def allUsers():
    res = queryDB("SELECT username FROM users", None, config)
    if isinstance(res, DBerror):
        return {"msg": f"Errore durante la lettura degli utenti: {res}"}
    else:
        userList = [user[0] for user in res]
        return {"users":userList}

# Post ------------------------------------
#rotta di bacheca (stampa di tutti i post)
@app.get("/api/v1/bacheca")
def bacheca():
    res = queryDB("SELECT user_id, post_text, post_id FROM posts ORDER BY post_id DESC", None, config)
    if isinstance(res, DBerror):
        return {"msg": f"Errore durante il caricamento della bacheca: {res}"}
    else:
        postList = [ {"auth": post[0], "postText": post[1], "postID": post[2]} for post in res ]
        return {"posts":postList}

#rotta di stampa di post specifici
@app.get("/api/v1/posts/{username}")
def getPosts(username: str):
    res = queryDB("SELECT post_text, post_id FROM posts WHERE user_id LIKE %s ORDER BY posts.post_id DESC", [username], config)
    if isinstance(res, DBerror):
        return {"msg": f"Errore durante la lettura dei post: {res}"}
    else:
        postList = [{"auth": username, "postText": post[0], "postID": post[1] } for post in res]
        return {"posts":postList}

@app.get("/api/v2/posts")
def getPosts(user: str|None=None, hashtags:str|None = None, limit:int=20, offset: int=0):
    SEPARATOR = '", "'
    hashtags = hashtags.split(",") if hashtags else None
    query = ["SELECT posts.user_id, posts.post_text, posts.post_id FROM posts"]

    if hashtags:
        query.append(f"INNER JOIN (SELECT COUNT(*) AS tags_found, post_id FROM hashtags_links WHERE hashtag IN (\"{ SEPARATOR.join(hashtags) }\") GROUP BY post_id HAVING tags_found = {len(hashtags)}) AS tagged ON posts.post_id = tagged.post_id")
    if user:
        query.append(f"WHERE posts.user_id = \"{user}\"")
    
    query.append(f"ORDER BY posts.post_id DESC LIMIT {limit} OFFSET {offset}")
    query = " ".join(query)

    def _get_posts(cursor:SQLcurs):
        posts = cursor.fetchall()
        postList = [{"auth": post[0], "postText": post[1], "postID": post[2] } for post in posts]
        return {"posts": postList}

    return callbackRequest(query, None, config, _get_posts)

# Orco can mai vista una cosa meno sicura di filteredPosts

#rotta di creazione post
@app.post("/api/v1/post")
def newPost(post: post):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "INSERT INTO posts(user_id, post_text) VALUES (%(username)s, %(postText)s)"
        cursor.execute(query, dict(post))

        if post.hashtags is not None:
            # Deduplicazione degli hashtag
            hashtags = list(set(post.hashtags))
            cursor.execute("SELECT LAST_INSERT_ID() INTO @post_id")
            query = "INSERT INTO hashtags_links (hashtag, post_id) VALUES (%s, @post_id)"
            cursor.executemany(query, hashtags)
        
        conn.commit()
        return {"msg": "Post aggiunto con successo"}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante l'aggiunta del post: {err}"}
    finally:
        cursor.close()
        conn.close()

    # res = queryDB("INSERT INTO posts(user_id, post_text) VALUES (%s, %s)", (post.username, post.postText), config, False)
    # if isinstance(res, DBerror):
    #     
    # else:
    #     return {"msg": "Post aggiunto con successo"}

# Risposte --------------------------------
#rotta di creazione risposta
@app.post("/api/v1/answer")
def newAnswer(answer: answer):
    return callbackRequest(
        "INSERT INTO answers(user_id, answer_text, answer_to) VALUES (%s, %s, %s)",
        [answer.username, answer.answerText, answer.postId],
        config, None, "new_answer"
        )

#rotta di visualizzazione risposte
@app.get("/api/v1/getAnswers/{postId}")
def getAnswers(postId:str):
    def _get_answers(cursor:SQLcurs):
        answers = cursor.fetchall()
        return {"answers": [{"auth": answer[0], "answerText": answer[1], "answerID": answer[2]} for answer in answers]}
    return callbackRequest(
        "SELECT user_id, answer_text, answer_id FROM answers WHERE answer_to = %s ORDER BY answer_id DESC",
        [postId],
        config, _get_answers
        )

# Messaggi --------------------------------
#rotta di creazione messaggio
@app.post("/api/v1/message")
def chat(message: message):
    return callbackRequest(
        "INSERT INTO messages(user_id, recipient_id, message_text) VALUES (%s, %s, %s)",
        [message.userAuth, message.userDest, message.DMText],
        config, None, "chat"
        )

#rotta di visualizzazione messaggi
@app.post("/api/v1/messages")
def showMessages(users: doubleUser):
    def _show_messages(cursor:SQLcurs):
        messages = cursor.fetchall()
        return {"messages": [{"auth": message[0], "dest": message[1], "text": message[2]} for message in messages]}
    
    return callbackRequest(
        "SELECT user_id, recipient_id, message_text FROM messages WHERE (user_id LIKE %s AND recipient_id LIKE %s) OR (user_id LIKE %s AND recipient_id LIKE %s) ORDER BY message_id",
        [users.username1, users.username2, users.username2, users.username1],
        config, _show_messages
        )

# Likes -----------------------------------
#rotta di visualizzazione likes
@app.post("/api/v1/getLikes")
def getLikes(likeData: likeData):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "SELECT user_id FROM likes WHERE post_id = %s LIMIT 3"
        values = [likeData.postId]
        cursor.execute(query, values)
        users = cursor.fetchall()
        userList = [user[0] for user in users]

        query = "SELECT COUNT(*) FROM likes WHERE post_id = %s"
        cursor.execute(query, values)
        likesNumber = cursor.fetchall()

        query = "SELECT COUNT(*) FROM likes WHERE post_id = %s AND user_id = %s"
        values = [likeData.postId, likeData.username]
        cursor.execute(query, values)
        liked = cursor.fetchone()[0] == 1

        return {"likesNumber": likesNumber[0][0], "userList": userList, "userLiked": liked}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante la lettura dei likes: {err}"}
    finally:
        cursor.close()
        conn.close()

#rotta di visualizzazione like risposte
@app.post("/api/v1/getAnswerLikes")
def getLikes(likeData: likeData):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "SELECT COUNT(*) FROM answer_likes WHERE answer_id = %s"
        values = [likeData.postId]
        cursor.execute(query, values)
        likesNumber = cursor.fetchone()[0]

        query = "SELECT COUNT(*) FROM answer_likes WHERE answer_id = %s AND user_id = %s"
        values = [likeData.postId, likeData.username]
        cursor.execute(query, values)
        liked = cursor.fetchone()[0] == 1

        return {"likesNumber": likesNumber, "userLiked": liked}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante la lettura dei likes della risposta: {err}"}
    finally:
        cursor.close()
        conn.close()

#rotta di aggiunta like
@app.post("/api/v1/like")
def likePost(likeData: likeData):
    return callbackRequest(
        "INSERT INTO likes(user_id, post_id) VALUES (%s, %s)",
        [likeData.username, likeData.postId],
        config, None, "like_post"
        )

#rotta di aggiuta like a risposta
@app.post("/api/v1/likeAnswer")
def likeAnswer(likeData: likeData):
    return callbackRequest(
        "INSERT INTO answer_likes(user_id, answer_id) VALUES (%s, %s)",
        (likeData.username, likeData.postId),
        config, None, "like_answer"
    )


# Amici -----------------------------------
#rotta di richiesta amici
@app.get("/api/v1/friendsOf/{username}")
def getFriends(username: str):
    def _get_friends(cursor:SQLcurs):
        users = cursor.fetchall()
        userList = [user[0] if user[0]!=username else user[1] for user in users]
        return {"userList": userList}
    return callbackRequest(
        "SELECT user_id_1, user_id_2 FROM friends WHERE user_id_1 = %s OR user_id_2 = %s",
        [username, username],
        config, _get_friends
        )

#rotta di aggiunta amici
@app.post("/api/v1/addFriend")
def addFriend(usernames: doubleUser):
    return callbackRequest(
        "INSERT INTO friends(user_id_1, user_id_2) VALUES (%s, %s)",
        [usernames.username1, usernames.username2],
        config, None, "add_friend"
        )

#rotta di rimozione amici
@app.post("/api/v1/removeFriend")
def removeFriend(usernames: doubleUser):
    return callbackRequest(
        "DELETE FROM friends WHERE (user_id_1 = %s AND user_id_2 = %s) OR (user_id_1 = %s AND user_id_2 = %s) LIMIT 1",
        [usernames.username1, usernames.username2, usernames.username2, usernames.username1],
        config, None, "remove_friend"
        )
