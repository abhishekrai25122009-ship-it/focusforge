import { GoogleGenAI } from "@google/genai";
import { Task } from "@/types/focus";

// Maximum number of tasks we'll consider in a single planning request.
// Prevents oversized prompts and runaway model output.
const MAX_TASKS = 50;

// Minimum and maximum study-time target (minutes).
const MIN_STUDY_MINUTES = 5;
const MAX_STUDY_MINUTES = 480; // 8 hours

// Maximum number of retry attempts for transient provider errors.
const MAX_RETRIES = 3;

// Initial delay in ms between retries; doubles with each retry.
const RETRY_DELAY_MS = 1000;

interface PlannedTask {
  taskId: string;
  durationMinutes: number;
  order: number;
  reason: string;
}

/**
 * Builds the system + user prompt for the model. It restricts the model to
 * only suggesting plans over the supplied task IDs and never inventing tasks.
 */
function buildPrompt(tasks: Task[], targetMinutes: number): string {
  const taskList = tasks
    .map(
      (t) =>
        `- id: ${t.id}\n  title: ${t.title}\n  subject: ${t.subject}\n  priority: ${t.priority}\n  estimatedPomodoros: ${t.estimatedPomodoros}\n  dueDate: ${t.dueDate ?? "none"}\n  completed: ${t.completed}`
    )
    .join("\n\n");

  return `You are a study-planning assistant. Given a list of existing tasks and a target study time in minutes, produce a study plan consisting ONLY of tasks from the provided list. Do not invent new tasks. Do not modify any task's title, subject, priority, or estimatedPomodoros.

Available tasks (only these task IDs may appear in your plan):
${taskList}

Target study time: ${targetMinutes} minutes.

Return a JSON object with exactly this shape:
{
  "tasks": [
    {
      "taskId": "<one of the task ids above>",
      "durationMinutes": <number of minutes to spend, positive integer, sum across all items <= targetMinutes>,
      "order": <1-based sequence number, starting at 1>,
      "reason": "<short reason, max 80 characters>"
    }
  ]
}

Constraints:
- Each taskId must appear at most once in the list.
- Each durationMinutes must be a positive integer.
- The sum of all durationMinutes must not exceed ${targetMinutes}.
- Order must start at 1 and increment by 1 for each item.
- Only include tasks that are realistically completable within the time budget.
- Do not include any text outside the JSON object.
`;
}

/**
 * Validates that the model's response conforms to our expectations and that
 * every referenced task ID actually exists in the provided task list.
 */
function validatePlan(parsed: unknown, tasks: Task[], targetMinutes: number): PlannedTask[] {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid AI response: expected an object");
  }

  const data = parsed as { tasks?: unknown };
  if (!Array.isArray(data.tasks)) {
    throw new Error("Invalid AI response: missing tasks array");
  }

  const taskIds = new Set(tasks.map((t) => t.id));
  const seenIds = new Set<string>();

  const result: PlannedTask[] = [];
  let totalMinutes = 0;

  for (const item of data.tasks) {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid AI response: task item is not an object");
    }

    const taskItem = item as Record<string, unknown>;

    if (typeof taskItem.taskId !== "string") {
      throw new Error("Invalid AI response: missing taskId");
    }
    if (!taskIds.has(taskItem.taskId)) {
      throw new Error(`Invalid AI response: unknown taskId ${taskItem.taskId}`);
    }
    if (seenIds.has(taskItem.taskId)) {
      throw new Error(`Invalid AI response: duplicate taskId ${taskItem.taskId}`);
    }
    seenIds.add(taskItem.taskId);

    if (typeof taskItem.durationMinutes !== "number" || !Number.isInteger(taskItem.durationMinutes) || taskItem.durationMinutes <= 0) {
      throw new Error(`Invalid AI response: invalid durationMinutes for task ${taskItem.taskId}`);
    }

    if (typeof taskItem.order !== "number" || !Number.isInteger(taskItem.order) || taskItem.order <= 0) {
      throw new Error(`Invalid AI response: invalid order for task ${taskItem.taskId}`);
    }

    if (typeof taskItem.reason !== "string" || taskItem.reason.length === 0 || taskItem.reason.length > 80) {
      throw new Error(`Invalid AI response: invalid reason for task ${taskItem.taskId}`);
    }

    totalMinutes += taskItem.durationMinutes;
    result.push({
      taskId: taskItem.taskId,
      durationMinutes: taskItem.durationMinutes,
      order: taskItem.order,
      reason: taskItem.reason,
    });
  }

  if (totalMinutes > targetMinutes) {
    throw new Error("Invalid AI response: total duration exceeds target minutes");
  }

  return result;
}

