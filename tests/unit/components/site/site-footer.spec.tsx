import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { SiteFooter } from "@/components/site/site-footer"

const mockUseSession = vi.fn()

vi.mock("@/lib/auth-client", () => ({
  useSession: (...args: unknown[]) => mockUseSession(...args),
}))

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

describe("SiteFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSession.mockReturnValue({ data: null })
  })

  it("renders brand name RRC Kitchen", () => {
    render(<SiteFooter />)
    expect(screen.getByText("RRC Kitchen")).toBeInTheDocument()
  })

  it("renders copyright text", () => {
    render(<SiteFooter />)
    expect(screen.getByText(/RRC Kitchen Marketplace Private Limited/)).toBeInTheDocument()
  })

  it("renders Quick Links section", () => {
    render(<SiteFooter />)
    expect(screen.getByText("Quick Links")).toBeInTheDocument()
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })

  it("renders Partner With Us section", () => {
    render(<SiteFooter />)
    expect(screen.getByText("Partner With Us")).toBeInTheDocument()
    expect(screen.getByText("Become a Delivery Partner")).toBeInTheDocument()
    expect(screen.getByText("Become a Home Chef")).toBeInTheDocument()
  })

  it("renders Policies section", () => {
    render(<SiteFooter />)
    expect(screen.getByText("Policies")).toBeInTheDocument()
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument()
    expect(screen.getByText("Terms of Use")).toBeInTheDocument()
  })

  it("has correct links for Home and Contact", () => {
    render(<SiteFooter />)
    const homeLink = screen.getByText("Home").closest("a")
    expect(homeLink).toHaveAttribute("href", "/")
    const contactLink = screen.getByText("Contact").closest("a")
    expect(contactLink).toHaveAttribute("href", "/contact")
  })

  it("links delivery partner to login when not a delivery partner", () => {
    mockUseSession.mockReturnValue({ data: null })
    render(<SiteFooter />)
    const dpLink = screen.getByText("Become a Delivery Partner").closest("a")
    expect(dpLink).toHaveAttribute("href", "/delivery-partner/login")
  })

  it("links kitchen partner to login when not a kitchen partner", () => {
    mockUseSession.mockReturnValue({ data: null })
    render(<SiteFooter />)
    const kLink = screen.getByText("Become a Home Chef").closest("a")
    expect(kLink).toHaveAttribute("href", "/kitchen")
  })

  it("links delivery partner to dashboard when user is a delivery partner", () => {
    mockUseSession.mockReturnValue({ data: { user: { id: "1", role: "deliverypartner" } } })
    render(<SiteFooter />)
    const dpLink = screen.getByText("Become a Delivery Partner").closest("a")
    expect(dpLink).toHaveAttribute("href", "/delivery-partner/dashboard")
  })

  it("links kitchen partner to dashboard when user is a kitchen partner", () => {
    mockUseSession.mockReturnValue({ data: { user: { id: "1", role: "kitchenpartner" } } })
    render(<SiteFooter />)
    const kLink = screen.getByText("Become a Home Chef").closest("a")
    expect(kLink).toHaveAttribute("href", "/kitchen/dashboard")
  })

  it("renders Privacy Policy link", () => {
    render(<SiteFooter />)
    const ppLink = screen.getByText("Privacy Policy").closest("a")
    expect(ppLink).toHaveAttribute("href", "/privacy-policy")
  })

  it("renders Terms of Use link", () => {
    render(<SiteFooter />)
    const touLink = screen.getByText("Terms of Use").closest("a")
    expect(touLink).toHaveAttribute("href", "/terms-of-use")
  })
})
