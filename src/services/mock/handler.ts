import {
  badRequest,
  createId,
  getBoardWithHydratedColumns,
  getCurrentUser,
  mockDb,
  notFound,
  success
} from "@/services/mock/db";

type Params = {
  path?: string[];
};

function readPath(params: Params) {
  return params.path ?? [];
}

function readJson(request: Request) {
  return request
    .json()
    .catch(() => ({})) as Promise<Record<string, unknown>>;
}

function json<T>(message: string, data: T, init?: ResponseInit) {
  return Response.json(success(message, data), init);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getStatusForColumn(columnId: string) {
  const column = mockDb.boards
    .flatMap((board) => board.columns)
    .find((item) => item.id === columnId);
  const value = `${column?.id ?? ""} ${column?.title ?? ""}`.toLowerCase();

  if (value.includes("complete") || value.includes("done")) return "DONE";
  if (value.includes("review")) return "REVIEW";
  if (value.includes("progress")) return "IN_PROGRESS";
  return "TODO";
}

export async function handleMockRequest(request: Request, params: Params) {
  const path = readPath(params);
  const [resource, second, third] = path;
  const method = request.method.toUpperCase();

  if (resource === "auth") {
    return handleAuth(method, second, request);
  }

  if (resource === "dashboard") {
    return handleDashboard(method);
  }

  if (resource === "workspaces") {
    return handleWorkspaces(method, second, request);
  }

  if (resource === "projects") {
    return handleProjects(method, second, third, request);
  }

  if (resource === "boards") {
    return handleBoards(method, second, third, request);
  }

  if (resource === "labels") {
    return handleLabels(method, second, third, request);
  }

  if (resource === "tasks") {
    return handleTasks(method, second, third, request);
  }

  if (resource === "comments") {
    return handleComments(method, second, third, request);
  }

  return notFound("Mock route not found");
}

function handleDashboard(method: string) {
  if (method !== "GET") {
    return notFound("Dashboard mock route not found");
  }

  const currentUser = getCurrentUser();
  const workspaces = mockDb.workspaces.filter((workspace) => !workspace.isDeleted);
  const workspaceIds = new Set(workspaces.map((workspace) => workspace.id));
  const boards = mockDb.boards.filter((board) => workspaceIds.has(board.workspace));
  const boardIds = new Set(boards.map((board) => board.id));
  const tasks = mockDb.tasks.filter(
    (task) => !task.isDeleted && boardIds.has(task.board)
  );
  const now = Date.now();
  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate).getTime() < now &&
      task.status !== "DONE"
  ).length;
  const myTasks = tasks.filter((task) =>
    task.assignees.some((assignee) =>
      typeof assignee === "string"
        ? assignee === currentUser.id
        : assignee.id === currentUser.id
    )
  ).length;
  const markedTasks = tasks.filter((task) =>
    task.markedBy.includes(currentUser.id)
  ).length;

  return json("Dashboard retrieved", {
    summary: {
      workspaces: workspaces.length,
      boards: boards.length,
      tasks: tasks.length,
      completedTasks,
      overdueTasks,
      myTasks,
      markedTasks
    },
    taskStatus: {
      TODO: tasks.filter((task) => task.status === "TODO").length,
      IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      REVIEW: tasks.filter((task) => task.status === "REVIEW").length,
      DONE: completedTasks
    },
    taskPriority: {
      LOW: tasks.filter((task) => task.priority === "LOW").length,
      MEDIUM: tasks.filter((task) => task.priority === "MEDIUM").length,
      HIGH: tasks.filter((task) => task.priority === "HIGH").length,
      URGENT: tasks.filter((task) => task.priority === "URGENT").length
    },
    recentTasks: tasks
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10)
      .map((task) => ({
        ...task,
        workspace: pickEntity(
          mockDb.workspaces.find((workspace) => workspace.id === task.workspace)
        ),
        board: pickEntity(mockDb.boards.find((board) => board.id === task.board)),
        labels: task.labels
          .map((labelId) => mockDb.labels.find((label) => label.id === labelId))
          .filter(Boolean)
          .map((label) => ({
            id: label!.id,
            _id: label!._id,
            name: label!.name,
            color: label!.color
          }))
      }))
  });
}

