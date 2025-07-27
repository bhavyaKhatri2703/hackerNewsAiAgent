from dotenv import load_dotenv
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from openai import OpenAI
from recieve import generateEmbeddings, connect_db

load_dotenv()


openai = OpenAI()

# Define search tool
# @tool(description="Use this to search Hacker News when user asks for news on a topic.")
def search(query: str, interest: str):
    embed = generateEmbeddings(query)
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT interest, title, content, url, (embedding <=> %s::vector) AS distance
        FROM stories
        WHERE interest = %s
        ORDER BY distance ASC
        LIMIT 4;
    """, (embed, interest))
    results = cursor.fetchall()
    conn.close()
    return results



# Define summarize tool
@tool(description="Use this when user asks to summarize news related to a topic.")
def summarize(query: str, interest: str):
    results = search.invoke({"query": query, "interest": interest})
    combined = ""
    for story in results:
        combined += story[0] + "\n" + story[1] + "\n" + story[2] + "\n" + story[3] + "\n\n"

    summary = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Summarize the following Hacker News posts."},
            {"role": "user", "content": combined},
        ]
    )
    return summary.choices[0].message.content

# Tool list
tools = [search, summarize]

# Language model
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an assistant that decides whether to search or summarize Hacker News."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

# LLM
# llm = ChatOpenAI(model="gpt-4o")

# # Your tools (already defined earlier)
# tools = [search, summarize]

# # Create agent with prompt, llm, and tools
# agent = create_tool_calling_agent(prompt=prompt, llm=llm, tools=tools)
# agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# # Sample inputs (usually from GET request)
# query = "Latest Projects in Go?"
# interest = "GoLang"

# # Build user message for decision-making
# user_input = f"""Use the exact query and interest below to decide.
# Query: "{query}"
# Interest: "{interest}"
# Should I search or summarize?"""

# # Run the agent
# response = agent_executor.invoke({
#     "input": user_input,
#     "query": query,
#     "interest": interest
# })


# print(response)
