import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status: 400 }
  );
}

export function notFound(message = "Resource not found") {
  return NextResponse.json(
    {
      error: message,
    },
    { status: 404 }
  );
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json(
    {
      error: message,
    },
    { status: 403 }
  );
}

export function serverError(error: unknown) {
  console.error(error);

  return NextResponse.json(
    {
      error: "Internal server error",
    },
    { status: 500 }
  );
}

export function zodError(error: ZodError) {
  return badRequest(
    "Validation failed",
    error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }))
  );
}

function prismaError(error: Prisma.PrismaClientKnownRequestError) {
  if (error.code === "P2025") {
    return notFound("Task not found");
  }

  if (error.code === "P2003" || error.code === "P2014") {
    return badRequest("Related task does not exist");
  }

  return null;
}

export function routeError(error: unknown) {
  if (error instanceof ZodError) {
    return zodError(error);
  }

  if (error instanceof Error && error.message === "Task not found") {
    return notFound("Task not found");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const response = prismaError(error);

    if (response) {
      return response;
    }
  }

  return serverError(error);
}