function pickEntity(entity: { id: string; _id: string; name: string } | undefined) {
  if (!entity) {
    return undefined;
  }

  return {
    id: entity.id,
    _id: entity._id,
    name: entity.name
  };
}

async function handleAuth(method: string, action: string | undefined, request: Request) {
  if (method === "POST" && (action === "login" || action === "register")) {
    const body = await readJson(request);
    const user =
      action === "register"
        ? {
            ...getCurrentUser(),
            name: String(body.name || getCurrentUser().name),
            email: String(body.email || getCurrentUser().email)
          }
        : getCurrentUser();

    return json(`${action} successful`, {
      user,
      accessToken: "mock-access-token"
    });
  }

  if (method === "POST" && action === "refresh-token") {
    return json("Token refreshed", {
      user: getCurrentUser(),
      accessToken: "mock-access-token"
    });
  }

  if (method === "POST" && action === "logout") {
    return json("Logged out", {});
  }

  return notFound("Auth mock route not found");
}

async function handleWorkspaces(
  method: string,
  workspaceId: string | undefined,
  request: Request
) {
  if (method === "GET" && !workspaceId) {
    return json("Workspaces retrieved", {
      workspaces: mockDb.workspaces.filter((workspace) => !workspace.isDeleted)
    });
  }

  if (method === "POST" && !workspaceId) {
    const body = await readJson(request);
    const id = createId();
    const now = new Date().toISOString();
    const workspace = {
      id,
      _id: id,
      name: String(body.name || "Untitled Workspace"),
      description: String(body.description || ""),
      slug: slugify(String(body.name || "workspace")),
      owner: getCurrentUser().id,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };
    mockDb.workspaces.unshift(workspace);
    return json("Workspace created", workspace, { status: 201 });
  }

  const workspace = mockDb.workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return notFound("Workspace not found");

  if (method === "GET") {
    return json("Workspace retrieved", workspace);
  }

  if (method === "PATCH") {
    const body = await readJson(request);
    Object.assign(workspace, body, { updatedAt: new Date().toISOString() });
    return json("Workspace updated", workspace);
  }

  if (method === "DELETE") {
    workspace.isDeleted = true;
    return json("Workspace deleted", {});
  }

  return notFound();
}

async function handleProjects(
  method: string,
  second: string | undefined,
  third: string | undefined,
  request: Request
) {
  if (method === "GET" && second === "workspace" && third) {
    return json("Projects retrieved", {
      projects: mockDb.projects.filter((project) => project.workspace === third)
    });
  }

  if (method === "POST" && !second) {
    const body = await readJson(request);
    const id = createId();
    const now = new Date().toISOString();
    const project = {
      id,
      _id: id,
      name: String(body.name || "Untitled Project"),
      description: String(body.description || ""),
      workspace: String(body.workspace || body.workspaceId),
      createdBy: getCurrentUser().id,
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now
    };
    mockDb.projects.unshift(project);
    return json("Project created", project, { status: 201 });
  }

  const project = mockDb.projects.find((item) => item.id === second);
  if (!project) return notFound("Project not found");

  if (method === "GET") {
    return json("Project retrieved", project);
  }

  return notFound();
}