/**
 * Reads the HTTP status code the provider reported for a failed request, if any.
 */
function getProviderErrorStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) {
    return undefined;
  }
  const candidate = err as { status?: unknown; statusCode?: unknown };
  const status = candidate.status ?? candidate.statusCode;
  return typeof status === "number" ? status : undefined;
}

/**
 * Determines whether an error represents a transient failure worth retrying.
 */
function isRetryableError(err: unknown): boolean {
  const statusCode = getProviderErrorStatus(err);
  return statusCode === 429 || statusCode === 503 || statusCode === 502 || statusCode === 504;
}

/**
 * Delay for the specified number of milliseconds.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deterministic fallback planner: builds a plan from existing tasks without
 * calling any external AI service. Only includes incomplete tasks.
 */
function generateFallbackPlan(tasks: Task[], targetMinutes: number): PlannedTask[] {
  // Only incomplete tasks.
  const incompleteTasks = tasks.filter((t) => !t.completed);

  // Sort by priority: high first, then medium, then low.
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const sorted = [...incompleteTasks].sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 3;
    const pB = priorityOrder[b.priority] ?? 3;
    return pA - pB;
  });

  const result: PlannedTask[] = [];
  let totalMinutes = 0;

  for (const task of sorted) {
    if (totalMinutes >= targetMinutes) break;

    const duration = task.estimatedPomodoros * 25; // 25 minutes per pomodoro
    if (totalMinutes + duration <= targetMinutes) {
      result.push({
        taskId: task.id,
        durationMinutes: duration,
        order: result.length + 1,
        reason: `Estimated ${task.estimatedPomodoros} pomodoro(s) for ${task.subject.toLowerCase()}`,
      });
      totalMinutes += duration;
    }
  }

  return result;
}

export async function POST(req: Request): Promise<Response> {
  // Read API key ONLY from server environment. Never expose to client.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI provider is not configured. Set GEMINI_API_KEY to use the planner." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { tasks, targetMinutes } = body as { tasks?: unknown; targetMinutes?: unknown };

  if (!Array.isArray(tasks)) {
    return new Response(JSON.stringify({ error: "Missing tasks array" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (typeof targetMinutes !== "number" || !Number.isInteger(targetMinutes) || targetMinutes < MIN_STUDY_MINUTES || targetMinutes > MAX_STUDY_MINUTES) {
    return new Response(
      JSON.stringify({ error: `targetMinutes must be an integer between ${MIN_STUDY_MINUTES} and ${MAX_STUDY_MINUTES}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const validTasks = tasks.filter((t): t is Task =>
    typeof t === "object" &&
    t !== null &&
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.subject === "string" &&
    typeof t.subjectColor === "string" &&
    typeof t.priority === "string" &&
    typeof t.completed === "boolean" &&
    typeof t.dueTime === "string" &&
    typeof t.estimatedPomodoros === "number"
  );

  if (validTasks.length === 0) {
    return new Response(JSON.stringify({ tasks: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (validTasks.length > MAX_TASKS) {
    return new Response(
      JSON.stringify({ error: `Too many tasks: ${validTasks.length}. Maximum ${MAX_TASKS} tasks allowed per request.` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const genai = new GoogleGenAI({ apiKey });

  const prompt = buildPrompt(tasks as Task[], targetMinutes);

  let result: string | undefined;

  // Retry with backoff for transient provider errors.
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await genai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });
      result = response.text;
      break; // Success — exit retry loop.
    } catch (err) {
      // Only retry on transient errors (429, 502, 503, 504).
      if (isRetryableError(err) && attempt < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      // Non-retryable error or final attempt — break out to handle below.
      break;
    }
  }

  // All retries exhausted — fall back to deterministic local planner.
  if (!result) {
    const fallbackTasks = generateFallbackPlan(tasks as Task[], targetMinutes);
    return new Response(JSON.stringify({ tasks: fallbackTasks }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  let parsed: unknown;
  try {
    if (!result) {
      throw new Error("AI provider returned empty response");
    }
    parsed = JSON.parse(result);
  } catch {
    return new Response(JSON.stringify({ error: "AI provider returned invalid JSON" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  let planned: PlannedTask[];
  try {
    planned = validatePlan(parsed, tasks as Task[], targetMinutes);
  } catch (err) {
    return new Response(JSON.stringify({ error: `AI provider returned invalid plan: ${err instanceof Error ? err.message : "Unknown error"}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ tasks: planned }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}