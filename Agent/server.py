# server.py
import grpc
from concurrent import futures
import question_pb2
import question_pb2_grpc
from recieve import connectToRabbitMQ
from agent import search




class QuestionService(question_pb2_grpc.QuestionServiceServicer):
    def Ask(self, request, context):
        name = request.name
        text = request.text

        raw_results = search(text, name)  # [(interest, title, content, url, distance), ...]



        news_items = [
            question_pb2.NewsItem(
                interest=row[0],
                title=row[1],
                content=row[2],
                url=row[3],
                distance=float(row[4])
            )
            for row in raw_results
        ]

        return question_pb2.QuestionResponse(answer=news_items)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    question_pb2_grpc.add_QuestionServiceServicer_to_server(QuestionService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Python gRPC server running on port 50051")
    server.wait_for_termination()

if __name__ == "__main__":

    serve()
