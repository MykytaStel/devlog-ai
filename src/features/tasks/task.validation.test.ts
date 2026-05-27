import { describe, expect, it } from "vitest";

import { createTaskSchema, updateTaskSchema } from "./task.validation";

describe("task validation", () => {
  it("applies create defaults for status and priority", () => {
    const result = createTaskSchema.parse({
      title: "  Build task CRUD  ",
      description: "  Create, update, and delete persisted tasks.  ",
    });

    expect(result).toMatchObject({
      title: "Build task CRUD",
      description: "Create, update, and delete persisted tasks.",
      status: "todo",
      priority: "medium",
    });
  });

  it("does not inject create defaults into partial updates", () => {
    expect(updateTaskSchema.parse({ status: "done" })).toEqual({
      status: "done",
    });

    expect(updateTaskSchema.parse({ title: "  Rename task  " })).toEqual({
      title: "Rename task",
    });
  });

  it("rejects empty partial updates", () => {
    expect(() => updateTaskSchema.parse({})).toThrow(
      "At least one field is required"
    );
  });
});
