import { Request } from "express";
import { UserResponse } from "./User";

export interface CustomRequest extends Request {
  user?: UserResponse;
}
