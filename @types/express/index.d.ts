import Client from "../../src/server/classes/Client";

declare namespace Express {
  export interface Request {
    client?: Client
  }
}

