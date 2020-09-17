import { Request, Response } from 'express';

/**
 * authenticate
 * @param levels  allowed level that the user must possess to view the route
 */
export function authenticate(...levels: number[]) {

  return async function(req: Request, res: Response, next) {
    const user = req.session.user

    // use must be logged in and have access
    if (user && (!levels.length || await user.hasAccess(levels))) {
      return next();
    }
    res
      .status(401)
      .json({
        success: false,
        message: `Please login to continue`,
        code: 421,
        status: 401,
      });
  };
}
