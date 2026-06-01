
import { useState, useEffect, useCallback } from 'react'
import { Search, BookOpen, Download, Clock, Star, Filter, X, ChevronLeft, ChevronRight, Book, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../lib/store'
import { api } from '../../lib/api'

interface Book {
  id: string
  isbn?: string
  url: string
  cover?: string
  name: string
  publisher?: string
  authors?: string[] | { author: string; author_url: string }[]
  year?: string
  language?: string
  extension?: string
  size?: string
  rating?: string
  quality?: string
  description?: string
  download_url?: string
  edition?: string
  categories?: string
}

interface SearchParams {
  q: string
  exact?: boolean
  from_year?: number
  to_year?: number
  lang?: string[]
  extensions?: string[]
  count?: number
}

const EXTENSIONS = ['PDF', 'EPUB', 'MOBI', 'AZW3', 'DJVU', 'TXT', 'FB2', 'RTF']
const LANGUAGES = ['english', 'hindi', 'spanish', 'french', 'german', 'russian', 'chinese', 'japanese', 'korean', 'arabic']

const CSLibrary = () => {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<{
    extension?: string
    language?: string
    fromYear?: number
    toYear?: number
  }>({})
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const stored = localStorage.getItem('cs-library-recent-searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch {
        setRecentSearches([])
      }
    }
  }, [])

  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('cs-library-recent-searches', JSON.stringify(updated))
  }, [recentSearches])

  const searchBooks = useCallback(async (query: string, page: number = 1, searchFilters = filters) => {
    if (!query.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const params: SearchParams = {
        q: query,
        count: 20,
      }
      
      if (searchFilters.extension) {
        params.extensions = [searchFilters.extension]
      }
      if (searchFilters.language) {
        params.lang = [searchFilters.language]
      }
      if (searchFilters.fromYear) {
        params.from_year = searchFilters.fromYear
      }
      if (searchFilters.toYear) {
        params.to_year = searchFilters.toYear
      }

      const data = await api.searchCSLibrary({ ...params, page })
      if (data.error) throw new Error(data.error)
      setBooks(data.books || [])
      setTotalPages(data.totalPages || 0)
      setCurrentPage(page)
      saveRecentSearch(query)
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [filters, saveRecentSearch])

  const fetchBookDetails = useCallback(async (bookId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await api.getCSLibraryBook(bookId)
      if (data.error) throw new Error(data.error)
      setSelectedBook(data.book)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchBooks(searchQuery, 1)
  }

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query)
    searchBooks(query, 1)
  }

  const clearFilters = () => {
    setFilters({})
    setShowFilters(false)
  }

  const applyFilters = () => {
    if (searchQuery) {
      searchBooks(searchQuery, 1, filters)
    }
    setShowFilters(false)
  }

  const getAuthorNames = (book: Book): string => {
    if (!book.authors) return 'Unknown'
    if (Array.isArray(book.authors)) {
      if (book.authors.length === 0) return 'Unknown'
      if (typeof book.authors[0] === 'string') {
        return (book.authors as string[]).join(', ')
      }
      return (book.authors as { author: string }[]).map(a => a.author).join(', ')
    }
    return 'Unknown'
  }

  const getRatingStars = (rating?: string): number => {
    if (!rating) return 0
    const parts = rating.split('/')
    if (parts.length === 2) {
      const val = parseFloat(parts[0])
      return Math.round(val)
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-50/30 dark:from-background dark:via-background dark:to-orange-950/10">
      {/* Header */}
      <div className="border-b border-border/50 bg-white/80 dark:bg-card/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CS Library</h1>
                <p className="text-sm text-muted-foreground">Search millions of books</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'hover:bg-muted'}`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, ISBN, or publisher..."
              className="w-full pl-12 pr-14 sm:pr-32 py-4 rounded-2xl border border-border bg-white dark:bg-card focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-foreground placeholder:text-muted-foreground shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 sm:w-auto sm:px-6 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center justify-center"
            >
              <Search className="w-5 h-5 sm:hidden" />
              <span className="hidden sm:inline">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}</span>
            </button>
          </div>
        </form>

        {/* Recent Searches */}
        {!books.length && !loading && recentSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentSearch(search)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm text-foreground transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowFilters(false)}></div>
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-card shadow-2xl z-50 transform transition-transform ${showFilters ? 'translate-x-0' : 'translate-x-full'} sm:max-w-sm`}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">File Type</label>
              <select
                value={filters.extension || ''}
                onChange={(e) => setFilters({ ...filters, extension: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:border-orange-500 outline-none"
              >
                <option value="">All formats</option>
                {EXTENSIONS.map(ext => (
                  <option key={ext} value={ext}>{ext}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Language</label>
              <select
                value={filters.language || ''}
                onChange={(e) => setFilters({ ...filters, language: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:border-orange-500 outline-none"
              >
                <option value="">All languages</option>
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">From Year</label>
              <input
                type="number"
                value={filters.fromYear || ''}
                onChange={(e) => setFilters({ ...filters, fromYear: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g. 2000"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">To Year</label>
              <input
                type="number"
                value={filters.toYear || ''}
                onChange={(e) => setFilters({ ...filters, toYear: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g. 2024"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:border-orange-500 outline-none"
              />
            </div>
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <button
              onClick={clearFilters}
              className="w-full px-6 py-2 border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-all"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="w-full px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {books.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Found {books.length} books{totalPages > 0 ? ` (Page ${currentPage} of ${totalPages})` : ''}
              </p>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => fetchBookDetails(book.id)}
                  className="group text-left p-4 rounded-2xl border border-border bg-white dark:bg-card hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {book.cover ? (
                        <img src={book.cover} alt={book.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Book className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {book.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {getAuthorNames(book)}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {book.extension && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium">
                            {book.extension}
                          </span>
                        )}
                        {book.year && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                            {book.year}
                          </span>
                        )}
                      </div>
                      
                      {book.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < getRatingStars(book.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">{book.rating}</span>
                        </div>
                      )}
                      
                      {book.size && (
                        <p className="text-xs text-muted-foreground mt-1">{book.size}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => searchBooks(searchQuery, currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-border bg-white dark:bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number
                    if (totalPages <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => searchBooks(searchQuery, page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                            : 'border border-border bg-white dark:bg-card hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => searchBooks(searchQuery, currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-border bg-white dark:bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!books.length && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 mb-6">
              <BookOpen className="w-16 h-16 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to CS Library</h2>
            <p className="text-muted-foreground max-w-md">
              Search millions of books across all subjects. Find textbooks, research papers, novels, and more.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && !books.length && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-muted-foreground">Searching books...</p>
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBook(null)}>
          <div
            className="w-full h-full sm:max-w-2xl sm:max-h-[90vh] sm:rounded-3xl border-t sm:border border-border bg-white dark:bg-card shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-white/90 dark:bg-card/90 backdrop-blur-xl sm:rounded-t-3xl">
              <h2 className="text-lg font-bold text-foreground">Book Details</h2>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3 flex-shrink-0">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-md mx-auto max-w-[200px] sm:max-w-full">
                    {selectedBook.cover ? (
                      <img src={selectedBook.cover} alt={selectedBook.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Book className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-foreground">{selectedBook.name}</h3>
                  <p className="text-lg text-muted-foreground mt-1">{getAuthorNames(selectedBook)}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedBook.extension && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium">
                        {selectedBook.extension}
                      </span>
                    )}
                    {selectedBook.year && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                        {selectedBook.year}
                      </span>
                    )}
                    {selectedBook.language && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                        {selectedBook.language}
                      </span>
                    )}
                  </div>

                  {selectedBook.rating && (
                    <div className="flex items-center gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < getRatingStars(selectedBook.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">{selectedBook.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBook.description && (
                <div className="mt-6">
                  <h4 className="font-semibold text-foreground mb-2">Description</h4>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: selectedBook.description }} />
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {selectedBook.publisher && <p><span className="font-semibold text-foreground">Publisher:</span> {selectedBook.publisher}</p>}
                {selectedBook.isbn && <p><span className="font-semibold text-foreground">ISBN:</span> {selectedBook.isbn}</p>}
                {selectedBook.size && <p><span className="font-semibold text-foreground">Size:</span> {selectedBook.size}</p>}
                {selectedBook.edition && <p><span className="font-semibold text-foreground">Edition:</span> {selectedBook.edition}</p>}
              </div>
            </div>
            <div className="p-4 border-t border-border flex flex-col sm:flex-row gap-3">
              <a
                href={selectedBook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View Source
              </a>
              <a
                href={selectedBook.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CSLibrary