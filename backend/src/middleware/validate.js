import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";

export default function validate(schema) {
  return (req, _res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = result.body;
      req.validated = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, "Validation failed", error.flatten()));
      }

      return next(error);
    }
  };
}
