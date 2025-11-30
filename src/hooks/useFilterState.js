import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

const STORAGE_KEY_PREFIX = 'filter_panel_open_'

/**
 * Hook to manage filter state with URL params and localStorage persistence
 * @param {string} pageKey - Unique key for the page (e.g., 'profiles', 'videos')
 * @param {Object} filterConfig - Configuration for filters
 * @param {Object} filterConfig.defaults - Default values for each filter
 * @param {Object} filterConfig.urlKeys - URL param keys for each filter
 * @param {Object} filterConfig.types - Type of each filter ('string', 'array')
 */
export function useFilterState(pageKey, filterConfig) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })

  // Initialize showFilters from localStorage
  const [showFilters, setShowFilters] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + pageKey)
      return stored === 'true'
    } catch {
      return false
    }
  })

  // Persist showFilters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + pageKey, String(showFilters))
    } catch {
      // Ignore localStorage errors
    }
  }, [showFilters, pageKey])

  // Parse filter values from URL
  const getFilterValue = useCallback((key) => {
    const urlKey = filterConfig.urlKeys[key]
    const type = filterConfig.types[key]
    const defaultValue = filterConfig.defaults[key]
    const urlValue = search[urlKey]

    if (urlValue === undefined || urlValue === null || urlValue === '') {
      return defaultValue
    }

    if (type === 'array') {
      // Arrays are stored as comma-separated strings
      return typeof urlValue === 'string' ? urlValue.split(',').filter(Boolean) : defaultValue
    }

    return urlValue
  }, [search, filterConfig])

  // Get all filter values
  const filters = {}
  for (const key of Object.keys(filterConfig.defaults)) {
    filters[key] = getFilterValue(key)
  }

  // Update a single filter
  const setFilter = useCallback((key, value) => {
    const urlKey = filterConfig.urlKeys[key]
    const type = filterConfig.types[key]
    const defaultValue = filterConfig.defaults[key]

    // Build new search params
    const newSearch = { ...search }

    // Check if value equals default (should be removed from URL)
    const isDefault = type === 'array'
      ? (Array.isArray(value) && value.length === 0) || JSON.stringify(value) === JSON.stringify(defaultValue)
      : value === defaultValue

    if (isDefault) {
      delete newSearch[urlKey]
    } else {
      newSearch[urlKey] = type === 'array' ? value.join(',') : value
    }

    navigate({ search: newSearch, replace: true })
  }, [search, navigate, filterConfig])

  // Clear all filters to defaults
  const clearFilters = useCallback(() => {
    const newSearch = { ...search }
    for (const key of Object.keys(filterConfig.urlKeys)) {
      delete newSearch[filterConfig.urlKeys[key]]
    }
    navigate({ search: newSearch, replace: true })
  }, [search, navigate, filterConfig])

  // Count active filters (non-default values)
  const activeFilterCount = Object.keys(filterConfig.defaults).filter(key => {
    const value = filters[key]
    const defaultValue = filterConfig.defaults[key]
    const type = filterConfig.types[key]

    if (type === 'array') {
      return Array.isArray(value) && value.length > 0
    }
    return value !== defaultValue
  }).length

  return {
    filters,
    setFilter,
    clearFilters,
    showFilters,
    setShowFilters,
    activeFilterCount,
  }
}
