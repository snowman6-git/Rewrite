import axios from "axios";
import * as dotenv from "dotenv";

// hono
import { Context } from "hono";

export async function auto_report(c: Context) {
  const action = c.req.param("type");
  const { error, timestamp } = await c.req.json();

  // console.log(error, timestamp);

  switch (action) {
    case "try_catch": {
      return c.json({ status: "success" });
    }
  }
}
