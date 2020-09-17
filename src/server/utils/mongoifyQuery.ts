const queries = {
  startsWith: (value) => ({ $regex: `^${value}` }),
  endsWith: (value) => ({ $regex: `${value}$` }),
  contains: (value) => ({ $regex: `[^\b]${value}[^\b]` }),
  in: (value) => ({ $in: value })
}

export const mongoifyQuery = (query) => {
  const acc = {}
  for (const [key, entries] of Object.entries(query)) {
    acc[key] = {}
    if (!(entries instanceof Object)) {
      acc[key] = { $eq: entries }
      continue
    }
    for (const [directive, value] of Object.entries(entries)) {
      if (typeof queries[directive] === 'function') {
        acc[key] = { ...acc[key], ...queries[directive](value) }
      }
    }
  }
  return acc
}
