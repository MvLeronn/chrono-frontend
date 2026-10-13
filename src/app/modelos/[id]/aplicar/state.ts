import type { ApplyTemplateResponse } from "../../../../models/template";

export interface ApplyTemplateState {
  dateError?: string;
  message?: string;
  expired?: boolean;
  uncertain?: boolean;
  stale?: boolean;
  result?: ApplyTemplateResponse;
}
