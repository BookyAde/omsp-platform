import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import {
  requireAdmin,
  badRequest,
  serverError,
} from "@/lib/server-utils";

export async function GET() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("gallery_items")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return serverError(error.message);
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = createAdminClient();
  const formData = await req.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const isFeatured = formData.get("is_featured") === "true";

  const files = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (!title || files.length === 0) {
    return badRequest("Title and at least one image are required.");
  }

  const publicUrls: string[] = [];

  for (const file of files) {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await admin.storage
      .from("omsp-gallery")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return serverError(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("omsp-gallery").getPublicUrl(filePath);

    publicUrls.push(publicUrl);
  }

  const { data, error } = await admin
    .from("gallery_items")
    .insert({
      title,
      description,
      category: category || "general",
      image_url: publicUrls[0],
      image_urls: publicUrls,
      is_published: true,
      is_featured: isFeatured,
    })
    .select()
    .single();

  if (error) {
    return serverError(error.message);
  }

  return NextResponse.json(data);
}