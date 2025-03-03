import mysql.connector
import mysql.connector.cursor

def queryDB(query:str, values:tuple|None, config:dict, read:bool=True):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        cursor.execute(query, values)
        if read:
            return cursor.fetchall()
        else:
            conn.commit()
    except mysql.connector.Error as err:
        return err
    finally:
        cursor.close()
        conn.close()