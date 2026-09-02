"use client"

import * as React from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { Search, ChevronLeft, ChevronRight, RotateCcw, SlidersHorizontal } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const LOCATIONS = [
  "Achampatti", "Aiyanapuram", "Alakkudi", "Annappanpettai", "Arisikara Street", "Avarampatti",
  "Budalur", "Chennampatti", "Chitrakudi", "Co operative Buildings", "Ganapathi Nagar", "Gudalur",
  "Inayathukkanpatti", "Indalur", "Irudayapuram", "Kalimedu", "Kallaperambur", "Kalvirayanpettai",
  "Kangeyampatti", "Karuntattankudi", "Kattur", "Kilavastachavadi", "Kulichapattu", "Kumbakonam",
  "Kurungulam", "Kurungulam Melpathi", "MGM Sanatorium", "Manambuchavadi", "Manangorai", "Manayeripatti",
  "Manojipatti", "Mariammancoil", "Marudakudi", "Marungulam", "Melakalakudi", "Melavasthachavadi",
  "Mukasa Nanjikottai", "Palayapatti South", "Pillaiyarpatti", "Pookkara Street", "Pudukudi",
  "Raja Serfoji Govt College", "Rajappa Nagar", "Ramanathapuram", "Ravusapatti", "Rayamundanpatti",
  "Royandur", "Sakkarasamandam", "Sengipatti", "Sholagampatti", "Srinivasapuram", "State Bank Colony",
  "Sydambalpuram", "TJ Busstand", "TJ Co operative Housing Colony", "Tamil University", "Tandankorai",
  "Tennangudi", "Thanjavur", "Thanjavur Bazaar", "Thanjavur City", "Thanjavur Collectorate",
  "Thanjavur East", "Thanjavur East Gate", "Thanjavur Housing Unit", "Thanjavur Medical College",
  "Thanjavur North Gate", "Thanjavur P&t Colony", "Thanjavur South", "Thanjavur West", "Thethuvasalpatti",
  "Tirukanurpatti", "Tirumalaisamudram", "Tirumalaisamudram East", "Trichy", "Valamarkottai",
  "Vallam East", "Vallam Pudur", "Vallam TJ", "Vannarapettai", "Vendayampatti", "Vennamangalam",
  "Vennar Bank", "Vilar", "Voc Nagar"
]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState("all")
  const [orderFilter, setOrderFilter] = React.useState("all")

  const filteredData = React.useMemo(() => {
    return (data as (TData & { avgRating?: number; orders?: number })[]).filter((item) => {
      const rating = item.avgRating || 0;
      const orders = item.orders || 0;
      
      if (ratingFilter === "4.5" && rating < 4.5) return false;
      if (ratingFilter === "4.0" && rating < 4.0) return false;
      if (ratingFilter === "3.0" && rating < 3.0) return false;
      if (ratingFilter === "new" && rating > 0) return false;

      if (orderFilter === "1000" && orders < 1000) return false;
      if (orderFilter === "500" && orders < 500) return false;
      if (orderFilter === "100" && orders < 100) return false;

      return true;
    })
  }, [data, ratingFilter, orderFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  })

  const totalPages = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col 2xl:flex-row items-center gap-3">
        <div className="relative w-full 2xl:w-[320px] shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[17px] w-[17px] text-[#475569]" />
          <Input
            placeholder="Search by name, email, phone, location..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="w-full pl-9 h-[40px] bg-[#FFFFFF] border-[#E2E8F0] rounded-[8px] text-[#111827] placeholder:text-[#64748B] focus-visible:ring-0 focus-visible:border-[#07883F] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_2px_rgba(7,136,63,0.08)]"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full 2xl:w-auto">
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(val) =>
              table.getColumn("status")?.setFilterValue(val === "all" ? "" : val)
            }
          >
            <SelectTrigger className="w-[140px] h-[40px] bg-[#FFFFFF] border-[#E2E8F0] rounded-[8px] text-[#334155] focus:ring-0 [&>svg]:text-[#475569]">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDINGAPPROVAL">Pending</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] h-[40px] bg-[#FFFFFF] border-[#E2E8F0] rounded-[8px] text-[#334155] focus:ring-0 [&>svg]:text-[#475569]">
              <SelectValue placeholder="Cuisine: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cuisine: All</SelectItem>
              <SelectItem value="south-indian">South Indian</SelectItem>
              <SelectItem value="north-indian">North Indian</SelectItem>
              <SelectItem value="chinese">Chinese</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] h-[40px] bg-[#FFFFFF] border-[#E2E8F0] rounded-[8px] text-[#334155] focus:ring-0 [&>svg]:text-[#475569]">
              <SelectValue placeholder="Location: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Location: All</SelectItem>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc.toLowerCase()}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-[40px] bg-[#FFFFFF] border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC] rounded-[8px] px-4 gap-2"
              >
                More Filters <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-[#111827]">More Filters</h4>
                  <p className="text-sm text-[#64748B]">
                    Refine the list of kitchen partners.
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="rating" className="text-sm font-medium text-[#334155]">Rating</label>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger id="rating" className="col-span-2 h-9 border-[#E2E8F0]">
                        <SelectValue placeholder="All Ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="4.5">4.5 & up</SelectItem>
                        <SelectItem value="4.0">4.0 & up</SelectItem>
                        <SelectItem value="3.0">3.0 & up</SelectItem>
                        <SelectItem value="new">New (No rating)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="orders" className="text-sm font-medium text-[#334155]">Orders</label>
                    <Select value={orderFilter} onValueChange={setOrderFilter}>
                      <SelectTrigger id="orders" className="col-span-2 h-9 border-[#E2E8F0]">
                        <SelectValue placeholder="All Orders" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="1000">1000+ Orders</SelectItem>
                        <SelectItem value="500">500+ Orders</SelectItem>
                        <SelectItem value="100">100+ Orders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {(globalFilter || (table.getColumn("status")?.getFilterValue() as string) || ratingFilter !== "all" || orderFilter !== "all") && (
            <Button
              variant="ghost"
              onClick={() => {
                setGlobalFilter("")
                table.getColumn("status")?.setFilterValue("")
                setRatingFilter("all")
                setOrderFilter("all")
              }}
              className="h-[40px] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#334155]"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader className="bg-[#FFFFFF]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-[#EEF2F6]">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-[11px] font-semibold text-[#334155] h-12 px-6 align-middle">
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
                    className="hover:bg-[#FAFCFB] border-b border-[#EEF2F6] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-6 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-[#64748B]"
                  >
                    No kitchen partners found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="p-4 border-t border-[#EEF2F6] flex flex-col sm:flex-row items-center justify-between text-[13px] text-[#64748B] gap-4">
          <div>
            Showing {table.getRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          
          <div className="flex items-center gap-6">
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn("h-[32px] w-[32px] bg-[#FFFFFF] border-[#E2E8F0] text-[#334155] rounded-[6px]", currentPage <= 1 && "pointer-events-none opacity-50")}
                    onClick={(e) => { e.preventDefault(); table.previousPage() }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  // Show current, prev, next, first, last, and dots
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); table.setPageIndex(i) }}
                          isActive={currentPage === page}
                          className={cn(
                            "h-[32px] min-w-[32px] px-2 rounded-[6px] text-[13px] font-medium border",
                            currentPage === page
                              ? "bg-[#07883F] text-[#FFFFFF] border-[#07883F] shadow-[0_1px_2px_rgba(7,136,63,0.12)] hover:bg-[#057333] hover:text-[#FFFFFF]"
                              : "bg-[#FFFFFF] text-[#334155] border-[#E2E8F0] hover:bg-[#EAF7EE] hover:text-[#15803D] hover:border-[#CDEBD6]"
                          )}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }
                  
                  if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <span className="text-[#334155] px-1">...</span>
                      </PaginationItem>
                    )
                  }
                  
                  return null;
                })}
                
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn("h-[32px] w-[32px] bg-[#FFFFFF] border-[#E2E8F0] text-[#334155] rounded-[6px]", !table.getCanNextPage() && "pointer-events-none opacity-50")}
                    onClick={(e) => { e.preventDefault(); table.nextPage() }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <div className="flex items-center">
              <Select value={String(table.getState().pagination.pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
                <SelectTrigger className="w-[100px] h-[32px] bg-[#FFFFFF] border-[#E2E8F0] rounded-[7px] text-[#334155] focus:ring-0 text-[13px] [&>svg]:text-[#667085]">
                  <SelectValue placeholder="8 / page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 / page</SelectItem>
                  <SelectItem value="15">15 / page</SelectItem>
                  <SelectItem value="30">30 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
