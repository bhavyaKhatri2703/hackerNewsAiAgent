"use client";

import type React from "react";
import { useState } from "react";
import axios from "axios";

interface NewsItem {
  interest: string;
  title: string;
  content: string;
  url: string;
  distance: number;
}

interface Interest {
  name: string;
  response: NewsItem[] | string;
  isLoading: boolean;
  question: string;
}

export default function NewsPage() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addInterest = async () => {
    if (!newInterest.trim()) return;

    setIsAdding(true);

    try {
      const response = await axios.post(
        "http://localhost:8081/interest",
        { name: newInterest },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const interest: Interest = {
        name: newInterest,
        response: "",
        isLoading: false,
        question: "",
      };

      setInterests((prev) => [...prev, interest]);
      setNewInterest("");
    } catch (error) {
      console.error("Error adding interest:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const askQuestion = async (interestName: string, question: string) => {
    if (!question.trim()) return;

    setInterests((prev) =>
      prev.map((interest) =>
        interest.name === interestName
          ? { ...interest, isLoading: true }
          : interest,
      ),
    );

    try {
      const res = await axios.post("http://localhost:8081/ask", {
        name: interestName,
        text: question,
      });

      const answer = res.data.answer;
      console.log("hello");

      setInterests((prev) =>
        prev.map((interest) =>
          interest.name === interestName
            ? { ...interest, response: answer, isLoading: false }
            : interest,
        ),
      );
    } catch (error) {
      console.error("Error asking question:", error);
      setInterests((prev) =>
        prev.map((interest) =>
          interest.name === interestName
            ? {
                ...interest,
                response: "Failed to fetch answer.",
                isLoading: false,
              }
            : interest,
        ),
      );
    }
  };

  const removeInterest = (interestName: string) => {
    setInterests((prev) =>
      prev.filter((interest) => interest.name !== interestName),
    );
  };

  const handleQuestionKeyPress = (
    e: React.KeyboardEvent,
    interestName: string,
    question: string,
  ) => {
    if (e.key === "Enter") {
      askQuestion(interestName, question);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F6EF" }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold text-black mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            HackerNews
          </h1>
          <p className="text-gray-700 text-lg">
            Add your interests and ask questions to get personalized news from
            HackerNews
          </p>
        </div>

        <div
          className="mb-8 rounded-lg shadow-md p-6 border-2"
          style={{ borderColor: "#FF6600", backgroundColor: "#FFFFFF" }}
        >
          <div className="mb-4">
            <h2
              className="text-xl font-bold text-black flex items-center gap-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <span style={{ color: "#FF6600" }}>+</span>
              Add New Interest
            </h2>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter your interest (e.g., GoLang , Node.js, AI Agents etc)"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addInterest()}
              className="flex-1 px-4 py-2 border-2 rounded-md focus:outline-none focus:border-orange-500"
              style={{ borderColor: "#FF6600" }}
              disabled={isAdding}
            />
            <button
              onClick={addInterest}
              disabled={isAdding}
              className="text-white font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#FF6600" }}
            >
              {isAdding ? "Adding..." : "Add Interest"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {interests.map((interest) => (
            <div
              key={interest.name}
              className="rounded-lg shadow-md p-6 border-2"
              style={{ borderColor: "#FF6600", backgroundColor: "#FFFFFF" }}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-xl font-bold text-black"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {interest.name}
                  </h2>
                  <button
                    onClick={() => removeInterest(interest.name)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    title="Remove interest"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder={`Ask a question about ${interest.name}...`}
                    value={interest.question}
                    onChange={(e) =>
                      setInterests((prev) =>
                        prev.map((i) =>
                          i.name === interest.name
                            ? { ...i, question: e.target.value }
                            : i,
                        ),
                      )
                    }
                    onKeyPress={(e) =>
                      handleQuestionKeyPress(
                        e,
                        interest.name,
                        interest.question,
                      )
                    }
                    className="flex-1 px-4 py-2 border-2 rounded-md focus:outline-none focus:border-orange-500"
                    style={{ borderColor: "#FF6600" }}
                    disabled={interest.isLoading}
                  />
                  <button
                    onClick={() =>
                      askQuestion(interest.name, interest.question)
                    }
                    disabled={interest.isLoading || !interest.question.trim()}
                    className="text-white font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#FF6600" }}
                  >
                    ➤
                  </button>
                </div>

                {interest.isLoading && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div
                      className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent"
                      style={{ borderColor: "#FF6600" }}
                    ></div>
                    <span>Getting latest news...</span>
                  </div>
                )}

                {!interest.isLoading && interest.response && (
                  <div
                    className="p-4 rounded-lg border-l-4"
                    style={{
                      backgroundColor: "#F6F6EF",
                      borderLeftColor: "#FF6600",
                    }}
                  >
                    <h4
                      className="font-semibold text-black mb-2"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Latest News:
                    </h4>
                    {Array.isArray(interest.response) ? (
                      interest.response.map((item, idx) => (
                        <div key={idx} className="mb-4">
                          <a
                            href={item.url}
                            className="text-orange-600 font-semibold"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.title}
                          </a>
                          <p className="text-sm text-gray-700">
                            {item.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            Relevance: {item.distance.toFixed(2)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-black whitespace-pre-line leading-relaxed">
                        {interest.response}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {interests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3
              className="text-xl font-semibold text-black mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              No interests added yet
            </h3>
            <p className="text-gray-600">
              Add your first interest above to start getting personalized news
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .container {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }

        .space-y-6 > * + * {
          margin-top: 1.5rem;
        }

        .space-y-4 > * + * {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