async function handleBoards(
  method: string,
  second: string | undefined,
  third: string | undefined,
  request: Request
) {
  if (method === "GET" && second === "workspace" && third) {
    return json("Boards retrieved", {
      boards: mockDb.boards
        .filter((board) => board.workspace === third)
        .map(getBoardWithHydratedColumns)
    });
  }

  if (method === "POST" && !second) {
    const body = await readJson(request);
    const id = createId();
    const now = new Date().toISOString();
    const board = {
      id,
      _id: id,
      name: String(body.name || "Untitled Board"),
      description: String(body.description || ""),
      workspace: String(body.workspace || body.workspaceId),
      workspaceId: String(body.workspace || body.workspaceId),
      createdBy: getCurrentUser().id,
      status: "ACTIVE" as const,
      columns: ["To Do", "In Progress", "Complete"].map((title, index) => {
        const columnId = createId();
        return {
          id: columnId,
          _id: columnId,
          title,
          name: title,
          order: index
        };
      }),
      createdAt: now,
      updatedAt: now
    };
    mockDb.boards.unshift(board);
    return json("Board created", getBoardWithHydratedColumns(board), {
      status: 201
    });
  }

  const board = mockDb.boards.find((item) => item.id === second);
  if (!board) return notFound("Board not found");

  if (method === "GET") {
    return json("Board retrieved", getBoardWithHydratedColumns(board));
  }

  return notFound();
}

async function handleLabels(
  method: string,
  second: string | undefined,
  third: string | undefined,
  request: Request
) {
  if (method === "GET" && second === "workspace" && third) {
    return json("Labels retrieved", {
      labels: mockDb.labels.filter((label) => label.workspace === third)
    });
  }

  if (method === "POST" && !second) {
    const body = await readJson(request);
    const id = createId();
    const now = new Date().toISOString();
    const label = {
      id,
      _id: id,
      name: String(body.name || "Label"),
      color: String(body.color || "#000000"),
      workspace: String(body.workspace || body.workspaceId),
      createdAt: now,
      updatedAt: now
    };
    mockDb.labels.unshift(label);
    return json("Label created", label, { status: 201 });
  }

  const label = mockDb.labels.find((item) => item.id === second);
  if (!label) return notFound("Label not found");

  if (method === "PATCH") {
    const body = await readJson(request);
    Object.assign(label, body, { updatedAt: new Date().toISOString() });
    return json("Label updated", label);
  }

  if (method === "DELETE") {
    mockDb.labels = mockDb.labels.filter((item) => item.id !== second);
    mockDb.tasks.forEach((task) => {
      task.labels = task.labels.filter((labelId) => labelId !== second);
    });
    return json("Label deleted", {});
  }

  return notFound();
}

