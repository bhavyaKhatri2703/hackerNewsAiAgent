from openai import OpenAI
import dotenv

dotenv.load_dotenv()
client = OpenAI()

# text from database

def generateEmbeddings(text):
    response = client.embeddings.create(
        input = text,
        model = "text-embedding-ada-002",
    )

    return response.data[0].embedding



generateEmbeddings("sample text hello")
