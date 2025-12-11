import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
        return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const bytes = await (file as File).arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = (file as File).name.split(".").pop() || "bin";
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
}
