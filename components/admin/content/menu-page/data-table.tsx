"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onEditMenu?: (id: string) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onEditMenu,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    meta: {
      onEditMenu,
    },
  })

  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const from = data.length === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, data.length)

  const pageButtons: number[] = []
  for (let p = 0; p < pageCount; p++) {
    if (p === 0 || p === pageCount - 1 || Math.abs(p - pageIndex) <= 1) {
      pageButtons.push(p)
    }
  }
  const pageSequence = pageButtons.reduce<Array<number | "ellipsis">>((acc, p, i) => {
    if (i > 0 && p - pageButtons[i - 1] > 1) acc.push("ellipsis")
    acc.push(p)
    return acc
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border border-[#E5E9ED] bg-[#FFFFFF] shadow-[0_1px_4px_rgba(15,23,42,0.025)] overflow-hidden">
        <ScrollArea className="w-full">
          <Table className="min-w-[1000px] w-full">
            <TableHeader className="bg-[#F7FBF8] border-b border-[#E5E9ED]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-11 text-[13px] font-semibold text-[#1F2937] whitespace-nowrap px-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-[#FAFCFB] transition-colors border-b border-[#EDF0F2]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 align-top sm:align-middle border-none">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-[#64748B]">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
        <div className="text-[13px] text-[#64748B] font-medium whitespace-nowrap">
          Showing {from} to {to} of {data.length} kitchens
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-[7px] border-[#DDE3E8] bg-[#FFFFFF] text-[#475569] hover:bg-slate-50 disabled:text-[#CBD5E1]"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
          </Button>
          {pageSequence.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`e-${i}`} className="px-1 text-[#94A3B8] hidden sm:inline">...</span>
            ) : (
              <Button
                key={p}
                variant="outline"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-[7px] text-[13px] font-medium",
                  pageIndex === p
                    ? "bg-[#087A36] hover:bg-[#065F2A] text-[#FFFFFF] border-[#087A36]"
                    : "border-[#DDE3E8] text-[#1F2937] bg-[#FFFFFF] hover:bg-slate-50"
                )}
                onClick={() => table.setPageIndex(p)}
              >
                {p + 1}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-[7px] border-[#DDE3E8] bg-[#FFFFFF] text-[#475569] hover:bg-slate-50 disabled:text-[#CBD5E1]"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#64748B] font-medium whitespace-nowrap">Rows per page:</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px] text-[13px] font-medium border-[#DDE3E8] bg-[#FFFFFF] text-[#334155] rounded-[8px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-[13px]">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
