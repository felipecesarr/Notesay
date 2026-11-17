import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  void 0;

  try {
    // 1. Fetch all legacy CHAT notes
    const chatNotes = await prisma.note.findMany({
      where: {
        category: "CHAT",
      },
    });

    void 0;

    let migratedCount = 0;
    let errorCount = 0;

    for (const note of chatNotes) {
      try {
        // Check if already migrated (deduplication)
        const existingSession = await prisma.chatSession.findFirst({
            where: {
                userId: note.userId,
                createdAt: note.createdAt,
                title: note.title
            }
        });

        if (existingSession) {
            void 0;
            continue;
        }

        // 2. Parse content (JSON string of messages)
        const messages = JSON.parse(note.content);

        // 3. Create new ChatSession
        const session = await prisma.chatSession.create({
          data: {
            userId: note.userId,
            title: note.title,
            metadata: note.metadata, // Keep existing metadata
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          },
        });

        // 4. Create ChatMessages
        // Note: Legacy messages might not have 'sources' or 'feedbackId' populated consistently
        // We map them to the new schema
        if (Array.isArray(messages) && messages.length > 0) {
            await prisma.chatMessage.createMany({
                data: messages.map((msg: { role: "user" | "model" | "assistant"; content: string; sources?: unknown }) => ({
                    sessionId: session.id,
                    role: msg.role === "model" ? "assistant" : msg.role, // Ensure role matches enum if needed, or assume data is clean
                    content: msg.content,
                    sources: msg.sources ? JSON.stringify(msg.sources) : null,
                    // feedbackId: msg.feedbackId, // Can't easily link strict foreign keys if IDs don't exist in Feedback table
                    createdAt: session.createdAt, // Estimate timestamp as session start if missing
                })),
            });
        }

        migratedCount++;
        // Optional: Mark note as migrated? 
        // For now, we leave original data intact as requested ("cannot delete").
        void 0;

      } catch (err) {
        console.error("Notesay operation failed.");
        errorCount++;
      }
    }

    void 0;
    void 0;
    void 0;
    void 0;
    void 0;

  } catch (error) {
    console.error("Fatal migration error:");
  } finally {
    await prisma.$disconnect();
  }
}

main();
