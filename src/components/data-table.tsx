"use client"

import * as React from "react"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  ColumnDef, 
  ColumnFiltersState, 
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  SortingState,
  useReactTable,
  VisibilityState,
  Row
} from "@tanstack/react-table"
import { GripVertical } from "lucide-react"
import Flag from "react-flagkit"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Import Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

import { useRFQDialog } from "@/contexts/RFQDialogContext"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Define the schema for our data
export const tableSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
  origin: z.string(),
})

type TableRow = z.infer<typeof tableSchema>

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Cell viewer with sheet component
function TableCellViewer({ item }: { item: TableRow }) {
  const [form, setForm] = React.useState({
    type: item.type || "",
    status: item.status || "",
    target: item.target || "",
    limit: item.limit || "",
    origin: item.origin || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    // Replace this with your save logic (e.g., API call)
    console.log("Saved values:", form);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-base font-medium">
          {item.header}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[450px] p-6">
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold">Order Details</SheetTitle>
          <SheetDescription className="text-sm">
            View and manage the details of this order
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="type">Category</Label>
            <Input id="type" value={form.type} onChange={handleChange} />
            </div>
          <div className="grid gap-3">
            <Label htmlFor="status">Status</Label>
            <Input id="status" value={form.status} onChange={handleChange} />
            </div>
          <div className="grid gap-3">
            <Label htmlFor="target">Quantity (MT)</Label>
            <Input id="target" value={form.target} onChange={handleChange} />
            </div>
          <div className="grid gap-3">
            <Label htmlFor="limit">Price (USD/MT)</Label>
            <Input id="limit" value={form.limit} onChange={handleChange} />
            </div>
          <div className="grid gap-3">
            <Label htmlFor="origin">Origin</Label>
            <Input id="origin" value={form.origin} onChange={handleChange} />
          </div>
        </div>
        <SheetFooter>
          <Button type="button" onClick={handleSave}>Save</Button>
          <SheetClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const columns: ColumnDef<TableRow>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: "Product Name",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
      const status = row.original.status
      const statusColors = {
        "Delivered": {
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-800 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-800"
        },
        "Processing": {
          bg: "bg-amber-100 dark:bg-amber-900/30",
          text: "text-amber-800 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-800"
        },
        "On Hold": {
          bg: "bg-rose-100 dark:bg-rose-900/30",
          text: "text-rose-800 dark:text-rose-400",
          border: "border-rose-200 dark:border-rose-800"
        },
        "In Transit": {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-800"
        }
      };

      const colors = statusColors[status as keyof typeof statusColors] || {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-800 dark:text-gray-300",
        border: "border-gray-200 dark:border-gray-700"
      };

      return (
        <div 
          className={cn(
            "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium leading-4 whitespace-nowrap border",
            colors.bg,
            colors.text,
            colors.border
          )}
        >
          {status}
        </div>
      )
    },
  },
  {
    accessorKey: "target",
    header: "Quantity (MT)",
    cell: ({ row }) => {
      try {
        // Convert kg to MT (1 MT = 1000 kg)
        const quantityKg = parseInt(String(row.original.target).replace(/,/g, '')) || 0
        const quantityMt = quantityKg / 1000
        
        return (
          <div className="text-sm font-mono text-center w-full">
            {Math.round(quantityMt).toLocaleString()}
          </div>
        )
      } catch (error) {
        console.error('Error rendering quantity:', error)
        return <div className="text-sm text-muted-foreground">N/A</div>
      }
    },
  },
  {
    accessorKey: "limit",
    header: "Price (USD/MT)",
    cell: ({ row }) => {
      const price = parseFloat(row.original.limit)
      return (
        <div className="w-full text-center">
          <span className="font-mono text-sm font-medium">
            ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "origin",
    header: "Origin",
    cell: ({ row }) => {
      // List of countries with their codes and names
      const countries = [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'JP', name: 'Japan' },
        { code: 'CN', name: 'China' },
        { code: 'IN', name: 'India' },
        { code: 'BR', name: 'Brazil' },
        { code: 'AU', name: 'Australia' },
        { code: 'MX', name: 'Mexico' },
        { code: 'ES', name: 'Spain' },
        { code: 'IT', name: 'Italy' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'SE', name: 'Sweden' },
        { code: 'CH', name: 'Switzerland' },
        { code: 'SG', name: 'Singapore' },
        { code: 'KR', name: 'South Korea' },
        { code: 'AE', name: 'UAE' },
        { code: 'SA', name: 'Saudi Arabia' }
      ];

      // Get a consistent country based on the row index
      const country = countries[row.index % countries.length];
      
      return (
        <div className="flex items-center gap-2 w-full">
          <div className="size-5 rounded-full overflow-hidden border border-border flex-shrink-0">
            <Flag 
              country={country.code} 
              size={20} 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-medium truncate">
            {country.name}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <IconDotsVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View order details</DropdownMenuItem>
          <DropdownMenuItem>Contact supplier</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Cancel order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<TableRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: TableRow[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
                  </Button>
                </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                  {table
                    .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                  )
                })}
                </DropdownMenuContent>
              </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Section</span>
              </Button>
            </div>
          </div>

      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
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
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
          </div>

        <div className="flex items-center justify-between space-x-2 px-5">
          <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                <span className="sr-only">Go to next page</span>
                  <IconChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                <span className="sr-only">Go to last page</span>
                  <IconChevronsRight className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="past-performance"
        className="flex flex-col"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>

      <TabsContent 
        value="key-personnel" 
        className="flex flex-col"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>

      <TabsContent
        value="focus-documents"
        className="flex flex-col"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

export function NewRFQDialog() {
  const { isOpen, setIsOpen } = useRFQDialog()
  const [step, setStep] = React.useState(1)
  const [formData, setFormData] = React.useState({
    product: "",
    category: "",
    quantity: "",
    targetPrice: "",
    origin: "",
    deliveryPort: "",
    deliveryDate: undefined as Date | undefined,
    quality: "",
    incoterms: "",
    notes: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      console.log("Form submitted:", formData)
      // Add your API call or data handling logic here
      setIsOpen(false)
      setStep(1) // Reset step for next time
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, deliveryDate: date }))
  }

  const handleClose = () => {
    setIsOpen(false)
    setStep(1) // Reset step for next time
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline">New RFQ</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New RFQ - Step {step} of 3</DialogTitle>
            <DialogDescription>
              {step === 1 && "Enter basic information about your request."}
              {step === 2 && "Specify pricing and origin details."}
              {step === 3 && "Add additional requirements and notes."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {step === 1 && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="product">Product Name</Label>
                  <Input
                    id="product"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    placeholder="e.g. Wheat"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Grains"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="quantity">Quantity (MT)</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="targetPrice">Target Price (USD/MT)</Label>
                  <Input
                    id="targetPrice"
                    name="targetPrice"
                    type="number"
                    step="0.01"
                    value={formData.targetPrice}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="origin">Origin Preference</Label>
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="e.g. Canada, Australia"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="deliveryPort">Delivery Port/Location</Label>
                  <Input
                    id="deliveryPort"
                    name="deliveryPort"
                    value={formData.deliveryPort}
                    onChange={handleChange}
                    placeholder="e.g. Shanghai Port"
                    required
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="deliveryDate">Delivery Date/Timeline</Label>
                  <DatePicker
                    date={formData.deliveryDate}
                    onSelect={handleDateChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="quality">Quality/Grade Requirements</Label>
                  <Input
                    id="quality"
                    name="quality"
                    value={formData.quality}
                    onChange={handleChange}
                    placeholder="e.g. Grade 1"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="incoterms">Incoterms</Label>
                  <Input
                    id="incoterms"
                    name="incoterms"
                    value={formData.incoterms}
                    onChange={handleChange}
                    placeholder="e.g. FOB, CIF"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any other requirements"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
    </div>
            <Button type="submit">
              {step < 3 ? "Next" : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
