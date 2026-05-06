import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import {
  requireAdmin,
  serverError,
  notFound as notFoundResponse,
} from "@/lib/server-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = createAdminClient();

  let body: any;

  try {
    body = await req.json();
  } catch {
    return serverError("Invalid JSON body.");
  }

  const updatePayload = {
    ...body,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from("gallery_items")
    .update(updatePayload)
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) {
    return notFoundResponse("Gallery item not found.");
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = createAdminClient();

  const { data: existingItem, error: fetchError } = await admin
    .from("gallery_items")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !existingItem) {
    return notFoundResponse("Gallery item not found.");
  }

  const imageUrls: string[] =
    existingItem.image_urls && existingItem.image_urls.length > 0
      ? existingItem.image_urls
      : existingItem.image_url
      ? [existingItem.image_url]
      : [];

  const pathsToDelete = imageUrls
    .map((url) => {
      const splitPath = url.split(
        "/storage/v1/object/public/omsp-gallery/"
      )[1];

      return splitPath || null;
    })
    .filter(Boolean) as string[];

  if (pathsToDelete.length > 0) {
    await admin.storage.from("omsp-gallery").remove(pathsToDelete);
  }

  const { error } = await admin
    .from("gallery_items")
    .delete()
    .eq("id", params.id);

  if (error) {
    return serverError(error.message);
  }

  return NextResponse.json({ success: true });
}