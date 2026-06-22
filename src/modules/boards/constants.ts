import type { BoardColumn } from "@/modules/boards/types";

export const defaultBoardColumns: BoardColumn[] = [
  { id: "todo", title: "To Do", order: 0, tasks: [] },
  { id: "in-progress", title: "In Progress", order: 1, tasks: [] },
  { id: "done", title: "Done", order: 2, tasks: [] }
];
