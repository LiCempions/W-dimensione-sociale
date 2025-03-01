from fastapi import FastAPI
import mysql.connector.cursor
import mysql.connector.logger
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from dataTypes import *
from baseRequest import baseRequest

SQLconn = mysql.connector.connection.MySQLConnection
SQLcurs = mysql.connector.cursor.MySQLCursor

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
@baseRequest("INSERT INTO users(username, email, password) VALUES (%s, %s, %s)", ('username', 'email', 'password'), config, "Errore durante la registrazione")
def registrazione(user: userRegister, conn:SQLconn=None):
    conn.commit()
    return {"msg": f"Registrazione avvenuta con successo per {user.username}"}

# Rotta di login
@app.post("/api/v1/login")
def login(user: userCredentials):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "SELECT username FROM users WHERE username LIKE %s AND password LIKE %s"
        values = (user.username, user.password)
        cursor.execute(query, values)
        user = cursor.fetchone()
        if user:
            return {"msg": "Accesso effettuato con successo!", "ok": True}
        else:
            return {"msg": "Credenziali non valide", "ok": False}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante il login: {err}"}
    finally:
        cursor.close()
        conn.close()


# Visualizzazione utenti ------------------
#rotta di stampa tutti utenti
@app.get("/api/v1/allusers")
def allUsers():
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "SELECT username FROM users"
        cursor.execute(query)
        users = cursor.fetchall()
        userList = [user[0] for user in users]
        return {"users":userList}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante la lettura degli utenti: {err}"}
    finally:
        cursor.close()
        conn.close()


# Post ------------------------------------
#rotta di bacheca (stampa di tutti i post)
@app.get("/api/v1/bacheca")
@baseRequest("SELECT user_id, post_text, post_id FROM posts ORDER BY post_id DESC", None, config, "Errore durante il caricamento della bacheca")
def bacheca(cursor:SQLcurs=None):
    posts = cursor.fetchall()
    postList = [ {"auth": post[0], "postText": post[1], "postID": post[2]} for post in posts ]
    return {"posts":postList}

#rotta di stampa dei post di un utente specifico
@app.get("/api/v1/posts/{username}")
def getPosts(username: str):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "SELECT post_text, post_id FROM posts WHERE user_id LIKE %s"
        values = [username]
        cursor.execute(query, values)
        posts = cursor.fetchall()
        postList = [{"auth": username, "postText": post[0], "postID": post[1] } for post in posts]
        return {"posts":postList}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante la lettura dei post: {err}"}
    finally:
        cursor.close()
        conn.close()

# Orco can mai vista una cosa meno sicura di filteredPosts

#rotta di creazione post
@app.post("/api/v1/post")
def newPost(post: post):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "INSERT INTO posts(user_id, post_text) VALUES (%s, %s)"
        values = post.username, post.postText
        cursor.execute(query, values)
        conn.commit()
        return {"msg": "Post aggiunto con successo!"}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante l'aggiunta del post: {err}"}
    finally:
        cursor.close()
        conn.close()


# Risposte --------------------------------
#rotta di creazione risposta
@app.post("/api/v1/answer")
def newAnswer(answer: answer):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "INSERT INTO answers(user_id, answer_text, answer_to) VALUES (%s, %s, %s)"
        values = answer.username, answer.answerText, answer.postId
        cursor.execute(query, values)
        conn.commit()
        return {"msg": "Risposta aggiunta con successo!"}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante l'aggiunta della risposta: {err}"}
    finally:
        cursor.close()
        conn.close()

#rotta di visualizzazione risposte
@app.get("/api/v1/getAnswers/{postId}")
def getAnswers(postId:str):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "SELECT user_id, answer_text, answer_id FROM answers WHERE answer_to = %s ORDER BY answer_id DESC"
        values = [postId]
        cursor.execute(query, values)
        answers = cursor.fetchall()
        return {"answers": [{"auth": answer[0], "answerText": answer[1], "answerID": answer[2]} for answer in answers]}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante la lettura dei post: {err}"}
    finally:
        cursor.close()
        conn.close()


# Messaggi --------------------------------
#rotta di creazione messaggio
@app.post("/api/v1/message")
def chat(message: message):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "INSERT INTO messages(user_id, recipient_id, message_text) VALUES (%s, %s, %s)"
        values = message.userAuth, message.userDest, message.DMText
        cursor.execute(query, values)
        conn.commit()
        return {"msg":"Nuovo messaggio salvato con successo"}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante il salvataggio del messaggio: {err}"}
    finally:
        cursor.close()
        conn.close()

#rotta di visualizzazione messaggi
@app.post("/api/v1/messages")
def showMessages(users: doubleUser):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "SELECT user_id, recipient_id, message_text FROM messages WHERE (user_id LIKE %s AND recipient_id LIKE %s) OR (user_id LIKE %s AND recipient_id LIKE %s) ORDER BY message_id"
        values = users.username1, users.username2, users.username2, users.username1
        cursor.execute(query, values)
        messages = cursor.fetchall()
        messagesList = [{"auth": message[0], "dest": message[1], "text": message[2]} for message in messages]
        return {"messages": messagesList}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante la lettura dei messaggi: {err}"}
    finally:
        cursor.close()
        conn.close()


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
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "INSERT INTO likes(user_id, post_id) VALUES (%s, %s)"
        cursor.execute(query, (likeData.username, likeData.postId))
        conn.commit()
        return {"msg": "Like aggiunto con successo"}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante l'aggiunta del like: {err}"}
    finally:
        cursor.close()
        conn.close()

#rotta di aggiuta like a risposta
@app.post("/api/v1/likeAnswer")
def likeAnswer(likeData: likeData):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "INSERT INTO answer_likes(user_id, answer_id) VALUES (%s, %s)"
        cursor.execute(query, (likeData.username, likeData.postId))
        conn.commit()
        return {"msg": "Like aggiunto con successo"}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante l'aggiunta del like: {err}"}
    finally:
        cursor.close()
        conn.close()


# Amici -----------------------------------
#rotta di richiesta amici
@app.get("/api/v1/friendsOf/{username}")
def getFriends(username: str):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "SELECT user_id_1, user_id_2 FROM friends WHERE user_id_1 = %s OR user_id_2 = %s"
        values = [username, username]
        cursor.execute(query, values)
        users = cursor.fetchall()
        userList = [user[0] if user[0]!=username else user[1] for user in users]

        return {"userList": userList}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante la lettura degli amici: {err}"}
    finally:
        cursor.close()
        conn.close()

#rotta di aggiunta amici
@app.post("/api/v1/addFriend")
def addFriend(usernames: doubleUser):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "INSERT INTO friends(user_id_1, user_id_2) VALUES (%s, %s)"
        values = [usernames.username1, usernames.username2]
        values.sort()
        cursor.execute(query, values)
        conn.commit()
        return {"msg": "Amico aggiunto con successo"}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante l'aggiunta dell'amico: {err}"}
    finally:
        cursor.close()
        conn.close()

#rotta di rimozione amici
@app.post("/api/v1/removeFriend")
def removeFriend(usernames: doubleUser):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "DELETE FROM friends WHERE (user_id_1 = %s AND user_id_2 = %s) OR (user_id_1 = %s AND user_id_2 = %s) LIMIT 1"
        cursor.execute(query, (usernames.username1, usernames.username2, usernames.username2, usernames.username1))
        conn.commit()
        return {"msg": "Amico rimosso con successo"}
    except mysql.connector.Error as err:
        return {"msg": f"Errore durante la rimozione dell'amico: {err}"}
    finally:
        cursor.close()
        conn.close()
