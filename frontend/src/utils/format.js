export function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function truncate(value, size) {
  if (value.length <= size) {
    return value;
  }

  return `${value.slice(0, size).trim()}...`;
}
