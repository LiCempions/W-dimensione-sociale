import mysql.connector
import mysql.connector.cursor
from types import FunctionType

def callbackRequest(query:str, values:tuple|None, config:dict, cursorProcessor:FunctionType|None, procedureName:str|None=None):
    procedureName = procedureName or cursorProcessor.__name__ or "callback generico"
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        cursor.execute(query, values)
        if cursorProcessor is not None:
            return cursorProcessor(cursor)
        else:
            conn.commit()
            return {"msg": f"Procedura \"{procedureName}\" eseguita con successo"}
    except mysql.connector.Error as err:
        return {"msg": f'Errore durante la procedura "{procedureName}": {err}'}
    finally:
        cursor.close()
        conn.close()