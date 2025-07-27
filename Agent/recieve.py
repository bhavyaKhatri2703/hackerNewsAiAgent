import pika
import psycopg2
import json
from openai import OpenAI
import dotenv


dotenv.load_dotenv()
client = OpenAI()

def generateEmbeddings(text):
    response = client.embeddings.create(
        input = text,
        model = "text-embedding-ada-002",
    )

    return response.data[0].embedding

def connect_db():
    conn = psycopg2.connect(
            host="localhost",
            database="hackernews",
            user="postgres",
            password="123"
        )
    return conn
def create_tables(conn):
    """Create tables if they don't exist"""
    cursor = conn.cursor()

    # Create stories table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stories (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            interest VARCHAR(255),
            title TEXT,
            url TEXT,
            content TEXT,
            embedding vector(1536)

        )
    """)

    conn.commit()
    cursor.close()

    print("Tables created/verified")


def save_story(conn,message_data) :
    cursor = conn.cursor()

    print(message_data['stories'][0])
    interest = message_data['interest']
    user_id = message_data['user_id']

    for story in message_data['stories']:
        textToEmbedd = story['title']+story['content']
        embedding = generateEmbeddings(textToEmbedd)

        cursor.execute("""
         INSERT INTO stories (user_id, interest, title, url, content, embedding)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,(user_id, interest, story['title'], story['url'], story['content'], embedding)
        )


    conn.commit()
    cursor.close()


def connectToRabbitMQ():

    conn = connect_db()
    create_tables(conn)
    connetion = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connetion.channel()

    channel.queue_declare(queue='storiesJobQ')

    def callback(ch, method, properties, body):
        message_data = json.loads(body.decode('utf-8'))
        print(message_data)

        save_story(conn,message_data)
        conn.close()

        print("data saved")

    channel.basic_consume(queue='storiesJobQ', on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == "__main__":

    connectToRabbitMQ()
