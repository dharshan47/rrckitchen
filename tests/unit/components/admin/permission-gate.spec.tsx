import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AdminPermissionGate } from "@/components/admin/permission-gate"
vi.mock("@/actions/admin/admin-actions")

function createWrapper(data?: string[]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (data !== undefined) {
    queryClient.setQueryData(["admin-permissions"], data)
  }
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("AdminPermissionGate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders children when permission is granted", () => {
    render(
      <AdminPermissionGate requiredPermission="MANAGE_CATALOG">
        <div>Protected Content</div>
      </AdminPermissionGate>,
      { wrapper: createWrapper(["MANAGE_CATALOG", "VIEW_FINANCIALS"]) }
    )
    expect(screen.getByText("Protected Content")).toBeInTheDocument()
  })

  it("renders default access restricted message when permission is missing", () => {
    render(
      <AdminPermissionGate requiredPermission="MANAGE_CATALOG">
        <div>Protected Content</div>
      </AdminPermissionGate>,
      { wrapper: createWrapper(["VIEW_FINANCIALS"]) }
    )
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument()
    expect(screen.getByText("Access Restricted")).toBeInTheDocument()
  })

  it("renders custom fallback when permission is missing", () => {
    render(
      <AdminPermissionGate requiredPermission="MANAGE_CATALOG" fallback={<div>Custom Fallback</div>}>
        <div>Protected Content</div>
      </AdminPermissionGate>,
      { wrapper: createWrapper(["VIEW_FINANCIALS"]) }
    )
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument()
    expect(screen.getByText("Custom Fallback")).toBeInTheDocument()
    expect(screen.queryByText("Access Restricted")).not.toBeInTheDocument()
  })

  it("renders loading skeleton while fetching permissions", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <AdminPermissionGate requiredPermission="MANAGE_CATALOG">
        <div>Protected Content</div>
      </AdminPermissionGate>,
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      }
    )
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument()
    expect(screen.queryByText("Access Restricted")).not.toBeInTheDocument()
  })

  it("renders default fallback with permission description text", () => {
    render(
      <AdminPermissionGate requiredPermission="MANAGE_CATALOG">
        <div>Protected Content</div>
      </AdminPermissionGate>,
      { wrapper: createWrapper([]) }
    )
    expect(
      screen.getByText("You don't have permission to access this section.")
    ).toBeInTheDocument()
  })

  it("renders multiple children when permission is granted", () => {
    render(
      <AdminPermissionGate requiredPermission="VIEW_FINANCIALS">
        <div>First Child</div>
        <div>Second Child</div>
      </AdminPermissionGate>,
      { wrapper: createWrapper(["VIEW_FINANCIALS"]) }
    )
    expect(screen.getByText("First Child")).toBeInTheDocument()
    expect(screen.getByText("Second Child")).toBeInTheDocument()
  })

  it("does not render children when permissions list is empty", () => {
    render(
      <AdminPermissionGate requiredPermission="MANAGE_CATALOG">
        <div>Protected Content</div>
      </AdminPermissionGate>,
      { wrapper: createWrapper([]) }
    )
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument()
    expect(screen.getByText("Access Restricted")).toBeInTheDocument()
  })
})
