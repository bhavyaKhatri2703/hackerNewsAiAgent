package main

import (
	"encoding/json"
	"fmt"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

type ScrapeJob struct {
	Interest string  `json:"interest"`
	UserID   int     `json:"user_id"`
	Stories  []story `json:"stories"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func connectToQ() (*amqp.Connection, *amqp.Channel, error) {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")

	_, err = ch.QueueDeclare(
		"storiesJobQ",
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		ch.Close()
		conn.Close()
		return nil, nil, fmt.Errorf("failed to declare queue: %v", err)
	}

	return conn, ch, nil
}

func publishQ(ch *amqp.Channel, job ScrapeJob) error {
	body, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal job: %v", err)
	}

	ch.Publish(
		"",
		"storiesJobQ",
		false,
		false,
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "application/json",
			Body:         body,
		},
	)

	return nil
}

func scrapeAndPublish(searchQuery string, userid int) error {
	conn, ch, err := connectToQ()

	if err != nil {

	}

	defer conn.Close()
	defer ch.Close()

	if err != nil {
		return err
	}

	stories := getStories(searchQuery)

	job := ScrapeJob{
		Interest: searchQuery,
		UserID:   userid,
		Stories:  stories,
	}

	err = publishQ(ch, job)

	return nil
}

func main() {
	scrapeAndPublish("GoLang", 123)
}
