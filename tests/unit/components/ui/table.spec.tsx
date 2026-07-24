import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"

describe("Table", () => {
  it("renders Table without crashing", () => {
    render(
      <Table data-testid="table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Row 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId("table")).toBeInTheDocument()
    expect(screen.getByTestId("table")).toHaveAttribute("data-slot", "table")
  })

  it("renders Table wrapped in container div", () => {
    render(<Table data-testid="table">content</Table>)
    const container = screen.getByTestId("table").parentElement
    expect(container).toHaveAttribute("data-slot", "table-container")
  })

  it("renders TableHeader", () => {
    render(
      <Table>
        <TableHeader data-testid="thead">
          <TableRow>
            <TableHead>Col</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    const thead = screen.getByTestId("thead")
    expect(thead).toBeInTheDocument()
    expect(thead).toHaveAttribute("data-slot", "table-header")
  })

  it("renders TableBody", () => {
    render(
      <Table>
        <TableBody data-testid="tbody">
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const tbody = screen.getByTestId("tbody")
    expect(tbody).toBeInTheDocument()
    expect(tbody).toHaveAttribute("data-slot", "table-body")
  })

  it("renders TableFooter", () => {
    render(
      <Table>
        <TableFooter data-testid="tfoot">
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    const tfoot = screen.getByTestId("tfoot")
    expect(tfoot).toBeInTheDocument()
    expect(tfoot).toHaveAttribute("data-slot", "table-footer")
  })

  it("renders TableRow", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="tr">
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const tr = screen.getByTestId("tr")
    expect(tr).toBeInTheDocument()
    expect(tr).toHaveAttribute("data-slot", "table-row")
  })

  it("renders TableHead", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="th">Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    const th = screen.getByTestId("th")
    expect(th).toBeInTheDocument()
    expect(th).toHaveAttribute("data-slot", "table-head")
  })

  it("renders TableCell", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="td">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const td = screen.getByTestId("td")
    expect(td).toBeInTheDocument()
    expect(td).toHaveAttribute("data-slot", "table-cell")
  })

  it("renders TableCaption", () => {
    render(
      <Table>
        <TableCaption data-testid="caption">A table</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const caption = screen.getByTestId("caption")
    expect(caption).toBeInTheDocument()
    expect(caption).toHaveAttribute("data-slot", "table-caption")
  })

  it("applies custom className", () => {
    render(<Table className="custom-table" data-testid="table">content</Table>)
    expect(screen.getByTestId("table").className).toContain("custom-table")
  })

  it("renders a full table composition", () => {
    render(
      <Table>
        <TableCaption>Fruit inventory</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Fruit</TableHead>
            <TableHead>Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Apple</TableCell>
            <TableCell>5</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Banana</TableCell>
            <TableCell>3</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>8</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    expect(screen.getByText("Fruit inventory")).toBeInTheDocument()
    expect(screen.getByText("Apple")).toBeInTheDocument()
    expect(screen.getByText("Banana")).toBeInTheDocument()
    expect(screen.getByText("Total")).toBeInTheDocument()
  })
})
