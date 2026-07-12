import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LocationAutocomplete } from "@/components/location/location-autocomplete"

beforeAll(() => {
  global.fetch = vi.fn()
})

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe("LocationAutocomplete", () => {
  const onPlaceSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders search input", () => {
    renderWithQuery(
      <LocationAutocomplete onPlaceSelect={onPlaceSelect} />
    )
    expect(
      screen.getByPlaceholderText("Search a location in Thanjavur")
    ).toBeInTheDocument()
  })

  it("shows custom placeholder", () => {
    renderWithQuery(
      <LocationAutocomplete
        onPlaceSelect={onPlaceSelect}
        placeholder="Search in Thanjavur"
      />
    )
    expect(
      screen.getByPlaceholderText("Search in Thanjavur")
    ).toBeInTheDocument()
  })
})
