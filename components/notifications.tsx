"use client"

import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const notifications = [
  {
    id: 1,
    title: "Title",
    description: "Supporting line text lorem ipsum dolor sit amet, consectetur",
  },
  {
    id: 2,
    title: "Title",
    description: "Supporting line text lorem ipsum dolor sit amet, consectetur",
  },
  {
    id: 3,
    title: "Title",
    description: "Supporting line text lorem ipsum dolor sit amet, consectetur",
  },
]

export function Notifications() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4">
        <CardTitle className="flex-1">NOTIFICATIONS</CardTitle>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardContent className="p-4">
              <h3 className="font-medium">{notification.title}</h3>
              <p className="text-sm text-muted-foreground">{notification.description}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="secondary">
                  Action
                </Button>
                <Button size="sm" variant="secondary">
                  Action
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
