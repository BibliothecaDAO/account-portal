import type { BridgeRealm } from "@/types/ark";
import type { ColumnDef, Table as ReactTable } from "@tanstack/react-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRealmCount } from "@/lib/realms/inventory-ui";
import { flexRender } from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";

import RealmResources from "./realm-resources";

export const columns: ColumnDef<BridgeRealm>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <label className="flex size-6 items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </label>
    ),
    cell: ({ row }) => (
      <Checkbox
        className="ml-1"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "token_id",
    header: "ID",
    cell: ({ row }) => <div>{row.getValue("token_id")}</div>,
  },

  {
    accessorKey: "name",
    header: () => <div className="">Name</div>,
    cell: ({ row }) => {
      return (
        <div className="font-medium whitespace-nowrap">
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "attributes",
    header: () => <div className="">Resources</div>,
    cell: ({ row }) => {
      return (
        <div className="font-medium whitespace-nowrap">
          {row.getValue("attributes") ? (
            <RealmResources traits={row.getValue("attributes")} />
          ) : null}
        </div>
      );
    },
  },
];

interface BridgeTableProps {
  table: ReactTable<BridgeRealm>;
  status?: "ready" | "loading" | "error";
  emptyMessage: string;
  onRetry?: () => void;
}

export const BridgeTable: React.FC<BridgeTableProps> = ({
  table,
  status = "ready",
  emptyMessage,
  onRetry,
}) => {
  if (status === "error") {
    return (
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertTitle>Your Realms could not be loaded</AlertTitle>
        <AlertDescription>
          <span>
            Your on-chain Realms are safe.
            <Button
              variant="link"
              className="h-auto min-h-6 px-1 py-0"
              onClick={onRetry}
            >
              Try again
            </Button>
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-w-0">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {status === "loading" ? (
              Array.from({ length: 5 }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, columnIndex) => (
                    <TableCell key={column.id ?? columnIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    row.toggleSelected();
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {formatRealmCount(table.getFilteredRowModel().rows.length)} selected
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};
