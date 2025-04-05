"use client"

import ChatBot from "react-chatbotify"
import { Button } from "@medusajs/ui"

export default function ChatbotChatbox() {
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

  const flow = {
    start: {
      message: "Hello there!",
      path: "end",
    },
    end: {
      message: "See you, goodbye!",
    },
  }
  return <ChatBot id={id} flow={flow} settings={settings} />
}
