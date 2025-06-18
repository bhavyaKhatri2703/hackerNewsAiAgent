from langchain_core.tools import tool
from openai import OpenAI
import dotenv
from recieve import generateEmbeddings,connect_db
import pika
import psycopg2



def  search(query : str , interest : str) :
    embed = generateEmbeddings(query)
    conn  = connect_db()
    cursor = conn.cursor()

    cursor.execute("""
            SELECT interest,title,content,url ,(embedding <=> %s::vector) as distance
                FROM stories
                WHERE interest = %s
                ORDER BY distance ASC
                LIMIT 4;
        """,(embed,interest))
    results = cursor.fetchall()
    conn.close()

    return results
