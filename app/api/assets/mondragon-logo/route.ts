import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const logoPath = join(process.cwd(), "app", "assets", "logos", "mondragon_logo.avif");
    const fileBuffer = await readFile(logoPath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/avif",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("No se pudo servir mondragon_logo.avif", error);
    return NextResponse.json({ error: "Logo no disponible" }, { status: 404 });
  }
}
