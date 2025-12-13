import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'

interface SearchResult {
  id: number
  title: string
  content: string
}

interface DetailedResultProps {
  result: SearchResult
  onClose: () => void
}

export function DetailedResult({ result, onClose }: DetailedResultProps) {
  return (
    <Card className="w-full mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{result.title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p>{result.content}</p>
      </CardContent>
    </Card>
  )
}
