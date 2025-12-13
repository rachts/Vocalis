"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

export function DateTimeDisplay() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Date & Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{format(currentDateTime, "HH:mm:ss")}</div>
        <div className="text-xl mt-2">{format(currentDateTime, "EEEE, MMMM d, yyyy")}</div>
      </CardContent>
    </Card>
  )
}
