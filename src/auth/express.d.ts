import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // You can define a more specific type for `user` if needed
    }
  }
}
