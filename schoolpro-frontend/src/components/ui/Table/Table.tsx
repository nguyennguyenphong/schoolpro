import { Table as AntTable } from "antd";
import type { TableProps } from "@/components/ui/Table/types";
import { tableStyles } from "@/components/ui/Table/styles";

export const Table = <RecordType extends object = any>({
  style,
  ...props
}: TableProps<RecordType>) => {
  return (
    <AntTable<RecordType>
      {...props}
      style={{
        ...tableStyles,
        ...style,
      }}
    />
  );
};

Table.displayName = "Table";
Table.SELECTION_COLUMN = AntTable.SELECTION_COLUMN;
Table.EXPAND_COLUMN = AntTable.EXPAND_COLUMN;
Table.SELECTION_ALL = AntTable.SELECTION_ALL;
Table.SELECTION_INVERT = AntTable.SELECTION_INVERT;
Table.SELECTION_NONE = AntTable.SELECTION_NONE;
Table.Column = AntTable.Column;
Table.ColumnGroup = AntTable.ColumnGroup;
Table.Summary = AntTable.Summary;
