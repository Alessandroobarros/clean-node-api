import { Request, Response, NextFunction } from 'express'

export const cors = (req: Request, res: Response, next: NextFunction): void => {
  res.set('access-cors-allow-origin', '*')
  res.set('access-cors-allow-methods', '*')
  res.set('access-cors-allow-headers', '*')
  next()
}
