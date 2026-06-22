import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fwdProto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : new URL(req.url).origin;
  const res = NextResponse.redirect(new URL("/admin/login", origin), 303);
  res.cookies.set("ds_admin", "", { path: "/", maxAge: 0 });
  return res;
}
