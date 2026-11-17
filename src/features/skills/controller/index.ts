
"use server";

import { prisma } from "@/meetmate/services/db/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import { DEFAULT_SKILLS } from "../config/default-skills";
import { generateChatResponse } from "@/meetmate/services/ai/gemini";

/**
 * Generate a suitable icon for a skill using AI
 */
export async function generateSkillIcon(name: string, description: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) return { success: false, error: "Subscription required" };

    const availableIcons = [
      "Sparkles", "Brain", "Zap", "Target", "MessageCircle", "GraduationCap", 
      "Rocket", "Briefcase", "BookOpen", "HeartHandshake", "Award", "Coffee", 
      "Music", "Code", "Lightbulb", "Cake", "Star", "Users", "Globe", "Heart"
    ];

    const prompt = `You are a UI assistant. Select the single best icon from the following list to represent a skill named "${name}" with description "${description}".
    
Available Icons: ${availableIcons.join(", ")}

Return ONLY the icon name. Nothing else.`;

    const iconName = await generateChatResponse("You are a helper that selects icons.", prompt, 0.1);
    
    // Validate
    const cleanName = iconName?.trim().replace(/['"`]/g, "");
    const selected = availableIcons.find(i => i === cleanName) || "Sparkles";

    return { success: true, icon: selected };
  } catch (error) {
    console.error("Error generating icon:");
    return { success: false, error: "Failed to generate icon" };
  }
}

/**
 * Ensure user has default skills seeded
 * Called automatically when fetching skills
 */
export async function ensureDefaultSkills(userId: string) {
  const existingDefaults = await prisma.skill.count({
    where: { userId, isDefault: true }
  });

  if (existingDefaults === 0) {
    await prisma.skill.createMany({
      data: DEFAULT_SKILLS.map(skill => ({
        ...skill,
        userId,
        isDefault: true,
        interviewMode: skill.interviewMode || "ai-asks",
        contextSources: undefined
      }))
    });
  }
}

/**
 * Get all skills for the current user
 * Automatically seeds default skills if none exist
 */
export async function getUserSkills() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", skills: [] };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required", skills: [] };
    }

    const userId = session.user.id;
    
    // Ensure default skills exist
    await ensureDefaultSkills(userId);
    
    const skills = await prisma.skill.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" }, // Defaults first
        { createdAt: "desc" }
      ]
    });

    return { success: true, skills };
  } catch (error) {
    console.error("Error fetching skills:");
    return { success: false, error: "Failed to fetch skills", skills: [] };
  }
}

/**
 * Create a new custom skill
 */
export async function createSkill(data: {
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
  interviewMode?: "ai-asks" | "user-asks";
  contextSources?: Array<{
    type: "pdf" | "url" | "video";
    content: string;
    title: string;
  }>;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const skill = await prisma.skill.create({
      data: {
        ...data,
        userId: session.user.id,
        isDefault: false,
        interviewMode: data.interviewMode || "ai-asks",
        contextSources: data.contextSources || undefined
      }
    });

    return { success: true, skill };
  } catch (error) {
    console.error("Error creating skill:");
    return { success: false, error: "Failed to create skill" };
  }
}

/**
 * Update an existing skill
 */
export async function updateSkill(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    systemPrompt: string;
    icon: string;
    color: string;
    interviewMode: "ai-asks" | "user-asks";
    contextSources: Array<{
      type: "pdf" | "url" | "video";
      content: string;
      title: string;
    }>;
  }>
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill || skill.userId !== session.user.id) {
      return { success: false, error: "Not found" };
    }

    // Prevent editing default skills' core properties
    if (skill.isDefault) {
      // Only allow updating contextSources and interviewMode for default skills
      const updated = await prisma.skill.update({
        where: { id },
        data: {
          contextSources: (data.contextSources !== undefined ? data.contextSources : skill.contextSources) as Prisma.InputJsonValue,
          interviewMode: data.interviewMode !== undefined ? data.interviewMode : skill.interviewMode
        }
      });
      return { success: true, skill: updated };
    }

    const updated = await prisma.skill.update({
      where: { id },
      data
    });

    return { success: true, skill: updated };
  } catch (error) {
    console.error("Error updating skill:");
    return { success: false, error: "Failed to update skill" };
  }
}

/**
 * Delete a custom skill
 */
export async function deleteSkill(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill || skill.userId !== session.user.id) {
      return { success: false, error: "Not found" };
    }

    if (skill.isDefault) {
      return { success: false, error: "Cannot delete default skills" };
    }

    await prisma.skill.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Error deleting skill:");
    return { success: false, error: "Failed to delete skill" };
  }
}
