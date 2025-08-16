"use client"

import * as React from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCMS } from "@/lib/store"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { debounce } from "@/lib/utils"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

const ChatbotWidgetContent = React.lazy(() =>
  Promise.resolve({ default: ChatbotWidgetContentComponent }).catch(() => ({
    default: () => <div>Error loading chat widget</div>,
  })),
)

export function ChatbotWidget() {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const prefersReducedMotion = useReducedMotion()
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIsLoaded(true)
    }, 5000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleToggle = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleLoadNow = React.useCallback(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <motion.div
        className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50"
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={prefersReducedMotion ? {} : { scale: 1 }}
        transition={prefersReducedMotion ? {} : { delay: 2 }}
      >
        <Button
          onClick={handleLoadNow}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>
    )
  }

  return (
    <React.Suspense
      fallback={
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50">
          <Button className="w-14 h-14 rounded-full bg-emerald-600" size="icon">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      }
    >
      <ChatbotWidgetContent isOpen={isOpen} setIsOpen={setIsOpen} />
    </React.Suspense>
  )
}

const MessageBubble = React.memo(function MessageBubble({ message }: { message: Message }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl ${
          message.isBot
            ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm"
            : "bg-emerald-600 text-white"
        }`}
      >
        <p className="text-sm whitespace-pre-line">{message.text}</p>
        <p className={`text-xs mt-1 ${message.isBot ? "text-gray-500" : "text-emerald-100"}`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  )
})

const TypingIndicator = React.memo(function TypingIndicator() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      className="flex justify-start"
    >
      <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl shadow-sm">
        <div className="flex space-x-1">
          <div className={`w-2 h-2 bg-gray-400 rounded-full ${prefersReducedMotion ? "" : "animate-bounce"}`}></div>
          <div
            className={`w-2 h-2 bg-gray-400 rounded-full ${prefersReducedMotion ? "" : "animate-bounce"}`}
            style={prefersReducedMotion ? {} : { animationDelay: "0.1s" }}
          ></div>
          <div
            className={`w-2 h-2 bg-gray-400 rounded-full ${prefersReducedMotion ? "" : "animate-bounce"}`}
            style={prefersReducedMotion ? {} : { animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </motion.div>
  )
})

const ChatbotWidgetContentComponent = React.memo(function ChatbotWidgetContentComponent({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const { locale } = useCMS()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const prefersReducedMotion = useReducedMotion()
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const mountedRef = React.useRef(true)

  const quickReplies = React.useMemo(
    () => [
      {
        ar: "أريد تفعيل PayPal",
        en: "I want PayPal activation",
      },
      {
        ar: "ما هي أسعاركم؟",
        en: "What are your prices?",
      },
      {
        ar: "كم يستغرق التفعيل؟",
        en: "How long does activation take?",
      },
      {
        ar: "تحدث مع مختص",
        en: "Talk to specialist",
      },
    ],
    [],
  )

  const botResponses = React.useMemo(
    () => ({
      ar: {
        welcome: "مرحباً! أنا مساعدك الذكي في KYC Trust. كيف يمكنني مساعدتك اليوم؟",
        paypal: "ممتاز! خدمة تفعيل PayPal تبدأ من $50 وتستغرق 24-48 ساعة. هل تريد المتابعة؟",
        prices: "أسعارنا تنافسية جداً:\n• PayPal: من $50\n• Payoneer: من $40\n• Wise: من $45\n• Skrill: من $35",
        timing:
          "أوقات التفعيل:\n• PayPal: 24-48 ساعة\n• Payoneer: 12-24 ساعة\n• Wise: 24-48 ساعة\n• معظم الخدمات الأخرى: فورية",
        specialist: "سأحولك إلى أحد المختصين عبر واتساب للحصول على مساعدة شخصية.",
        default: "شكراً لسؤالك! للحصول على إجابة مفصلة، يرجى التواصل معنا عبر واتساب.",
      },
      en: {
        welcome: "Hello! I'm your smart assistant at KYC Trust. How can I help you today?",
        paypal: "Great! PayPal activation service starts from $50 and takes 24-48 hours. Would you like to proceed?",
        prices:
          "Our competitive prices:\n• PayPal: From $50\n• Payoneer: From $40\n• Wise: From $45\n• Skrill: From $35",
        timing:
          "Activation times:\n• PayPal: 24-48 hours\n• Payoneer: 12-24 hours\n• Wise: 24-48 hours\n• Most other services: Instant",
        specialist: "I'll connect you with one of our specialists via WhatsApp for personalized assistance.",
        default: "Thank you for your question! For a detailed answer, please contact us via WhatsApp.",
      },
    }),
    [],
  )

  React.useEffect(() => {
    mountedRef.current = true

    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "1",
        text: botResponses[locale].welcome,
        isBot: true,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }

    return () => {
      mountedRef.current = false
    }
  }, [isOpen, locale, messages.length, botResponses])

  const debouncedSendMessage = React.useMemo(
    () =>
      debounce((text: string) => {
        if (!text.trim() || !mountedRef.current) return

        const userMessage: Message = {
          id: Date.now().toString(),
          text: text.trim(),
          isBot: false,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputValue("")
        setIsTyping(true)

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return

          let botResponse = botResponses[locale].default
          const lowerText = text.toLowerCase()

          if (lowerText.includes("paypal") || lowerText.includes("بايبال")) {
            botResponse = botResponses[locale].paypal
          } else if (
            lowerText.includes("price") ||
            lowerText.includes("cost") ||
            lowerText.includes("سعر") ||
            lowerText.includes("أسعار")
          ) {
            botResponse = botResponses[locale].prices
          } else if (
            lowerText.includes("time") ||
            lowerText.includes("long") ||
            lowerText.includes("وقت") ||
            lowerText.includes("يستغرق")
          ) {
            botResponse = botResponses[locale].timing
          } else if (
            lowerText.includes("specialist") ||
            lowerText.includes("human") ||
            lowerText.includes("مختص") ||
            lowerText.includes("موظف")
          ) {
            botResponse = botResponses[locale].specialist
          }

          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            isBot: true,
            timestamp: new Date(),
          }

          if (mountedRef.current) {
            setMessages((prev) => [...prev, botMessage])
            setIsTyping(false)
          }
        }, 1000)
      }, 500),
    [botResponses, locale],
  )

  const handleSendMessage = React.useCallback(
    (text: string) => {
      debouncedSendMessage(text)
    },
    [debouncedSendMessage],
  )

  const handleQuickReply = React.useCallback(
    (reply: string) => {
      handleSendMessage(reply)
    },
    [handleSendMessage],
  )

  const handleWhatsAppRedirect = React.useCallback(() => {
    const message =
      locale === "ar"
        ? "مرحباً، أريد التحدث مع مختص حول خدماتكم"
        : "Hello, I want to speak with a specialist about your services"

    window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, "_blank")
  }, [locale])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50"
        initial={prefersReducedMotion ? {} : { scale: 0 }}
        animate={prefersReducedMotion ? {} : { scale: 1 }}
        transition={prefersReducedMotion ? {} : { delay: 2 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={prefersReducedMotion ? {} : { rotate: -90, opacity: 0 }}
                animate={prefersReducedMotion ? {} : { rotate: 0, opacity: 1 }}
                exit={prefersReducedMotion ? {} : { rotate: 90, opacity: 0 }}
                transition={prefersReducedMotion ? {} : { duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={prefersReducedMotion ? {} : { rotate: 90, opacity: 0 }}
                animate={prefersReducedMotion ? {} : { rotate: 0, opacity: 1 }}
                exit={prefersReducedMotion ? {} : { rotate: -90, opacity: 0 }}
                transition={prefersReducedMotion ? {} : { duration: 0.2 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Notification Badge */}
        {!isOpen && (
          <motion.div
            className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
            transition={prefersReducedMotion ? {} : { duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Badge className="bg-red-500 text-white px-2 py-1 text-xs">{locale === "ar" ? "جديد" : "New"}</Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 rtl:right-auto rtl:left-6 z-50 w-80 sm:w-96"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
            transition={prefersReducedMotion ? {} : { duration: 0.2 }}
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">KYC Trust</CardTitle>
                      <p className="text-emerald-100 text-sm">{locale === "ar" ? "مساعد ذكي" : "Smart Assistant"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-emerald-100 text-xs">{locale === "ar" ? "متصل" : "Online"}</span>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0">
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && <TypingIndicator />}
                </div>

                {/* Quick Replies */}
                {messages.length === 1 && (
                  <div className="p-4 border-t bg-white dark:bg-gray-800">
                    <p className="text-sm text-muted-foreground mb-3">
                      {locale === "ar" ? "اختر من الأسئلة الشائعة:" : "Choose from common questions:"}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(reply[locale])}
                          className="justify-start text-left rtl:text-right h-auto py-2 px-3"
                        >
                          {reply[locale]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t bg-white dark:bg-gray-800">
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={locale === "ar" ? "اكتب رسالتك..." : "Type your message..."}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage(inputValue)
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSendMessage(inputValue)}
                      size="icon"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* WhatsApp Button */}
                  <Button
                    onClick={handleWhatsAppRedirect}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-emerald-600 border-emerald-600 hover:bg-emerald-50 bg-transparent"
                  >
                    <MessageCircle className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {locale === "ar" ? "تحدث مع مختص عبر واتساب" : "Talk to specialist via WhatsApp"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})