async function handleTasks(
  method: string,
  second: string | undefined,
  third: string | undefined,
  request: Request
) {
  const visibleTasks = () => mockDb.tasks.filter((task) => !task.isDeleted);

  if (method === "GET" && second === "column" && third) {
    return json("Tasks retrieved", {
      tasks: visibleTasks()
        .filter((task) => task.column === third)
        .sort((a, b) => a.order - b.order)
    });
  }

  if (method === "GET" && second === "my") {
    const { workspaceId, limit } = readTaskListQuery(request);
    return json("My tasks retrieved", {
      tasks: applyTaskListQuery(
        visibleTasks().filter((task) =>
          task.assignees.some((assignee) =>
            typeof assignee === "string"
              ? assignee === getCurrentUser().id
              : assignee.id === getCurrentUser().id
          )
        ),
        workspaceId,
        limit
      )
    });
  }

  if (method === "GET" && second === "recent") {
    const { workspaceId, limit } = readTaskListQuery(request);
    return json("Recent tasks retrieved", {
      tasks: applyTaskListQuery(
        visibleTasks().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        workspaceId,
        limit
      )
    });
  }

  if (method === "GET" && second === "marked") {
    const { workspaceId, limit } = readTaskListQuery(request);
    return json("Marked tasks retrieved", {
      tasks: applyTaskListQuery(
        visibleTasks().filter((task) =>
          task.markedBy.includes(getCurrentUser().id)
        ),
        workspaceId,
        limit
      )
    });
  }

  if (method === "POST" && !second) {
    const body = await readJson(request);
    const columnId = String(body.columnId || body.column);
    const tasksInColumn = visibleTasks().filter((task) => task.column === columnId);
    const id = createId();
    const now = new Date().toISOString();
    const task = {
      id,
      _id: id,
      title: String(body.title || "Untitled task"),
      description: String(body.description || ""),
      board: String(body.boardId || body.board),
      boardId: String(body.boardId || body.board),
      column: columnId,
      columnId,
      workspace: String(body.workspaceId || body.workspace),
      workspaceId: String(body.workspaceId || body.workspace),
      assignees: Array.isArray(body.assignees)
        ? body.assignees.map(String)
        : [],
      labels: Array.isArray(body.labels) ? body.labels.map(String) : [],
      markedBy: [],
      priority: String(body.priority || "MEDIUM") as
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "URGENT",
      status: getStatusForColumn(columnId) as
        | "TODO"
        | "IN_PROGRESS"
        | "REVIEW"
        | "DONE",
      dueDate: typeof body.dueDate === "string" ? body.dueDate : undefined,
      order:
        tasksInColumn.length === 0
          ? 0
          : Math.max(...tasksInColumn.map((item) => item.order)) + 1,
      createdBy: getCurrentUser(),
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };
    mockDb.tasks.unshift(task);
    return json("Task created", task, { status: 201 });
  }

  const task = mockDb.tasks.find((item) => item.id === second);
  if (!task) return notFound("Task not found");

  if (method === "PATCH" && third === "mark") {
    const body = await readJson(request);
    const marked = Boolean(body.marked);
    task.markedBy = marked
      ? Array.from(new Set([...task.markedBy, getCurrentUser().id]))
      : task.markedBy.filter((userId) => userId !== getCurrentUser().id);
    task.updatedAt = new Date().toISOString();
    return json("Task mark status updated", task);
  }

  if (method === "PATCH") {
    const body = await readJson(request);
    const columnId = String(body.columnId || body.column || task.column);
    Object.assign(task, {
      ...body,
      column: columnId,
      columnId,
      status: body.status ?? getStatusForColumn(columnId),
      updatedAt: new Date().toISOString()
    });
    return json("Task updated", task);
  }

  if (method === "DELETE") {
    task.isDeleted = true;
    task.updatedAt = new Date().toISOString();
    return json("Task deleted", {});
  }

  return notFound();
}

function readTaskListQuery(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId") ?? undefined;
  const limitValue = url.searchParams.get("limit");
  const limit = limitValue ? Number(limitValue) : undefined;

  return {
    workspaceId,
    limit: Number.isFinite(limit) ? limit : undefined
  };
}

function applyTaskListQuery<T extends { workspace: string }>(
  tasks: T[],
  workspaceId?: string,
  limit?: number
) {
  const filtered = workspaceId
    ? tasks.filter((task) => task.workspace === workspaceId)
    : tasks;

  return limit ? filtered.slice(0, limit) : filtered;
}

async function handleComments(
  method: string,
  second: string | undefined,
  third: string | undefined,
  request: Request
) {
  if (method === "GET" && second === "task" && third) {
    return json("Comments retrieved", {
      comments: mockDb.comments.filter(
        (comment) => comment.task === third && !comment.isDeleted
      )
    });
  }

  if (method === "POST" && !second) {
    const body = await readJson(request);

    if (!body.content || !body.taskId) {
      return badRequest("content and taskId are required");
    }

    const id = createId();
    const now = new Date().toISOString();
    const comment = {
      id,
      _id: id,
      content: String(body.content),
      task: String(body.taskId || body.task),
      taskId: String(body.taskId || body.task),
      user: getCurrentUser(),
      attachments: Array.isArray(body.attachments)
        ? body.attachments.map(String)
        : [],
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };
    mockDb.comments.push(comment);
    return json("Comment created", comment, { status: 201 });
  }

  return notFound();
}
