import { Request } from "express";
import { Users } from "./User";

export interface CustomRequest extends Request {
  user?: Users;
}
