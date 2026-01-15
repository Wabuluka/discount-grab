import { NextFunction, Request, Response } from "express";
import config from "../config";
import * as authService from "../service/auth.service";

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie("rt", token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
    domain: config.cookieDomain,
  });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role } = req.body;
    const { user, access, refresh } = await authService.register(
      email,
      password,
      name,
      role
    );
    setRefreshCookie(res, refresh);
    res.status(201).json({ accessToken: access, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = { ua: req.headers["user-agent"], ip: req.ip };
    const { email, password } = req.body;
    const { user, access, refresh } = await authService.login(
      email,
      password,
      ctx
    );
    setRefreshCookie(res, refresh);
    res.json({ accessToken: access, user });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rt = req.cookies?.rt as string | undefined;
    if (!rt || !req.user)
      return res.status(401).json({ message: "Unauthorized" });
    const ctx = { ua: req.headers["user-agent"], ip: req.ip };
    const { access, refresh } = await authService.refreshTokens(
      String(req.user.id),
      rt,
      ctx
    );
    setRefreshCookie(res, refresh);
    res.json({ accessToken: access });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("rt", {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "strict",
    domain: config.cookieDomain,
  });
  res.status(204).send();
};
