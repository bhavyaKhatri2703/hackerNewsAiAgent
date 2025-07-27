package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
)

type interest struct {
	Name string `json:"name"`
}

type question struct {
	Name string `json:"name"`
	Text string `json:"text"`
}

func addInterest(c *gin.Context) {
	var newInterest interest

	err := c.BindJSON(&newInterest)

	if err != nil {
		fmt.Println(err)
		return
	}

	scrapeAndPublish(newInterest.Name, 123) // random or same user id for now
	c.IndentedJSON(http.StatusCreated, newInterest)

}

func askQuestion(c *gin.Context) {
	var newQ question

	err := c.BindJSON(&newQ)
	if err != nil {
		fmt.Println(err)
		return
	}

	conn, err := grpc.Dial("localhost:50051", grpc.WithInsecure())
	if err != nil {
		fmt.Println("Could not connect:", err)
		return
	}
	defer conn.Close()

	client := NewQuestionServiceClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	resp, err := client.Ask(ctx, &QuestionRequest{
		Name: newQ.Name,
		Text: newQ.Text,
	})
	if err != nil {
		fmt.Println("gRPC call failed:", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"answer": resp.Answer})
}

func main() {
	router := gin.Default()
	router.Use(cors.Default())
	router.POST("/interest", addInterest)
	router.POST("/ask", askQuestion)
	router.Run("localhost:8081")
}
