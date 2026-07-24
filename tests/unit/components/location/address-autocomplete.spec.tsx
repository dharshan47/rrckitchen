import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { LocationAutocomplete } from "@/components/location/location-autocomplete"

const mockResults = [
  { lat: 10.78, lon: 79.13, display_name: "Thanjavur, Tamil Nadu", street: "Main St", city: "Thanjavur", postcode: "613001" },
  { lat: 10.75, lon: 79.10, display_name: "Medical College, Thanjavur", street: "College Rd", city: "Thanjavur", postcode: "613004" },
]

describe("LocationAutocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders input with default placeholder", () => {
    render(<LocationAutocomplete onPlaceSelect={vi.fn()} />)
    expect(screen.getByPlaceholderText("Search a location in Thanjavur")).toBeInTheDocument()
  })

  it("renders with custom placeholder", () => {
    render(<LocationAutocomplete placeholder="Search address" onPlaceSelect={vi.fn()} />)
    expect(screen.getByPlaceholderText("Search address")).toBeInTheDocument()
  })

  it("shows no results initially", () => {
    const { container } = render(<LocationAutocomplete onPlaceSelect={vi.fn()} />)
    const dropdown = container.querySelector(".absolute.z-50")
    expect(dropdown).not.toBeInTheDocument()
  })

  it("shows results when query is typed", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    })
    render(<LocationAutocomplete onPlaceSelect={vi.fn()} />)
    const input = screen.getByPlaceholderText("Search a location in Thanjavur")
    fireEvent.change(input, { target: { value: "than" } })
    await waitFor(() => {
      expect(screen.getByText("Thanjavur, Tamil Nadu")).toBeInTheDocument()
    })
  })

  it("shows searching indicator while fetching", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}))
    render(<LocationAutocomplete onPlaceSelect={vi.fn()} />)
    const input = screen.getByPlaceholderText("Search a location in Thanjavur")
    fireEvent.change(input, { target: { value: "than" } })
    expect(screen.getByText("Searching...")).toBeInTheDocument()
  })

  it("shows no locations found when results are empty", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    render(<LocationAutocomplete onPlaceSelect={vi.fn()} />)
    const input = screen.getByPlaceholderText("Search a location in Thanjavur")
    fireEvent.change(input, { target: { value: "xxxx" } })
    await waitFor(() => {
      expect(screen.getByText(/No locations found/)).toBeInTheDocument()
    })
  })

  it("calls onPlaceSelect when a result is clicked", async () => {
    const onPlaceSelect = vi.fn()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    })
    render(<LocationAutocomplete onPlaceSelect={onPlaceSelect} />)
    const input = screen.getByPlaceholderText("Search a location in Thanjavur")
    fireEvent.change(input, { target: { value: "than" } })
    await waitFor(() => {
      expect(screen.getByText("Thanjavur, Tamil Nadu")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText("Thanjavur, Tamil Nadu"))
    expect(onPlaceSelect).toHaveBeenCalledWith({
      name: "Thanjavur, Tamil Nadu",
      address: "Thanjavur, Tamil Nadu",
      lat: 10.78,
      lng: 79.13,
    })
  })

  it("renders with defaultValue", () => {
    render(<LocationAutocomplete onPlaceSelect={vi.fn()} defaultValue="Previous Address" />)
    const input = screen.getByPlaceholderText("Search a location in Thanjavur") as HTMLInputElement
    expect(input.value).toBe("Previous Address")
  })

  it("closes dropdown after selecting a result", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    })
    render(<LocationAutocomplete onPlaceSelect={vi.fn()} />)
    const input = screen.getByPlaceholderText("Search a location in Thanjavur")
    fireEvent.change(input, { target: { value: "than" } })
    await waitFor(() => {
      expect(screen.getByText("Thanjavur, Tamil Nadu")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText("Thanjavur, Tamil Nadu"))
    await waitFor(() => {
      expect(screen.queryByText("Medical College, Thanjavur")).not.toBeInTheDocument()
    })
  })

  it("shows city and postcode in results", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    })
    render(<LocationAutocomplete onPlaceSelect={vi.fn()} />)
    const input = screen.getByPlaceholderText("Search a location in Thanjavur")
    fireEvent.change(input, { target: { value: "than" } })
    await waitFor(() => {
      expect(screen.getByText("Thanjavur - 613001")).toBeInTheDocument()
    })
  })

  it("applies custom className", () => {
    const { container } = render(
      <LocationAutocomplete onPlaceSelect={vi.fn()} className="custom-class" />
    )
    const input = container.querySelector("input")
    expect(input!.className).toContain("custom-class")
  })
})
