import { codeAnalyses, type CodeAnalysis, type InsertCodeAnalysis } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  createCodeAnalysis(analysis: InsertCodeAnalysis & { 
    qualityScore: number; 
    issues: any[]; 
    optimizedCode?: string;
  }): Promise<CodeAnalysis>;
  getCodeAnalysis(id: number): Promise<CodeAnalysis | undefined>;
  getRecentAnalyses(limit?: number): Promise<CodeAnalysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private analyses: Map<number, CodeAnalysis>;
  private currentUserId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.analyses = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCodeAnalysis(analysisData: InsertCodeAnalysis & { 
    qualityScore: number; 
    issues: any[]; 
    optimizedCode?: string;
  }): Promise<CodeAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: CodeAnalysis = {
      id,
      code: analysisData.code,
      language: analysisData.language,
      qualityScore: analysisData.qualityScore,
      issues: analysisData.issues,
      optimizedCode: analysisData.optimizedCode || null,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getCodeAnalysis(id: number): Promise<CodeAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async getRecentAnalyses(limit: number = 10): Promise<CodeAnalysis[]> {
    const analyses = Array.from(this.analyses.values());
    return analyses
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
