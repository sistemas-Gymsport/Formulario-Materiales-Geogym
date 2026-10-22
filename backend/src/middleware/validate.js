import { badRequest } from '../utils/httpError.js';

export const parse = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      fields[key] ??= issue.message;
    }
    throw badRequest(Object.values(fields)[0] ?? 'Datos inválidos', { fields });
  }
  return result.data;
};

export const validate = (schemas) => (req, res, next) => {
  req.data = {};
  for (const [source, schema] of Object.entries(schemas)) {
    req.data[source] = parse(schema, req[source] ?? {});
  }
  next();
};
