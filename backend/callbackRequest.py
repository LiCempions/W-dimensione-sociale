import mysql.connector
import mysql.connector.cursor
from types import FunctionType

def callbackRequest(query:str, values:tuple|None, config:dict, cursorProcessor:FunctionType|None, successMsg:str="Richiesta eseguita con successo"):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        cursor.execute(query, values)
        if cursorProcessor is not None:
            return cursorProcessor(cursor)
        else:
            conn.commit()
            return {"msg": successMsg}
    except mysql.connector.Error as err:
        return {"msg": f'Errore durante la procedura "{cursorProcessor.__name__}": {err}'}
    finally:
        cursor.close()
        conn.close()