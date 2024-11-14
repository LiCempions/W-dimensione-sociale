from pydantic import BaseModel

class userRegister(BaseModel):
    username: str
    email: str
    password: str

class userCredentials(BaseModel):
    username: str
    password: str

class post(BaseModel):
    username: str
    postText: str

class answer(BaseModel):
    username:str
    postId:str
    answerText:str

class message(BaseModel):
    userAuth: str
    userDest: str
    DMText: str

class likeDataPut(BaseModel):
    username: str
    postId: str

class doubleUser(BaseModel):
    username1: str
    username2: str
