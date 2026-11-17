import { NextRequest, NextResponse } from "next/server";
import {
  getUserSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/features/skills/controller";

export async function GET() {
  const result = await getUserSkills();
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "Unauthorized" ? 401 : 500 }
    );
  }

  return NextResponse.json(result.skills);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createSkill(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 500 }
      );
    }

    return NextResponse.json(result.skill);
  } catch (error) {
    console.error("Error in POST /api/skills:");
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const result = await updateSkill(id, data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : result.error === "Not found" ? 404 : 500 }
      );
    }

    return NextResponse.json(result.skill);
  } catch (error) {
    console.error("Error in PUT /api/skills:");
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteSkill(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : result.error === "Not found" ? 404 : 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/skills:");
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
