package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/chromedp/cdproto/cdp"
	"github.com/chromedp/chromedp"
)

type story struct {
	Title   string `json:"title"`
	Url     string `json:"url"`
	Content string `json:"content"`
}

func getStories(searchQuery string) []story {
	ctx, cancel := chromedp.NewContext(
		context.Background(),
	)

	defer cancel()

	URL := fmt.Sprintf("https://hn.algolia.com/?dateRange=all&page=0&prefix=false&query=%s&sort=byDate&type=story", searchQuery)

	var stories []story
	var storiesNode []*cdp.Node
	err := chromedp.Run(ctx,
		chromedp.Navigate(URL),
		chromedp.WaitVisible(".Story_data", chromedp.ByQuery),
		chromedp.Nodes(".Story_data", &storiesNode, chromedp.ByQueryAll),
	)

	if err != nil {
		log.Fatal("Error:", err)
	}

	var title, content, url string

	for _, node := range storiesNode {

		err := chromedp.Run(ctx,
			chromedp.Text(".Story_title a span", &title, chromedp.ByQuery, chromedp.FromNode(node)),
		)
		url = ""
		urlctx, cancel := context.WithTimeout(ctx, 1000*time.Millisecond)
		_ = chromedp.Run(
			urlctx, chromedp.AttributeValue(".Story_title .Story_link", "href", &url, nil, chromedp.ByQuery, chromedp.FromNode(node)),
		)
		cancel()

		content = ""
		contentCtx, cancel := context.WithTimeout(ctx, 1000*time.Millisecond)
		_ = chromedp.Run(contentCtx,
			chromedp.Text(".Story_comment span", &content, chromedp.ByQuery, chromedp.FromNode(node)),
		)
		cancel()

		if err != nil {
			log.Fatal("Error:", err)
		}

		newStory := story{}
		newStory.Title = title
		newStory.Url = url
		newStory.Content = content

		stories = append(stories, newStory)
	}

	for i, s := range stories {
		fmt.Printf("[%d]\nTitle: %s\nURL: %s\nContent: %s\n\n", i+1, s.Title, s.Url, s.Content)
	}

	return stories

}
