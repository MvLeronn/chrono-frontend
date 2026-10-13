import type { ActivityType, EventResponse } from "./calendar";

export interface TemplateItemInput {
  weekday: number;
  type: ActivityType;
  title: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
}

export interface CreateTemplateInput {
  name: string;
  items: TemplateItemInput[];
}

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export interface ApplyTemplateInput {
  weekStart: string;
}

export interface ApplyTemplateResponse {
  id: string;
  weekStart: string;
  alreadyApplied: boolean;
  events: EventResponse[];
}

export interface TemplateItemResponse extends TemplateItemInput {
  id: string;
  templateId: string;
}

export interface TemplateResponse {
  id: string;
  userId: string;
  name: string;
  archivedAt: null;
  createdAt: string;
  updatedAt: string;
  items: TemplateItemResponse[];
}

export interface TemplateListResponse {
  items: TemplateResponse[];
  total: number;
  page: number;
  limit: number;
}
