"use server"

import prisma from "@/lib/prisma"

export async function submitContactForm(data: {
  fullName: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  await prisma.contactMessage.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
    },
  })

  return { success: true, message: "Thank you for reaching out! We'll get back to you within 24 hours." }
}
