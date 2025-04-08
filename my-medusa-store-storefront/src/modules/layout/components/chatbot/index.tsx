"use client"

import ChatBot from "react-chatbotify"
import { Button } from "@medusajs/ui"
import { useEffect, useState } from "react"

const BOT_URL = "http://127.0.0.1:8000/chat/agents"

export default function ChatbotChatbox() {
  let sessionId = ""
  let currentAgent = ""
  const id = "my-chatbot-id" // if not specified, will auto-generate uuidv4

  const settings = {
    isOpen: true,
    general: {
      primaryColor: "#000000",
      secondaryColor: "#000000",
      fontFamily: "Arial, sans-serif",
      showFooter: false,
    },
    botBubble: {
      simStream: true,
      streamSpeed: 30,
      animate: false,
    },
    chatWindow: {
      showScrollbar: true,
    },
    chatButton: {
      icon: "favicon.ico",
    },
    tooltip: {
      mode: "START",
      text: "How can I help you?",
    },
    header: {
      title: "Assistant",
    },
    // other sections
  }

  async function run(prompt: string) {
    let bodyRequest = {}
    if (sessionId != "") {
      bodyRequest = { query: prompt, session_id: sessionId }
    } else {
      bodyRequest = { query: prompt }
    }
    // console.log(sessionId, currentAgent)
    // console.log("Prompt: ", prompt)
    // console.log("")

    const response = await fetch(BOT_URL, {
      method: "POST",
      body: JSON.stringify(bodyRequest),
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status == 200 && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")

      let result = ""
      let done = false

      while (!done) {
        let buffer = ""
        const { value } = await reader.read()

        if (value) {
          buffer = decoder.decode(value, { stream: true })

          // console.log("Buffer: \n", buffer)

          const lines = buffer.split("\n")

          for (let line of lines) {
            if (line.trim()) {
              try {
                if (line.startsWith("data: ")) {
                  line = line.replaceAll("data: ", "")
                }
                const parsed = JSON.parse(line)
                if (parsed.done) {
                  done = parsed.done
                  result = `[${currentAgent}] ${result}`
                  break
                }
                if (parsed.session_id && sessionId == "")
                  sessionId = parsed.session_id
                if (parsed.agent && currentAgent == "")
                  currentAgent = parsed.agent
                if (parsed.agent_switch) {
                  currentAgent = parsed.agent_switch
                  result = ""
                }
                if (parsed.content) {
                  result += parsed.content
                }
              } catch (e) {
                return "Error parsing."
                // Wait for more data (partial JSON)
              }
            }
          }
        }
      }
      return result
    } else {
      return "Error!"
    }
  }

  const flow = {
    start: {
      message: async (params: {
        userInput: string
        streamMessage: (chunkText: string) => void
      }) => {
        return await run("A")
      },
      path: "model_loop",
    },
    model_loop: {
      message: async (params: {
        userInput: string
        streamMessage: (chunkText: string) => void
      }) => {
        return await run(params.userInput)
      },
      path: "model_loop",
    },
  }
  return <ChatBot id={id} flow={flow} settings={settings} />
}
