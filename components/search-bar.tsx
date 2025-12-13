"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from 'lucide-react'
import { DetailedResult } from "./detailed-result"

interface SearchResult {
  id: number
  title: string
  content: string
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setSelectedResult(null)
    setError(null)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }
      
      const searchResults = await response.json()
      setResults(searchResults)
      
      if (searchResults.length === 0) {
        setError("No results found. Try a different search term.")
      }
    } catch (err) {
      setResults([])
      setError(
        `An error occurred while searching: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`
      )
    } finally {
      setIsLoading(false)
    }
  }, [query])

  const handleResultClick = useCallback((result: SearchResult) => {
    setSelectedResult(result)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search or ask a question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              aria-label="Search input"
            />
            <Button onClick={handleSearch} disabled={isLoading} aria-label="Search button">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {error && (
            <div className="text-destructive text-sm" role="alert">
              {error}
            </div>
          )}
          {results.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Search Results:</h3>
              <ul className="space-y-2" role="list">
                {results.map((result) => (
                  <li
                    key={result.id}
                    className="bg-muted p-2 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleResultClick(result)}
                    role="listitem"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === "Enter" && handleResultClick(result)}
                  >
                    {result.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedResult && <DetailedResult result={selectedResult} onClose={() => setSelectedResult(null)} />}
        </div>
      </CardContent>
    </Card>
  )
}
