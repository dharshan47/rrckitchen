import { v2 as cloudinary } from "cloudinary"
import { NextRequest, NextResponse } from "next/server"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { public_id } = await request.json() as { public_id: string }

    if (!public_id) {
      return NextResponse.json({ error: "Missing public_id" }, { status: 400 })
    }

    const result = await cloudinary.uploader.destroy(public_id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[Cloudinary] Delete failed:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
