import mysql.connector
import mysql.connector.cursor
from types import FunctionType
from typing import TypeAlias

BASE_TYPES_TUPLE = (str, int, float, bool)

def baseRequest(query:str, config:dict[str, str], bodyType:TypeAlias, queryArgsMap:tuple[str, ...]|None=None, errorMsg:str|None = None):
    def decorator(func: FunctionType):
        def inner(requestBody: bodyType):
            try:
                conn = mysql.connector.connect(**config)
                cursor = conn.cursor()
                if requestBody is None:
                    cursor.execute(query)
                else:
                    if isinstance(requestBody, BASE_TYPES_TUPLE):
                        queryArgs = [requestBody]
                    else:
                        assert queryArgsMap is not None, "queryArgsMap must be provided if requestBody is provided in " + func.__name__
                        dictBody = dict(requestBody)
                        queryArgs = [dictBody[arg] for arg in queryArgsMap]
                    cursor.execute(query, queryArgs)
                
                return func(requestBody, conn=conn, cursor=cursor)
            except mysql.connector.Error as err:
                return {"msg": (errorMsg or f'Errore durante la procedura "{func.__name__}"') + f': {err}'}
            finally:
                cursor.close()
                conn.close()
        return inner
    return decorator

# def baseRequest_v1(query: str, callback, *args,
#                 values: tuple = (),
#                 successMsg: str = "Richiesta di {fnName} eseguita con successo",
#                 errorMsg: str = "Errore nella richiesta di {fnName}: {error}",
#                 shouldCommit: bool=True,
#                 **argk):
#     try:
#         conn = mysql.connector.connect(**config) # type: ignore
#         cursor = conn.cursor()
#         cursor.execute(query, values)
#         if callback:
#             successMsg = successMsg.format(fnName=callback.__name__)
#             errorMsg = errorMsg.format(fnName=callback.__name__)
#             callback(*args, cursor=cursor, **argk)
#         else:
#             successMsg = successMsg.format(fnName="baseRequest")
#             errorMsg = errorMsg.format(fnName="baseRequest")

#         if shouldCommit: conn.commit()
#         return {"msg": successMsg}
#     except mysql.connector.Error as err:
#         return {"msg": errorMsg.format(error=err)}
#     finally:
#         cursor.close()
#         conn.close()

# Come utilizzare---------------------------
# @app.post("testurl")
# def testfun(user: user):
#     def callback(cursor):
#         return "bellavita"
#     baseRequest("query", callback, shouldCommit=False)
