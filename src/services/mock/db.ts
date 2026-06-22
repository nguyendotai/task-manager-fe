type MockUser = {
  id: string;
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarFallback: string;
};

type MockWorkspace = {
  id: string;
  _id: string;
  name: string;
  description?: string;
  slug: string;
  owner: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type MockProject = {
  id: string;
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  createdBy: string;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
};

export type MockColumn = {
  id: string;
  _id: string;
  title: string;
  name: string;
  order: number;
};

type MockBoard = {
  id: string;
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  workspaceId: string;
  project?: string;
  createdBy: string;
  status: "ACTIVE" | "ARCHIVED";
  columns: MockColumn[];
  createdAt: string;
  updatedAt: string;
};

type MockLabel = {
  id: string;
  _id: string;
  name: string;
  color: string;
  workspace: string;
  createdAt: string;
  updatedAt: string;
};

type MockTask = {
  id: string;
  _id: string;
  title: string;
  description?: string;
  board: string;
  boardId: string;
  column: string;
  columnId: string;
  workspace: string;
  workspaceId: string;
  assignees: Array<MockUser | string>;
  labels: string[];
  markedBy: string[];
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  dueDate?: string;
  order: number;
  createdBy: MockUser | string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type MockComment = {
  id: string;
  _id: string;
  content: string;
  task: string;
  taskId: string;
  user: MockUser | string;
  attachments: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MockDb = {
  users: MockUser[];
  workspaces: MockWorkspace[];
  projects: MockProject[];
  boards: MockBoard[];
  labels: MockLabel[];
  tasks: MockTask[];
  comments: MockComment[];
};

const ids = {
  user1: "64f000000000000000000001",
  user2: "64f000000000000000000002",
  user3: "64f000000000000000000003",
  workspace1: "65f000000000000000000001",
  project1: "66f000000000000000000001",
  board1: "67f000000000000000000001",
  todo: "68f000000000000000000001",
  progress: "68f000000000000000000002",
  review: "68f000000000000000000003",
  done: "68f000000000000000000004",
  labelUi: "69f000000000000000000001",
  labelBrand: "69f000000000000000000002",
  labelSocial: "69f000000000000000000003",
  task1: "70f000000000000000000001",
  task2: "70f000000000000000000002",
  task3: "70f000000000000000000003",
  task4: "70f000000000000000000004",
  comment1: "71f000000000000000000001",
  comment2: "71f000000000000000000002"
};

function now(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

export function createId() {
  const value = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return `${Date.now().toString(16).padStart(18, "0")}${value}`.slice(0, 24);
}

const users: MockUser[] = [
  {
    id: ids.user1,
    _id: ids.user1,
    name: "Linh Tran",
    email: "linh@design.test",
    avatarFallback: "LT"
  },
  {
    id: ids.user2,
    _id: ids.user2,
    name: "Minh Pham",
    email: "minh@design.test",
    avatarFallback: "MP"
  },
  {
    id: ids.user3,
    _id: ids.user3,
    name: "An Nguyen",
    email: "an@design.test",
    avatarFallback: "AN"
  }
];

const columns: MockColumn[] = [
  { id: ids.todo, _id: ids.todo, title: "To Do", name: "To Do", order: 0 },
  {
    id: ids.progress,
    _id: ids.progress,
    title: "In Progress",
    name: "In Progress",
    order: 1
  },
  {
    id: ids.review,
    _id: ids.review,
    title: "Need Review",
    name: "Need Review",
    order: 2
  },
  {
    id: ids.done,
    _id: ids.done,
    title: "Complete",
    name: "Complete",
    order: 3
  }
];

function withTasks(column: MockColumn, tasks: MockTask[]) {
  return {
    ...column,
    tasks: tasks.filter((task) => task.column === column.id && !task.isDeleted)
  };
}

export const mockDb: MockDb = {
  users,
  workspaces: [
    {
      id: ids.workspace1,
      _id: ids.workspace1,
      name: "Design Team",
      description:
        "A focused workspace for brand systems, UI design, campaign assets, and launch planning.",
      slug: "design-team",
      owner: ids.user1,
      isDeleted: false,
      createdAt: now(-18),
      updatedAt: now(-1)
    }
  ],
  projects: [
    {
      id: ids.project1,
      _id: ids.project1,
      name: "Brand Redesign",
      description:
        "Refresh the visual identity, social templates, landing pages, and product UI language.",
      workspace: ids.workspace1,
      createdBy: ids.user1,
      status: "ACTIVE",
      createdAt: now(-12),
      updatedAt: now(-1)
    }
  ],
  boards: [
    {
      id: ids.board1,
      _id: ids.board1,
      name: "Sprint Board",
      description:
        "Two-week sprint board for the redesign launch and production handoff.",
      workspace: ids.workspace1,
      workspaceId: ids.workspace1,
      project: ids.project1,
      createdBy: ids.user1,
      status: "ACTIVE",
      columns,
      createdAt: now(-10),
      updatedAt: now(-1)
    }
  ],
  labels: [
    {
      id: ids.labelUi,
      _id: ids.labelUi,
      name: "UI",
      color: "#dc2626",
      workspace: ids.workspace1,
      createdAt: now(-10),
      updatedAt: now(-10)
    },
    {
      id: ids.labelBrand,
      _id: ids.labelBrand,
      name: "Brand",
      color: "#7c3aed",
      workspace: ids.workspace1,
      createdAt: now(-10),
      updatedAt: now(-10)
    },
    {
      id: ids.labelSocial,
      _id: ids.labelSocial,
      name: "Social",
      color: "#0891b2",
      workspace: ids.workspace1,
      createdAt: now(-9),
      updatedAt: now(-9)
    }
  ],
  tasks: [
    {
      id: ids.task1,
      _id: ids.task1,
      title: "UI Design",
      description:
        "Create high-fidelity screens for dashboard cards, task drawers, and responsive Kanban states.",
      board: ids.board1,
      boardId: ids.board1,
      column: ids.todo,
      columnId: ids.todo,
      workspace: ids.workspace1,
      workspaceId: ids.workspace1,
      assignees: [users[0]],
      labels: [ids.labelUi],
      markedBy: [ids.user1],
      priority: "HIGH",
      status: "TODO",
      dueDate: now(4),
      order: 0,
      createdBy: users[0],
      isDeleted: false,
      createdAt: now(-3),
      updatedAt: now(-1)
    },
    {
      id: ids.task2,
      _id: ids.task2,
      title: "Social Media Template",
      description:
        "Build reusable post and story templates for the launch campaign.",
      board: ids.board1,
      boardId: ids.board1,
      column: ids.progress,
      columnId: ids.progress,
      workspace: ids.workspace1,
      workspaceId: ids.workspace1,
      assignees: [users[1]],
      labels: [ids.labelSocial, ids.labelBrand],
      markedBy: [],
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      dueDate: now(6),
      order: 0,
      createdBy: users[0],
      isDeleted: false,
      createdAt: now(-2),
      updatedAt: now(-1)
    },
    {
      id: ids.task3,
      _id: ids.task3,
      title: "Redesign Logo",
      description:
        "Explore updated logo lockups, sizing rules, monochrome variants, and usage examples.",
      board: ids.board1,
      boardId: ids.board1,
      column: ids.review,
      columnId: ids.review,
      workspace: ids.workspace1,
      workspaceId: ids.workspace1,
      assignees: [users[2]],
      labels: [ids.labelBrand],
      markedBy: [ids.user1],
      priority: "URGENT",
      status: "REVIEW",
      dueDate: now(2),
      order: 0,
      createdBy: users[1],
      isDeleted: false,
      createdAt: now(-5),
      updatedAt: now(-1)
    },
    {
      id: ids.task4,
      _id: ids.task4,
      title: "Brand Guidelines PDF",
      description:
        "Package typography, color, spacing, and component examples into a polished handoff document.",
      board: ids.board1,
      boardId: ids.board1,
      column: ids.done,
      columnId: ids.done,
      workspace: ids.workspace1,
      workspaceId: ids.workspace1,
      assignees: [],
      labels: [ids.labelBrand],
      markedBy: [],
      priority: "LOW",
      status: "DONE",
      dueDate: now(-1),
      order: 0,
      createdBy: users[2],
      isDeleted: false,
      createdAt: now(-7),
      updatedAt: now(-1)
    }
  ],
  comments: [
    {
      id: ids.comment1,
      _id: ids.comment1,
      content: "The dashboard card treatment is approved. Please keep the red accent restrained.",
      task: ids.task1,
      taskId: ids.task1,
      user: users[1],
      attachments: [],
      isDeleted: false,
      createdAt: now(-1),
      updatedAt: now(-1)
    },
    {
      id: ids.comment2,
      _id: ids.comment2,
      content: "I added logo spacing notes for the review session.",
      task: ids.task3,
      taskId: ids.task3,
      user: users[2],
      attachments: [],
      isDeleted: false,
      createdAt: now(-1),
      updatedAt: now(-1)
    }
  ]
};

export function getCurrentUser() {
  return mockDb.users[0];
}

export function getBoardWithHydratedColumns(board: MockBoard) {
  return {
    ...board,
    columns: board.columns.map((column) => withTasks(column, mockDb.tasks))
  };
}

export function success<T>(message: string, data: T) {
  return {
    success: true,
    message,
    data
  };
}

export function notFound(message = "Not found") {
  return Response.json(
    {
      success: false,
      message,
      data: null
    },
    { status: 404 }
  );
}

export function badRequest(message = "Bad request") {
  return Response.json(
    {
      success: false,
      message,
      data: null
    },
    { status: 400 }
  );
}
