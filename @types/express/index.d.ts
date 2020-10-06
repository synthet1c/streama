import Client from "../../src/server/classes/unused/Client";

declare namespace Express {
  export interface Request {
    client?: Client
  }
}

