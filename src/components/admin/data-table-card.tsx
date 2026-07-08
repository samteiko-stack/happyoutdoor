import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableCardProps {
  title: string;
  description?: string;
  columns: string[];
  emptyMessage?: string;
  isEmpty?: boolean;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export function DataTableCard({
  title,
  description,
  columns,
  emptyMessage = "No data yet",
  isEmpty = false,
  children,
  headerActions,
  className,
}: DataTableCardProps) {
  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-foreground">{title}</CardTitle>
          {description && (
            <CardDescription className="text-muted-foreground">{description}</CardDescription>
          )}
        </div>
        {headerActions}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col} className="text-foreground">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function TableActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      {children}
    </div>
  );
}

export function TableRowDefault({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableRow className={cn("border-secondary/20", className)}>
      {children}
    </TableRow>
  );
}
