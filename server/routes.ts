import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { codeAnalysisRequestSchema } from "@shared/schema";
import { analyzeCode } from "./services/ai-analysis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze code endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const validatedData = codeAnalysisRequestSchema.parse(req.body);
      const { code, language } = validatedData;

      // Analyze code using OpenAI
      const analysisResult = await analyzeCode(code, language);

      // Store analysis result
      const savedAnalysis = await storage.createCodeAnalysis({
        code,
        language,
        qualityScore: analysisResult.qualityScore,
        issues: analysisResult.issues,
        optimizedCode: analysisResult.optimizedCode,
      });

      res.json({
        id: savedAnalysis.id,
        ...analysisResult,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        message: (error as Error).message || "Failed to analyze code" 
      });
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getCodeAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ message: "Failed to retrieve analysis" });
    }
  });

  // Get recent analyses
  app.get("/api/analyses/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const analyses = await storage.getRecentAnalyses(limit);
      res.json(analyses);
    } catch (error) {
      console.error("Get recent analyses error:", error);
      res.status(500).json({ message: "Failed to retrieve recent analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
