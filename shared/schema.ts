import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const codeAnalyses = pgTable("code_analyses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  qualityScore: integer("quality_score").notNull(),
  issues: jsonb("issues").notNull(), // Array of analysis issues
  optimizedCode: text("optimized_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCodeAnalysisSchema = createInsertSchema(codeAnalyses).pick({
  code: true,
  language: true,
});

export const codeAnalysisRequestSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.enum(["javascript", "python", "typescript", "java"]),
});

export type InsertCodeAnalysis = z.infer<typeof insertCodeAnalysisSchema>;
export type CodeAnalysis = typeof codeAnalyses.$inferSelect;
export type CodeAnalysisRequest = z.infer<typeof codeAnalysisRequestSchema>;

export interface AnalysisIssue {
  type: "error" | "warning" | "suggestion" | "optimization";
  severity: "high" | "medium" | "low";
  line: number;
  message: string;
  category: string;
}

export interface AnalysisResult {
  qualityScore: number;
  issues: AnalysisIssue[];
  optimizedCode?: string;
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    suggestionCount: number;
    optimizationCount: number;
  };
}
