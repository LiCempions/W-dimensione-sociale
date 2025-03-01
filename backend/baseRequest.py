import mysql.connector
from types import FunctionType

def baseRequest(query:str, queryArgsMap:tuple[str, ...]|None, config:dict, errorMsg:str|None = None):
    def decorator(func: FunctionType):
        def inner(requestArg: dict|str):
            try:
                conn = mysql.connector.connect(**config)
                cursor = conn.cursor()
                if isinstance(requestArg, dict):
                    assert queryArgsMap is not None, "queryArgsMap must be provided if requestArg is a dict in " + func.__name__
                    queryArgs = [requestArg[arg] for arg in queryArgsMap]
                else:
                    queryArgs = [requestArg]
                cursor.execute(query, queryArgs)
                
                return func(conn=conn, cursor=cursor)
            except mysql.connector.Error as err:
                return {"msg": (errorMsg or f'Errore durante la procedura "{func.__name__}"') + f': {err}'}
            finally:
                cursor.close()
                conn.close()
        return inner
    return decorator

quit()

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
